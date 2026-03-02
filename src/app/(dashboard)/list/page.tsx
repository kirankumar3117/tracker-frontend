"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Habit } from "@/types/habit";
import { HabitMatrix } from "@/components/habits/HabitMatrix";
import { HabitVisuals } from "@/components/habits/HabitVisuals";
import { HabitLeaderboard } from "@/components/habits/HabitLeaderboard";
import { Button } from "@/components/ui/button";
import { Loader2, Target, Sparkles, AlertCircle, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_HABITS: Habit[] = [
  { id: "local-1", userId: "local", title: "Running", createdAt: new Date().toISOString(), logs: [], currentStreak: 0, bestStreak: 0, completionPercentage: 0 },
  { id: "local-2", userId: "local", title: "Gym / Workout", createdAt: new Date().toISOString(), logs: [], currentStreak: 0, bestStreak: 0, completionPercentage: 0 },
  { id: "local-3", userId: "local", title: "DSA Problem Solving", createdAt: new Date().toISOString(), logs: [], currentStreak: 0, bestStreak: 0, completionPercentage: 0 },
  { id: "local-4", userId: "local", title: "Read technical documentation", createdAt: new Date().toISOString(), logs: [], currentStreak: 0, bestStreak: 0, completionPercentage: 0 },
  { id: "local-5", userId: "local", title: "Deep Work (2 hours)", createdAt: new Date().toISOString(), logs: [], currentStreak: 0, bestStreak: 0, completionPercentage: 0 },
  { id: "local-6", userId: "local", title: "Review 1 Open Source PR", createdAt: new Date().toISOString(), logs: [], currentStreak: 0, bestStreak: 0, completionPercentage: 0 },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [logLoading, setLogLoading] = useState<string | null>(null);

  const fetchHabits = async () => {
    if (status === "unauthenticated") {
      setHabits(DEFAULT_HABITS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      fetchHabits();
    }
    
    // Listen for header modal refresh
    const handleRefresh = () => {
      if (status === "authenticated") fetchHabits();
    };
    window.addEventListener('refresh-habits', handleRefresh);
    return () => window.removeEventListener('refresh-habits', handleRefresh);
  }, [status]);

  const handleGenerateBaseline = async () => {
    if (status === "unauthenticated") {
      signIn();
      return;
    }

    setGenerating(true);
    try {
      await fetch("/api/habits/baseline", { method: "POST" });
      await fetchHabits();
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleLog = async (habitId: string, date: Date, isCompleted: boolean) => {
    const loadingKey = `${habitId}-${date.getTime()}`;
    setLogLoading(loadingKey);
    
    // Optimistic UI Update
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const existingLogIndex = h.logs.findIndex(l => new Date(l.date).getTime() === date.getTime());
        const newLogs = [...h.logs];
        if (existingLogIndex >= 0) {
          newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], isCompleted };
        } else {
          newLogs.push({ id: 'temp', habitId, date: date.toISOString(), isCompleted });
        }
        return { ...h, logs: newLogs };
      }
      return h;
    }));

    if (status === "unauthenticated") {
      setLogLoading(null);
      return; // Skip posting to DB if unauthenticated
    }

    try {
      await fetch(`/api/habits/${habitId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString(), isCompleted }),
      });
      // Re-fetch to compute new streaks backend-side securely
      await fetchHabits();
    } catch (e) {
      console.error(e);
      await fetchHabits(); // Revert
    } finally {
      setLogLoading(null);
    }
  };

  // Calculate day's percentage
  const today = new Date();
  today.setHours(0,0,0,0);
  let todayCompleted = 0;
  habits.forEach(h => {
    const log = h.logs.find(l => new Date(l.date).getTime() === today.getTime());
    if (log?.isCompleted) todayCompleted++;
  });
  const todayPercentage = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

  if (loading || status === "loading") {
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
            {status === "unauthenticated" && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">Local Mode</span>
            )}
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

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleGenerateBaseline}
              disabled={generating}
              className="rounded-2xl border border-border bg-card text-foreground hover:bg-muted shadow-sm transition-all h-[4.25rem] px-5"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
              )}
              Baseline
            </Button>
          </motion.div>
        </div>
      </div>

      <HabitMatrix habits={habits} onToggleLog={handleToggleLog} loadingHabitId={logLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
           <HabitVisuals habits={habits} />
        </div>
        <div className="xl:col-span-1">
           <HabitLeaderboard habits={habits} />
        </div>
      </div>

    </motion.div>
  );
}
