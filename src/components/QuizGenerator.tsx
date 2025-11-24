import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles, Loader2, CheckCircle, XCircle, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export function QuizGenerator() {
  const [isOpen, setIsOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [questionCount, setQuestionCount] = useState('5');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setQuiz([]);
    setUserAnswers({});
    setShowResults(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          topic: topic.trim(),
          difficulty,
          questionCount: parseInt(questionCount),
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to generate quiz');
        }
        throw error;
      }

      setQuiz(data.quiz);
      toast.success('Quiz generated!');
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length !== quiz.length) {
      toast.error('Please answer all questions');
      return;
    }
    setShowResults(true);
    const correct = quiz.filter((q, i) => userAnswers[i] === q.correctAnswer).length;
    toast.success(`You got ${correct} out of ${quiz.length} correct!`);
  };

  const handleReset = () => {
    setQuiz([]);
    setUserAnswers({});
    setShowResults(false);
  };

  const score = showResults 
    ? quiz.filter((q, i) => userAnswers[i] === q.correctAnswer).length 
    : 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-6">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">AI Quiz Generator</h3>
            </div>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-4">
          {!quiz.length && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Enter topic (e.g., World War II, Calculus)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    disabled={isGenerating}
                  />
                </div>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2 flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {quiz.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-lg">{topic}</h4>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{difficulty}</Badge>
                    <Badge variant="outline">{quiz.length} Questions</Badge>
                    {showResults && (
                      <Badge className="bg-primary">
                        Score: {score}/{quiz.length}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  New Quiz
                </Button>
              </div>

              {quiz.map((question, qIndex) => (
                <div key={qIndex} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-sm">Q{qIndex + 1}.</span>
                    <p className="font-medium flex-1">{question.question}</p>
                  </div>

                  <div className="space-y-2 ml-6">
                    {question.options.map((option, oIndex) => {
                      const isSelected = userAnswers[qIndex] === oIndex;
                      const isCorrect = question.correctAnswer === oIndex;
                      const showCorrect = showResults && isCorrect;
                      const showIncorrect = showResults && isSelected && !isCorrect;

                      return (
                        <button
                          key={oIndex}
                          onClick={() => handleAnswerSelect(qIndex, oIndex)}
                          disabled={showResults}
                          className={`w-full text-left px-4 py-2 rounded-md border transition-colors ${
                            showCorrect
                              ? 'bg-green-50 border-green-500 text-green-900'
                              : showIncorrect
                              ? 'bg-red-50 border-red-500 text-red-900'
                              : isSelected
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {showCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {showIncorrect && <XCircle className="h-4 w-4 text-red-600" />}
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="ml-6 mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {!showResults && (
                <Button onClick={handleSubmit} className="w-full">
                  Submit Quiz
                </Button>
              )}
            </div>
          )}

          {!quiz.length && !isGenerating && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Enter a topic to generate an AI-powered quiz based on your notes and common knowledge
            </p>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
