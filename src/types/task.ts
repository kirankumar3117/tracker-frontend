export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  isRevenueGenerator: boolean;
  status: TaskStatus;
  date: string | Date;
  category?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
