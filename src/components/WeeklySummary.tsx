import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, Target, Clock, Calendar } from 'lucide-react';
import { WeeklySummary as WeeklySummaryType, Task } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeeklySummaryProps {
  tasks: Task[];
}

export function WeeklySummary({ tasks }: WeeklySummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<WeeklySummaryType | null>(null);

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return { weekStart, weekEnd };
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const { weekStart, weekEnd } = getWeekDates();
      
      // Check if summary already exists for this week
      const { data: existingSummary } = await supabase
        .from('weekly_summaries')
        .select('*')
        .eq('week_start', weekStart.toISOString().split('T')[0])
        .single();

      if (existingSummary) {
        setSummary({
          id: existingSummary.id,
          weekStart: existingSummary.week_start,
          weekEnd: existingSummary.week_end,
          summary: existingSummary.summary,
          insights: existingSummary.insights as any,
          createdAt: existingSummary.created_at,
        });
        return;
      }

      // Generate new summary
      const { data, error } = await supabase.functions.invoke('generate-weekly-summary', {
        body: { 
          tasks: tasks.map(t => ({
            title: t.title,
            category: t.category,
            progress: t.progress,
            completed: t.completed,
            priority: t.priority,
            totalTimeSpent: t.totalTimeSpent,
            dueDate: t.dueDate,
          })),
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to generate summary');
        }
        throw error;
      }

      setSummary(data.summary);
      toast.success('Weekly summary generated!');
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const { weekStart, weekEnd } = getWeekDates();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">AI Weekly Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>

        {summary && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Text */}
            <div className="space-y-2">
              <h4 className="font-medium">Overview</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {summary.summary}
              </p>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-2xl font-bold">{summary.insights.totalCompleted}</p>
              </Card>

              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">Time Spent</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.floor(summary.insights.totalTimeSpent / 3600)}h
                </p>
              </Card>

              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Active Days</span>
                </div>
                <p className="text-2xl font-bold">{summary.insights.productiveDays}</p>
              </Card>

              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Top Category</span>
                </div>
                <Badge className="text-xs">{summary.insights.topCategory}</Badge>
              </Card>
            </div>

            {/* Suggestions */}
            {summary.insights.suggestions && summary.insights.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <ul className="space-y-2">
                  {summary.insights.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!summary && !isGenerating && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Click "Generate Summary" to get AI-powered insights about your week
          </p>
        )}
      </div>
    </Card>
  );
}
