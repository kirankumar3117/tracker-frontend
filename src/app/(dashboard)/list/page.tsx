"use client";

import { useEffect, useState } from "react";
import { Habit } from "@/types/habit";
import { getHabits, createHabit, updateHabit, deleteHabit, toggleHabitLog, bulkUpdateHabitLogs } from "@/lib/api/habits";
import { MOCK_HABITS, recalculateAllMetrics, getMockHabits } from "@/lib/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { HabitMatrix } from "@/components/habits/HabitMatrix";
import { HabitVisuals } from "@/components/habits/HabitVisuals";
import { HabitLeaderboard } from "@/components/habits/HabitLeaderboard";
import { Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function Dashboard() {
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  
  // Since we need to know if the user is logged in before setting Initial State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingLogs, setPendingLogs] = useState<Array<{ habitId: string; date: string; isCompleted: boolean }>>([]);
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  useEffect(() => {
    let isLoggedIn = false;
    let storedUserStr = null;
    
    // 1. Check Auth 
    if (typeof window !== "undefined") {
      storedUserStr = localStorage.getItem("tracker-user");
      if (storedUserStr) {
        try {
           const parsedUser = JSON.parse(storedUserStr);
           setUser(parsedUser);
           isLoggedIn = true;
        } catch (e) {}
      }
    }

    // 2. ONE-TIME PURGE of old local storage mock data to force "today only" checkboxes
    if (typeof window !== "undefined" && !localStorage.getItem("tracker-purged-v2")) {
      localStorage.removeItem("tracker-mock-habits");
      localStorage.setItem("tracker-purged-v2", "true");
      window.location.reload(); // Reload immediately to pull fresh MOCK_HABITS with only today active
      return;
    }

    // 3. Load or Generate Mock Habits depending on Login State
    if (typeof window !== "undefined") {
       const saved = localStorage.getItem("tracker-mock-habits");
       
       // Force regeneration if the habits in storage don't match the expected current login context
       // To do this simply, if they are logging in, we just flush the old anonymous habits and generate fresh
       const lastKnownState = localStorage.getItem("tracker-last-login-state");
       const currentStateStr = isLoggedIn ? "logged-in" : "logged-out";
       
       if (saved && lastKnownState === currentStateStr) {
           try {
             const parsed = JSON.parse(saved);
             const validatedHabits = parsed.map((h: Habit) => ({
                ...h,
                priority: h.priority || "Medium",
                duration: h.duration || "all-time",
                frequency: h.frequency || [0, 1, 2, 3, 4, 5, 6]
             }));
             setHabits(validatedHabits);
           } catch(e) {
             const fresh = getMockHabits(isLoggedIn);
             setHabits(fresh);
             localStorage.setItem("tracker-mock-habits", JSON.stringify(fresh));
           }
       } else {
           const fresh = getMockHabits(isLoggedIn);
           setHabits(fresh);
           localStorage.setItem("tracker-mock-habits", JSON.stringify(fresh));
           localStorage.setItem("tracker-last-login-state", currentStateStr);
       }
    }

    // Simulate loading to mimic fetching data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    const hasSeenTour = localStorage.getItem("tracker-tour-seen");
    if (!hasSeenTour) {
      setTimeout(() => {
        const d = driver({
          showProgress: true,
          steps: [
            { element: '.tour-matrix', popover: { title: 'Habit Matrix', description: 'Check off your daily habits here. Click on a habit name to edit or delete it.', side: "bottom" } },
            { element: '.tour-visuals', popover: { title: 'Visual Analytics', description: 'Monitor your performance trends and tracking volume over the weeks.', side: "top" } },
            { element: '.tour-leaderboard', popover: { title: 'Consistency Leaderboard', description: 'Track your total active days and mastery percentage up to the selected month.', side: "left" } },
          ]
        });
        d.drive();
        localStorage.setItem("tracker-tour-seen", "true");
      }, 1200);
    }

    const fetchFreshHabits = async () => {
       const userStr = localStorage.getItem("tracker-user");
       if (userStr) {
         try {
           setUser(JSON.parse(userStr));
           const freshHabits = await getHabits(selectedMonth + 1, selectedYear);
           setHabits(freshHabits);
           localStorage.setItem("tracker-last-login-state", "logged-in");
         } catch (e) {
           console.error("Failed fetching fresh habits post-auth", e);
         }
       }
    };

    window.addEventListener('auth-success', fetchFreshHabits);

    const handleAddHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const newHabitPayload = {
        title: customEvent.detail.title,
        priority: customEvent.detail.priority || "Medium",
        duration: customEvent.detail.duration || "all-time",
        frequency: customEvent.detail.frequency || [0, 1, 2, 3, 4, 5, 6],
        customStartDate: customEvent.detail.customStartDate,
        customEndDate: customEvent.detail.customEndDate,
      };

      if (isLoggedIn) {
        try {
           const created = await createHabit(newHabitPayload);
           setHabits(prev => [created, ...prev]);
        } catch(err) {
           console.error("Failed creating via API", err);
        }
      } else {
        const newHabit: Habit = {
          id: `mock-${Date.now()}`,
          userId: "local-user",
          ...newHabitPayload,
          createdAt: new Date().toISOString(),
          logs: [],
          currentStreak: 0,
          bestStreak: 0,
          completionPercentage: 0,
        };
        setHabits(prev => [newHabit, ...prev]);
      }
    };

    const handleEditHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, title, priority, duration, customStartDate, customEndDate, frequency } = customEvent.detail;
      
      if (isLoggedIn && !id.startsWith('mock-')) {
         try {
            const updated = await updateHabit(id, { title, priority, duration, customStartDate, customEndDate, frequency });
            setHabits(prev => prev.map(h => h.id === id ? updated : h));
         } catch(err) {
            console.error("Failed updating via API");
         }
      } else {
        setHabits(prev => prev.map(h => h.id === id ? {
          ...h, title, priority: priority || "Medium", duration: duration || "all-time", customStartDate, customEndDate, frequency: frequency || [0, 1, 2, 3, 4, 5, 6],
        } : h));
      }
    };

    const handleDeleteHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const id = customEvent.detail.id;
      if (isLoggedIn && !id.startsWith('mock-')) {
         try {
            await deleteHabit(id);
            setHabits(prev => prev.filter(h => h.id !== id));
         } catch(err) {
            console.error(err);
         }
      } else {
         setHabits(prev => prev.filter(h => h.id !== id));
      }
    };

    const handleSkipConversion = () => {
      setHasChanges(false);
    };

    window.addEventListener('add-habit', handleAddHabit);
    window.addEventListener('edit-habit', handleEditHabit);
    window.addEventListener('delete-habit', handleDeleteHabit);
    window.addEventListener('skip-conversion-modal', handleSkipConversion);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('auth-success', fetchFreshHabits);
      window.removeEventListener('add-habit', handleAddHabit);
      window.removeEventListener('edit-habit', handleEditHabit);
      window.removeEventListener('delete-habit', handleDeleteHabit);
      window.removeEventListener('skip-conversion-modal', handleSkipConversion);
    };
  }, []);


  const handleSave = async () => {
    console.log("handleSave", user, pendingLogs);
    return;
    if (!user) {
      window.dispatchEvent(new Event('open-conversion-modal'));
    } else {
      if (pendingLogs.length > 0) {
         try {
            await bulkUpdateHabitLogs(pendingLogs);
            setHasChanges(false);
            setPendingLogs([]);
            // Optional: Refetch from backend to ensure integrity, but local state shouldn't be too far off
         } catch(e) {
            console.error("Failed to bulk save logs");
         }
      } else {
         setHasChanges(false);
      }
    }
  };

  const handleToggleLog = async (habitId: string, date: Date, isCompleted: boolean) => {
    // Optimistic UI Update
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
          newLogs.push({ id: `temp-${Date.now()}`, habitId, date: date.toISOString(), isCompleted });
        }

        console.log("newLogs", newLogs);
        
        return recalculateAllMetrics({ ...h, logs: newLogs });
      }
      return h;
    }));

    if (user && !habitId.startsWith('mock-')) {
       // Using the bulk update endpoint logic (Queuing in pendingLogs to send on 'Save')
       setPendingLogs(prev => {
          // Remove previous modifications for same habit/date
          const filtered = prev.filter(p => !(p.habitId === habitId && new Date(p.date).setHours(0,0,0,0) === date.setHours(0,0,0,0)));
          return [...filtered, { habitId, date: date.toISOString(), isCompleted }];
       });
       setHasChanges(true); 
    } else {
       setHasChanges(true); // For anonymous users to see the save button conversion prompt
    }
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

        </div>
      </div>

      <div className="tour-matrix border border-transparent rounded-2xl">
        <HabitMatrix 
          habits={habits} 
          onToggleLog={handleToggleLog} 
          loadingHabitId={null} 
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 tour-visuals border border-transparent rounded-2xl">
           <HabitVisuals habits={habits} />
        </div>
        <div className="xl:col-span-1 tour-leaderboard border border-transparent rounded-2xl">
           <HabitLeaderboard habits={habits} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        </div>
      </div>

    </motion.div>
  );
}
