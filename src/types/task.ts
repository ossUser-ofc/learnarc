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
  tags?: Tag[];
  totalTimeSpent?: number; // in seconds
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TaskTag {
  id: string;
  taskId: string;
  tagId: string;
  createdAt: string;
}

export interface AIAnalysis {
  id: string;
  taskId: string;
  analysisType: string;
  inputData: any;
  result: {
    analysis: string;
    estimatedHours: number;
    tips: string[];
    priority: 'low' | 'medium' | 'high';
    subtasks?: string[];
  };
  model: string;
  createdAt: string;
}

export interface TimeSession {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  notes?: string;
  createdAt: string;
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
