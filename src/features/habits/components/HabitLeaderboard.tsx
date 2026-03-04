"use client";

import { Habit } from "@/features/habits/types/habit";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface HabitLeaderboardProps {
  habits: Habit[];
  selectedMonth: number;
  selectedYear: number;
}

export function HabitLeaderboard({ habits, selectedMonth, selectedYear }: HabitLeaderboardProps) {
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);
  const daysInMonth = endDate.getDate();

  // Dynamically compute the month's stats instead of using the global mockData ones
  const dynamicHabits = habits.map(habit => {
    let activeDaysCount = 0;
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(selectedYear, selectedMonth, i);
        let isActive = true;
        if (habit.frequency && !habit.frequency.includes(d.getDay())) isActive = false;
        
        const compareTime = d.getTime();
        if (isActive && habit.duration === "1-week") {
            const start = new Date(habit.createdAt); start.setHours(0,0,0,0);
            const end = new Date(start); end.setDate(end.getDate() + 6);
            if (compareTime < start.getTime() || compareTime > end.getTime()) isActive = false;
        } else if (isActive && habit.duration === "custom" && habit.customStartDate && habit.customEndDate) {
            const start = new Date(habit.customStartDate); start.setHours(0,0,0,0);
            const end = new Date(habit.customEndDate); end.setHours(0,0,0,0);
            if (compareTime < start.getTime() || compareTime > end.getTime()) isActive = false;
        }
        if (isActive) activeDaysCount++;
    }

    const monthLogs = habit.logs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
    const completedInMonth = monthLogs.filter(l => l.isCompleted).length;
    const completionPercentage = activeDaysCount > 0 ? Math.round((completedInMonth / activeDaysCount) * 100) : 0;

    // As requested: "the streak should be total number of days working overall that selected month"
    // Keeping the flame icon design but changing the underlying math
    const currentStreak = completedInMonth;

    return { ...habit, completionPercentage, currentStreak };
  });

  // Sort dynamically
  const sortedHabits = [...dynamicHabits].sort((a, b) => {
    if (b.completionPercentage !== a.completionPercentage) {
      return b.completionPercentage - a.completionPercentage;
    }
    return b.currentStreak - a.currentStreak;
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 w-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Consistency Leaderboard</h3>
          <p className="text-xs text-muted-foreground font-medium">Ranked by {daysInMonth}-day performance</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {sortedHabits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No data to rank.</p>
        ) : (
          sortedHabits.map((habit, idx) => (
            <motion.div 
              key={habit.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border hover:bg-accent/50 transition-colors gap-3 overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className={`shrink-0 w-6 text-center font-black text-sm ${idx === 0 ? 'text-primary drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]' : 'text-muted-foreground'}`}>
                  #{idx + 1}
                </span>
                <span className="font-semibold text-sm text-foreground truncate block">
                  {habit.title}
                </span>
              </div>
              <div className="flex items-center justify-end shrink-0 gap-3 sm:gap-5 pl-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                  <span className="text-xs font-bold text-muted-foreground">
                    {habit.completionPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1.5 shrink-0 w-[42px]">
                  <Flame className={`w-3.5 h-3.5 ${habit.currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-bold ${habit.currentStreak > 0 ? 'text-orange-500' : 'text-foreground'}`}>
                    {habit.currentStreak}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
