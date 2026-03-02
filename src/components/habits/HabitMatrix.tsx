"use client";

import { Habit } from "@/types/habit";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface HabitMatrixProps {
  habits: Habit[];
  onToggleLog: (habitId: string, date: Date, isCompleted: boolean) => void;
  loadingHabitId: string | null;
}

export function HabitMatrix({ habits, onToggleLog, loadingHabitId }: HabitMatrixProps) {
  // Generate last 14 days for the matrix
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = subDays(today, 13);
  
  const days = eachDayOfInterval({ start: startDate, end: today });

  const getLogForDate = (habit: Habit, date: Date) => {
    return habit.logs.find(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === date.getDate() && 
             logDate.getMonth() === date.getMonth() && 
             logDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="min-w-max border border-border rounded-2xl bg-card overflow-hidden">
        {/* Header Row */}
        <div className="flex items-center border-b border-border bg-muted/30">
          <div className="w-48 shrink-0 px-4 py-3 font-semibold text-sm text-muted-foreground border-r border-border sticky left-0 bg-card z-10">
            Habit
          </div>
          <div className="flex-1 flex">
            {days.map((day) => (
              <div key={day.toISOString()} className="w-12 shrink-0 flex flex-col items-center justify-center py-2 border-r border-border last:border-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(day, "EEE")}</span>
                <span className={`text-xs font-semibold ${day.getTime() === today.getTime() ? 'text-primary' : 'text-foreground'}`}>
                  {format(day, "d")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Habits Rows */}
        <div className="flex flex-col">
          {habits.length === 0 ? (
             <div className="p-8 text-center text-sm text-muted-foreground">No habits found. Generate a baseline or add one.</div>
          ) : habits.map((habit, idx) => (
            <div key={habit.id} className={`flex items-center ${idx !== habits.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/10 transition-colors`}>
              <div className="w-48 shrink-0 px-4 py-3 font-medium text-sm text-foreground border-r border-border sticky left-0 bg-card z-10 flex items-center justify-between">
                <span className="truncate pr-2">{habit.title}</span>
              </div>
              <div className="flex-1 flex">
                {days.map((day) => {
                  const log = getLogForDate(habit, day);
                  const isCompleted = log?.isCompleted ?? false;
                  const isLoading = loadingHabitId === `${habit.id}-${day.getTime()}`;

                  return (
                    <div key={day.toISOString()} className="w-12 shrink-0 flex items-center justify-center border-r border-border last:border-0 h-12">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        disabled={isLoading}
                        onClick={() => onToggleLog(habit.id, day, !isCompleted)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                          isLoading ? 'opacity-50' : ''
                        } ${
                          isCompleted 
                            ? 'bg-primary text-primary-foreground border-transparent shadow-[0_0_10px_rgba(217,119,6,0.3)]' 
                            : 'bg-transparent border-2 border-muted-foreground/30 hover:border-primary/50'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                        ) : isCompleted ? (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        ) : null}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
