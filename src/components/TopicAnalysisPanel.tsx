import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sparkles, Loader2, Clock, Brain, Lightbulb, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoryLabels } from '@/types/task';

interface TopicAnalysis {
  analysis: string;
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  strategy: string[];
  insights: string;
  timeReasoning: string;
}

export function TopicAnalysisPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [analysis, setAnalysis] = useState<TopicAnalysis | null>(null);

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-700 border-green-200',
    intermediate: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-500/10 text-red-700 border-red-200',
  };

  const handleAnalyze = async () => {
    if (!selectedCategory) {
      toast.error('Please select a subject');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-notes-by-topic', {
        body: { category: selectedCategory },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to analyze topic');
        }
        throw error;
      }

      setAnalysis(data.analysis);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error analyzing topic:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-6">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Topic Analysis</h3>
            </div>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">

        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select subject..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedCategory}
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
                Analyze
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4 animate-fade-in">
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Difficulty Level:</span>
              <Badge className={difficultyColors[analysis.difficulty]}>
                {analysis.difficulty}
              </Badge>
            </div>

            {/* Time Estimate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Suggested study time:</span>
                <span className="font-medium">{analysis.estimatedHours.toFixed(1)} hours</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{analysis.timeReasoning}</p>
            </div>

            {/* Analysis */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Topic Analysis</span>
              </div>
              <MarkdownRenderer content={analysis.analysis} />
            </div>

            {/* Study Strategy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Recommended Strategy</span>
              </div>
              <MarkdownRenderer 
                content={analysis.strategy.map((tip: string) => `- ${tip}`).join('\n')}
                className="text-sm"
              />
            </div>

            {/* Insights */}
            {analysis.insights && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Progress Insights</span>
                </div>
                <MarkdownRenderer content={analysis.insights} />
              </div>
            )}
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Select a subject and click "Analyze" to get AI-powered insights with time estimates based on your study history
          </p>
        )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
