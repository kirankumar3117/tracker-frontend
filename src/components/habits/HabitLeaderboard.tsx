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

  return (
    <div className="bg-card border border-border rounded-2xl p-5 w-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Consistency Leaderboard</h3>
          <p className="text-xs text-muted-foreground font-medium">Ranked by 30-day performance</p>
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
              className="flex items-center justify-between p-3 rounded-xl bg-background border border-border"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  #{idx + 1}
                </span>
                <span className="font-semibold text-sm text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                  {habit.title}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 min-w-[3rem]">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">
                    {habit.completionPercentage}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5 w-12 justify-end">
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
