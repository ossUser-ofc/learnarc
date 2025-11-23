import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { category } = await req.json();

    // Get user's school settings for context
    const { data: settings } = await supabase
      .from('user_settings')
      .select('current_school, target_university, education_level')
      .eq('user_id', user.id)
      .single();

    // Get all notes for this category
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .eq('folder', category)
      .order('created_at', { ascending: false });

    // Get tasks for this category with time data
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        *,
        task_time_sessions(duration_seconds)
      `)
      .eq('user_id', user.id)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate average time spent per task in this category
    let totalTime = 0;
    let taskCount = 0;
    const timeHistory: number[] = [];

    if (tasks) {
      tasks.forEach(task => {
        if (task.task_time_sessions && task.task_time_sessions.length > 0) {
          const taskTotal = task.task_time_sessions.reduce((sum: number, session: any) => 
            sum + (session.duration_seconds || 0), 0);
          if (taskTotal > 0) {
            totalTime += taskTotal;
            timeHistory.push(taskTotal / 3600); // Convert to hours
            taskCount++;
          }
        }
      });
    }

    const avgTimeHours = taskCount > 0 ? totalTime / (taskCount * 3600) : 0;

    // Build context-aware prompt
    let schoolContext = '';
    if (settings?.current_school || settings?.target_university) {
      schoolContext = `Student context: Currently attending ${settings.current_school || 'high school'}, aiming for ${settings.target_university || 'college'}. Education level: ${settings.education_level || 'high_school'}.`;
    }

    const prompt = `You are an AI study advisor analyzing notes and study patterns for the "${category}" subject.

${schoolContext}

Historical time data:
- Average time per task: ${avgTimeHours.toFixed(2)} hours
- Recent sessions (hours): ${timeHistory.slice(0, 5).join(', ')}
- Total tasks analyzed: ${taskCount}

Notes summary:
${notes?.slice(0, 5).map((note: any) => `- ${note.title}: ${note.content.substring(0, 200)}`).join('\n')}

Based on the student's academic level, goals, historical performance, and note content, provide:

1. **Topic Analysis**: Key themes and areas of focus in their notes
2. **Time Estimate**: Suggested study time for next session (consider the trend in time history)
3. **Difficulty Assessment**: Rate the complexity for their level
4. **Study Strategy**: Personalized recommendations considering their academic goals
5. **Progress Insights**: Patterns in their learning approach

Format as JSON:
{
  "analysis": "detailed topic analysis",
  "estimatedHours": number (based on historical average and trends),
  "difficulty": "beginner|intermediate|advanced",
  "strategy": ["tip1", "tip2", "tip3"],
  "insights": "progress observations",
  "timeReasoning": "explanation of time estimate"
}`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI for topic analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert educational AI advisor. Provide detailed, actionable study guidance.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    // Store analysis
    await supabase.from('ai_analysis').insert({
      user_id: user.id,
      analysis_type: 'topic_analysis',
      input_data: { category, noteCount: notes?.length || 0, taskCount },
      result: analysis,
      model: 'google/gemini-2.5-flash'
    });

    console.log('Topic analysis completed successfully');
    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-notes-by-topic:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
