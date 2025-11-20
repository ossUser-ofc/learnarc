import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Clock, Target, Lightbulb, ListChecks } from 'lucide-react';
import { Task, AIAnalysis } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AIAnalysisPanelProps {
  task: Task;
}

export function AIAnalysisPanel({ task }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis['result'] | null>(null);

  const priorityColors = {
    low: 'bg-green-500/10 text-green-700 border-green-200',
    medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    high: 'bg-red-500/10 text-red-700 border-red-200',
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-task', {
        body: {
          taskId: task.id,
          title: task.title,
          description: task.description,
          category: task.category,
          progress: task.progress,
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to analyze task');
        }
        throw error;
      }

      setAnalysis(data.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing task:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">AI Study Assistant</h3>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            size="sm"
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Task
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4 animate-fade-in">
            {/* Priority */}
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Priority:</span>
              <Badge className={cn('capitalize', priorityColors[analysis.priority])}>
                {analysis.priority}
              </Badge>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated time:</span>
              <span className="font-medium">{analysis.estimatedHours} hours</span>
            </div>

            {/* Analysis */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Analysis</span>
              </div>
              <MarkdownRenderer content={analysis.analysis} />
            </div>

            {/* Study Tips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Study Tips</span>
              </div>
              <ul className="space-y-2">
                {analysis.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtasks */}
            {analysis.subtasks && analysis.subtasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Suggested Breakdown</span>
                </div>
                <ul className="space-y-2">
                  {analysis.subtasks.map((subtask, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-medium">{index + 1}.</span>
                      <span>{subtask}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click "Analyze Task" to get AI-powered study insights and recommendations
          </p>
        )}
      </div>
    </Card>
  );
}
