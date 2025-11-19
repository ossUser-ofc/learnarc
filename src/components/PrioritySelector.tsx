import { TaskPriority, priorityLabels, priorityColors } from '@/types/task';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrioritySelectorProps {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
  disabled?: boolean;
}

export function PrioritySelector({ value, onChange, disabled }: PrioritySelectorProps) {
  const priorities: TaskPriority[] = ['low', 'medium', 'high'];
  
  const getIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return <ArrowDown className="h-3 w-3" />;
      case 'medium': return <AlertCircle className="h-3 w-3" />;
      case 'high': return <ArrowUp className="h-3 w-3" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="gap-2">
          {getIcon(value)}
          <span className="text-xs">{priorityLabels[value]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <div className="space-y-1">
          {priorities.map((priority) => (
            <button
              key={priority}
              onClick={() => onChange(priority)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                "hover:bg-muted",
                value === priority && "bg-muted"
              )}
            >
              {getIcon(priority)}
              <span className="flex-1 text-left">{priorityLabels[priority]}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const getIcon = (p: TaskPriority) => {
    switch (p) {
      case 'low': return <ArrowDown className="h-3 w-3" />;
      case 'medium': return <AlertCircle className="h-3 w-3" />;
      case 'high': return <ArrowUp className="h-3 w-3" />;
    }
  };

  return (
    <Badge className={cn('gap-1', priorityColors[priority])}>
      {getIcon(priority)}
      {priorityLabels[priority]}
    </Badge>
  );
}
