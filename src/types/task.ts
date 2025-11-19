export type TaskCategory = 'homework' | 'revision' | 'projects' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  progress: number;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  tags?: Tag[];
  totalTimeSpent?: number; // in seconds
  estimatedTime?: number; // in hours
  attachments?: string[]; // URLs
  recurringType?: RecurringType;
  recurringEndDate?: string;
  subtasks?: Subtask[];
  dependencies?: string[]; // task IDs this task depends on
  notes?: string; // quick notes for the task
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

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  orderIndex: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  taskId?: string;
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  id: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  insights: {
    totalCompleted: number;
    totalTimeSpent: number;
    productiveDays: number;
    topCategory: string;
    suggestions: string[];
  };
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

export const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-800',
  high: 'bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800',
};
