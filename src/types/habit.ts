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
  logs: HabitLog[];
  currentStreak: number;
  bestStreak: number;
  completionPercentage: number;
}
