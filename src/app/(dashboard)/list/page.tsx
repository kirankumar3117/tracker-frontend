"use client";

import { useEffect, useState } from "react";
import { Habit } from "@/types/habit";
import { MOCK_HABITS, recalculateAllMetrics, loadHabitsFromLocal, saveHabitsToLocal } from "@/lib/mockData";
import { HabitMatrix } from "@/components/habits/HabitMatrix";
import { HabitVisuals } from "@/components/habits/HabitVisuals";
import { HabitLeaderboard } from "@/components/habits/HabitLeaderboard";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  useEffect(() => {
    // Simulate loading to mimic fetching data
    const timer = setTimeout(() => {
      setHabits(loadHabitsFromLocal());
      setLoading(false);
    }, 500);

    const handleAddHabit = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newHabit: Habit = {
        id: `mock-${Date.now()}`,
        userId: "local-user",
        title: customEvent.detail.title,
        priority: customEvent.detail.priority || "Medium",
        duration: customEvent.detail.duration || "all-time",
        frequency: customEvent.detail.frequency || [0, 1, 2, 3, 4, 5, 6],
        customStartDate: customEvent.detail.customStartDate,
        customEndDate: customEvent.detail.customEndDate,
        createdAt: new Date().toISOString(),
        logs: [],
        currentStreak: 0,
        bestStreak: 0,
        completionPercentage: 0,
      };
      setHabits(prev => {
        const next = [newHabit, ...prev];
        saveHabitsToLocal(next);
        return next;
      });
    };

    const handleEditHabit = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, title, priority, duration, customStartDate, customEndDate, frequency } = customEvent.detail;
      setHabits(prev => {
        const next = prev.map(h => h.id === id ? {
          ...h,
          title,
          priority: priority || "Medium",
          duration: duration || "all-time",
          customStartDate,
          customEndDate,
          frequency: frequency || [0, 1, 2, 3, 4, 5, 6],
        } : h);
        saveHabitsToLocal(next);
        return next;
      });
    };

    const handleDeleteHabit = (e: Event) => {
      const customEvent = e as CustomEvent;
      setHabits(prev => {
        const next = prev.filter(h => h.id !== customEvent.detail.id);
        saveHabitsToLocal(next);
        return next;
      });
    };

    window.addEventListener('add-habit', handleAddHabit);
    window.addEventListener('edit-habit', handleEditHabit);
    window.addEventListener('delete-habit', handleDeleteHabit);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('add-habit', handleAddHabit);
      window.removeEventListener('edit-habit', handleEditHabit);
      window.removeEventListener('delete-habit', handleDeleteHabit);
    };
  }, []);

  const handleGenerateBaseline = () => {
    saveHabitsToLocal(MOCK_HABITS);
    setHabits(MOCK_HABITS);
    setHasChanges(false);
  };

  const handleSave = () => {
    saveHabitsToLocal(habits);
    setHasChanges(false);
  };

  const handleToggleLog = async (habitId: string, date: Date, isCompleted: boolean) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const existingLogIndex = h.logs.findIndex(l => {
          const lDate = new Date(l.date);
          lDate.setHours(0,0,0,0);
          const dDate = new Date(date);
          dDate.setHours(0,0,0,0);
          return lDate.getTime() === dDate.getTime();
        });
        
        const newLogs = [...h.logs];
        if (existingLogIndex >= 0) {
          newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], isCompleted };
        } else {
          newLogs.push({ id: `log-${Date.now()}`, habitId, date: date.toISOString(), isCompleted });
        }
        
        return recalculateAllMetrics({ ...h, logs: newLogs });
      }
      return h;
    }));
    setHasChanges(true);
  };

  // Calculate day's percentage
  today.setHours(0,0,0,0);
  let todayCompleted = 0;
  habits.forEach(h => {
    const log = h.logs.find(l => {
      const lDate = new Date(l.date);
      lDate.setHours(0,0,0,0);
      return lDate.getTime() === today.getTime();
    });
    if (log?.isCompleted) todayCompleted++;
  });
  const todayPercentage = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col gap-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 font-medium flex items-center gap-2">
            Monitor consistencies and advanced spreadsheet analytics.
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">Mock Data Mode</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
             <div className="flex flex-col">
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Progress</span>
               <span className="text-xl font-bold text-foreground">{todayPercentage}%</span>
             </div>
             <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted/30"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${todayPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                  />
                </svg>
             </div>
          </div>

          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSave}
                  className="rounded-2xl border border-transparent bg-green-600 text-white hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all h-[4.25rem] px-5 font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleGenerateBaseline}
              className="rounded-2xl border border-border bg-card text-foreground hover:bg-muted shadow-sm transition-all h-[4.25rem] px-5"
            >
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Reset Data
            </Button>
          </motion.div> */}
        </div>
      </div>

      <HabitMatrix 
        habits={habits} 
        onToggleLog={handleToggleLog} 
        loadingHabitId={null} 
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <HabitVisuals habits={habits} />
        </div>
        <div className="xl:col-span-1">
           <HabitLeaderboard habits={habits} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      </div>

    </motion.div>
  );
}
