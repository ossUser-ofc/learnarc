import { MarkdownRenderer } from './MarkdownRenderer';

interface TaskDescriptionDisplayProps {
  description?: string;
  className?: string;
}

export function TaskDescriptionDisplay({ description, className = '' }: TaskDescriptionDisplayProps) {
  if (!description) return null;

  return (
    <div className={className}>
      <MarkdownRenderer content={description} />
    </div>
  );
}
