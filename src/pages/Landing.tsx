import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Brain, Calendar, BarChart3, MessageSquare, Tags, Clock } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description: "Get intelligent insights on your study patterns and time management with AI analysis by subject and topic."
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "AI Conversation",
      description: "Chat with AI to get study advice, task suggestions, and personalized recommendations based on your goals."
    },
    {
      icon: <Tags className="h-8 w-8" />,
      title: "Smart Organization",
      description: "Organize tasks with tags, categories, and priorities. AI analyzes your notes by tag to provide targeted insights."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Multiple Views",
      description: "Switch between Kanban boards, calendar, timeline, and list views to manage tasks your way."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Time Tracking",
      description: "Track time spent on tasks and get AI-powered estimates based on your historical performance."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Progress Analytics",
      description: "Visualize your progress with charts, weekly summaries, and personalized performance insights."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            learnarc
          </h1>
          <p className="text-2xl text-muted-foreground mb-4">
            Your AI-Powered Study Companion
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track homework, revisions, and study sessions with intelligent AI analysis. 
            Get personalized insights, time estimates, and study recommendations tailored to your academic goals.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Succeed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 px-6 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Study Habits?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join students who are using AI-powered insights to achieve their academic goals.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8"
          >
            Start Learning Smarter
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 learnarc. Licensed under CC BY-NC-SA 4.0.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
