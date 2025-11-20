import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks, weekStart, weekEnd } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Calculate insights
    const completedTasks = tasks.filter((t: any) => t.completed);
    const totalTimeSpent = tasks.reduce((sum: number, t: any) => sum + (t.totalTimeSpent || 0), 0);
    
    // Find most productive days (tasks with progress)
    const daysWorked = new Set(
      tasks
        .filter((t: any) => t.totalTimeSpent > 0)
        .map((t: any) => new Date(t.dueDate || weekStart).toDateString())
    ).size;

    // Find top category
    const categoryCount: Record<string, number> = {};
    tasks.forEach((t: any) => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'homework';

    // Generate AI summary with markdown support
    const prompt = `You are a study productivity assistant. Analyze this week's study data and provide a comprehensive summary using **markdown formatting**.

Week: ${new Date(weekStart).toLocaleDateString()} to ${new Date(weekEnd).toLocaleDateString()}

Tasks Data:
- Total tasks: ${tasks.length}
- Completed: ${completedTasks.length}
- In progress: ${tasks.length - completedTasks.length}
- Total study time: ${Math.floor(totalTimeSpent / 3600)} hours ${Math.floor((totalTimeSpent % 3600) / 60)} minutes
- Active study days: ${daysWorked}
- Most common category: ${topCategory}

Task details:
${tasks.slice(0, 10).map((t: any) => `- ${t.title} (${t.category}, ${t.priority} priority, ${t.progress}% complete)`).join('\n')}

Provide a response using markdown formatting:
1. **## Week Overview** - A 2-3 sentence overview using bold text and headers
2. **## Key Achievements** - Bullet list of accomplishments
3. **## Recommendations** - 3-5 specific, numbered recommendations for next week

Use markdown headers (##), **bold text**, bullet points (-), and proper formatting. Be encouraging and constructive.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful study productivity assistant that uses markdown formatting.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiData = await response.json();
    const summaryText = aiData.choices[0].message.content;

    // Parse suggestions from AI response
    const suggestions: string[] = [];
    const lines = summaryText.split('\n');
    let inRecommendations = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('suggestion')) {
        inRecommendations = true;
        continue;
      }
      if (inRecommendations && line.trim().match(/^[-•\d.]/)) {
        suggestions.push(line.trim().replace(/^[-•\d.]\s*/, ''));
      }
    }

    const insights = {
      totalCompleted: completedTasks.length,
      totalTimeSpent,
      productiveDays: daysWorked,
      topCategory,
      suggestions: suggestions.length > 0 ? suggestions : [
        'Continue maintaining consistent study habits',
        'Focus on breaking larger tasks into smaller subtasks',
        'Use the timer feature to track actual study time',
      ],
    };

    // Store in database
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedSummary, error: dbError } = await supabase
      .from('weekly_summaries')
      .insert({
        week_start: new Date(weekStart).toISOString().split('T')[0],
        week_end: new Date(weekEnd).toISOString().split('T')[0],
        summary: summaryText,
        insights,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        summary: {
          id: savedSummary.id,
          weekStart: savedSummary.week_start,
          weekEnd: savedSummary.week_end,
          summary: savedSummary.summary,
          insights: savedSummary.insights,
          createdAt: savedSummary.created_at,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
