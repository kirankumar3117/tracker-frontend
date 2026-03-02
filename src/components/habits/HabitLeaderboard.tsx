"use client";

import { Habit } from "@/types/habit";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface HabitLeaderboardProps {
  habits: Habit[];
}

export function HabitLeaderboard({ habits }: HabitLeaderboardProps) {
  // Sort habits by completion percentage, then by streak
  const sortedHabits = [...habits].sort((a, b) => {
    if (b.completionPercentage !== a.completionPercentage) {
      return b.completionPercentage - a.completionPercentage;
    }
    return b.currentStreak - a.currentStreak;
  });

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

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
