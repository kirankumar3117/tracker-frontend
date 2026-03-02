import { Habit, HabitLog } from "@/types/habit";

function generateMockLogs(habitId: string, prob: number, days: number = 30): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    logs.push({
      id: `log-${habitId}-${i}`,
      habitId,
      date: d.toISOString(),
      isCompleted: Math.random() < prob,
    });
  }
  return logs;
}

function computeMetrics(logs: HabitLog[]) {
  let currentStreak = 0;
  let bestStreak = 0;
  let currentRun = 0;
  let completedCount = 0;

  // sort logs by date ascending
  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (const log of sorted) {
    if (log.isCompleted) {
      completedCount++;
      currentRun++;
      if (currentRun > bestStreak) bestStreak = currentRun;
    } else {
      currentRun = 0;
    }
  }
  
  // current streak (start from end and go backward)
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].isCompleted) {
      currentStreak++;
    } else {
      break;
    }
  }

  const completionPercentage = sorted.length ? Math.round((completedCount / sorted.length) * 100) : 0;

  return { currentStreak, bestStreak, completionPercentage };
}

const mockBaseHabits: Array<{ id: string, title: string, prob: number, priority: "High" | "Medium" | "Low", duration: "1-week" | "all-time" | "custom", frequency?: number[] }> = [
  { id: "mock-1", title: "Running", prob: 0.6, priority: "High", duration: "all-time" },
  { id: "mock-2", title: "Gym / Workout", prob: 0.8, priority: "Medium", duration: "all-time" },
  { id: "mock-3", title: "DSA Problem Solving", prob: 0.9, priority: "High", duration: "all-time" },
  { id: "mock-4", title: "Read technical documentation", prob: 0.5, priority: "Low", duration: "1-week" },
  { id: "mock-5", title: "Deep Work (2 hours)", prob: 0.7, priority: "High", duration: "all-time" },
  { id: "mock-6", title: "Review 1 Open Source PR", prob: 0.4, priority: "Medium", duration: "1-week" },
];

export const MOCK_HABITS: Habit[] = mockBaseHabits.map((h) => {
  const logs = generateMockLogs(h.id, h.prob, 30);
  const metrics = computeMetrics(logs);
  return {
    id: h.id,
    userId: "local-user",
    title: h.title,
    priority: h.priority,
    duration: h.duration,
    frequency: h.frequency || [0, 1, 2, 3, 4, 5, 6],
    customStartDate: h.duration === 'custom' ? new Date().toISOString() : undefined,
    customEndDate: h.duration === 'custom' ? new Date(Date.now() + 86400000 * 3).toISOString() : undefined,
    createdAt: new Date().toISOString(),
    logs,
    ...metrics,
  };
});

export function recalculateAllMetrics(habit: Habit): Habit {
  const metrics = computeMetrics(habit.logs);
  return {
    ...habit,
    ...metrics
  };
}

export function loadHabitsFromLocal(): Habit[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("tracker-mock-habits");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((h: any) => ({
        ...h,
        priority: h.priority || "Medium",
        duration: h.duration || "all-time",
        frequency: h.frequency || [0, 1, 2, 3, 4, 5, 6]
      }));
    }
  }
  return MOCK_HABITS;
}

export function saveHabitsToLocal(habits: Habit[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("tracker-mock-habits", JSON.stringify(habits));
  }
}
