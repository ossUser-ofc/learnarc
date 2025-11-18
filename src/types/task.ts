export type TaskCategory = 'homework' | 'revision' | 'projects' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  progress: number;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
}

export const categoryLabels: Record<TaskCategory, string> = {
  homework: 'Homework',
  revision: 'Revision',
  projects: 'Projects',
  other: 'Other',
};

export const categoryColors: Record<TaskCategory, string> = {
  homework: 'bg-homework text-homework-foreground',
  revision: 'bg-revision text-revision-foreground',
  projects: 'bg-projects text-projects-foreground',
  other: 'bg-other text-other-foreground',
};
