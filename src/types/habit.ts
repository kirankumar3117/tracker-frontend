export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  priority: "High" | "Medium" | "Low";
  duration: "1-week" | "all-time" | "custom";
  customStartDate?: string;
  customEndDate?: string;
  frequency?: number[]; // [0,1,2,3,4,5,6] exactly matches date.getDay()
  logs: HabitLog[];
  currentStreak: number;
  bestStreak: number;
  completionPercentage: number;
}
