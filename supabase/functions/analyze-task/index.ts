import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { taskId, title, description, category, progress, totalTimeSpent } = await req.json();

    console.log('Analyzing task:', { taskId, title, category, progress, totalTimeSpent });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create Supabase client with service role for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch completion history for this user's tasks with the same title
    const { data: historyData } = await supabase
      .from('task_completion_history')
      .select('*')
      .eq('task_title', title)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10);

    let historyContext = '';
    if (historyData && historyData.length > 0) {
      const avgTime = historyData.reduce((sum, h) => sum + h.actual_time, 0) / historyData.length;
      const lastTime = historyData[0].actual_time;
      historyContext = `\n\nHistorical data for this task:
- Average completion time: ${Math.round(avgTime / 60)} minutes
- Last completion time: ${Math.round(lastTime / 60)} minutes
- Times completed: ${historyData.length}
${totalTimeSpent ? `- Current time spent: ${Math.round(totalTimeSpent / 60)} minutes` : ''}`;
    }

    // Prepare the analysis prompt
    const systemPrompt = `You are an AI study assistant that helps students analyze their homework and revision tasks. Provide actionable insights, study tips, time estimates, and suggestions for improvement. Use markdown formatting for better readability. When historical data is available, provide specific insights about performance trends.`;
    
    const userPrompt = `Analyze this study task:
Title: ${title}
Description: ${description || 'No description provided'}
Category: ${category}
Current Progress: ${progress}%${historyContext}

Please provide:
1. A detailed analysis of the task complexity and scope (use markdown formatting with headers, bold, lists)
2. Estimated time to complete (in hours)
3. 3-5 specific study tips or strategies for this task (use markdown lists)
4. Priority level recommendation (low, medium, high)
5. Suggested breakdown into smaller subtasks if applicable
6. If historical data is available, compare current performance to past performance and provide specific insights (e.g., "This task typically takes 6 minutes but you completed it in 4 minutes - that's 33% faster!")

Format your response with markdown for the analysis field. Use JSON with these fields: analysis (markdown string), estimatedHours, tips (array), priority, subtasks (array).`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'analyze_task',
            description: 'Analyze a study task and provide insights',
            parameters: {
              type: 'object',
              properties: {
                analysis: { type: 'string' },
                estimatedHours: { type: 'number' },
                tips: {
                  type: 'array',
                  items: { type: 'string' }
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'medium', 'high']
                },
                subtasks: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['analysis', 'estimatedHours', 'tips', 'priority'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'analyze_task' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_task') {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Store the analysis in the database with user_id
    const { error: insertError } = await supabase
      .from('ai_analysis')
      .insert({
        task_id: taskId,
        user_id: user.id,
        analysis_type: 'task_analysis',
        input_data: { title, description, category, progress },
        result: result,
        model: 'google/gemini-2.5-flash'
      });

    if (insertError) {
      console.error('Error storing analysis:', insertError);
      throw insertError;
    }

    console.log('Analysis stored successfully');

    return new Response(JSON.stringify({ success: true, analysis: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-task function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
