"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Habit } from "@/types/habit";
import { getHabits, createHabit, updateHabit, deleteHabit, bulkUpdateHabitLogs } from "@/lib/api/habits";
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
  // Store original server state to compare dirtiness vs local overrides
  const [originalHabits, setOriginalHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [pendingLogs, setPendingLogs] = useState<Array<{ habitId: string; date: string; isCompleted: boolean }>>([]);
  // We need a ref for the pending logs to access them inside the beforeunload listener safely without stale closures
  const pendingLogsRef = useRef(pendingLogs);
  useEffect(() => { pendingLogsRef.current = pendingLogs; }, [pendingLogs]);
  
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // --------------------------------------------------------------------------
  // CENTRALIZED FETCHING LOGIC
  // --------------------------------------------------------------------------
  const fetchHabits = useCallback(async (isLoggedIn: boolean) => {
    if (isLoggedIn) {
      setLoading(true);
      try {
        const freshHabits = await getHabits(selectedMonth + 1, selectedYear);
        
        // Re-apply any pending logs the user hasn't saved yet on top of the server response
        // so they don't visually disappear when traversing months
        const mergedHabits = freshHabits.map(serverHabit => {
           let updatedHabit = { ...serverHabit };
           pendingLogsRef.current.forEach(pl => {
              if (pl.habitId === serverHabit.id) {
                 const existingLogIndex = updatedHabit.logs.findIndex(l => {
                    const lDate = new Date(l.date); lDate.setHours(0,0,0,0);
                    const dDate = new Date(pl.date); dDate.setHours(0,0,0,0);
                    return lDate.getTime() === dDate.getTime();
                 });
                 const newLogs = [...updatedHabit.logs];
                 if (existingLogIndex >= 0) newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], isCompleted: pl.isCompleted };
                 else newLogs.push({ id: `temp-${Date.now()}`, habitId: serverHabit.id, date: pl.date, isCompleted: pl.isCompleted });
                 updatedHabit = recalculateAllMetrics({ ...updatedHabit, logs: newLogs });
              }
           });
           return updatedHabit;
        });

        setOriginalHabits(freshHabits);
        setHabits(mergedHabits);
        localStorage.setItem("tracker-last-login-state", "logged-in");
      } catch (e) {
        console.error("Failed fetching habits in Dashboard", e);
      } finally {
        setLoading(false);
      }
    } else {
      // Mock Data Path
      const saved = localStorage.getItem("tracker-mock-habits");
      const lastKnownState = localStorage.getItem("tracker-last-login-state");
      
      if (saved && lastKnownState === "logged-out") {
          try {
            const parsed = JSON.parse(saved);
            const validatedHabits = parsed.map((h: Habit) => ({
                ...h, priority: h.priority || "Medium", duration: h.duration || "all-time", frequency: h.frequency || [0, 1, 2, 3, 4, 5, 6]
            }));
            setOriginalHabits(validatedHabits);
            setHabits(validatedHabits);
          } catch(e) {
            const fresh = getMockHabits(false);
            setOriginalHabits(fresh);
            setHabits(fresh);
            localStorage.setItem("tracker-mock-habits", JSON.stringify(fresh));
          }
      } else {
          const fresh = getMockHabits(false);
          setOriginalHabits(fresh);
          setHabits(fresh);
          localStorage.setItem("tracker-mock-habits", JSON.stringify(fresh));
          localStorage.setItem("tracker-last-login-state", "logged-out");
      }
      setTimeout(() => setLoading(false), 500);
    }
  }, [selectedMonth, selectedYear]);


  useEffect(() => {
    // 1. Initial Authentication Bootstrap & Dynamic Month Triggers
    let initialIsLoggedIn = false;
    let storedUserStr = null;
    
    if (typeof window !== "undefined") {
      storedUserStr = localStorage.getItem("tracker-user");
      if (storedUserStr) {
        try {
           setUser(JSON.parse(storedUserStr));
           initialIsLoggedIn = true;
        } catch (e) {}
      }

      // Purge old mock style
      if (!localStorage.getItem("tracker-purged-v2")) {
        localStorage.removeItem("tracker-mock-habits");
        localStorage.setItem("tracker-purged-v2", "true");
        window.location.reload(); 
        return;
      }
    }

    fetchHabits(initialIsLoggedIn);
  }, [fetchHabits]);


  // 2. Global Event Listeners & Modals
  useEffect(() => {
    const handleAddHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const newHabitPayload: any = {
        title: customEvent.detail.title,
        priority: customEvent.detail.priority || "Medium",
        duration: customEvent.detail.duration || "all-time",
        frequency: customEvent.detail.frequency || [0, 1, 2, 3, 4, 5, 6],
      };
      
      if (customEvent.detail.duration === "custom" && customEvent.detail.customStartDate && customEvent.detail.customEndDate) {
         newHabitPayload.customStartDate = customEvent.detail.customStartDate;
         newHabitPayload.customEndDate = customEvent.detail.customEndDate;
      }

      if (user) {
        try {
           await createHabit(newHabitPayload);
           fetchHabits(true);
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
      
      if (user && !id.startsWith('mock-')) {
         try {
            await updateHabit(id, { title, priority, duration, customStartDate, customEndDate, frequency });
            fetchHabits(true);
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
      if (user && !id.startsWith('mock-')) {
         try {
            await deleteHabit(id);
            fetchHabits(true);
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

    const handleForceLogout = () => {
       // This triggers when user accepts the "you have unsaved changes" confirmation
       // or directly if they had no unsaved changes.
       setPendingLogs([]);
       setHasChanges(false);
       setOriginalHabits([]);
       setHabits([]);
       setUser(null);
       fetchHabits(false); // Refetch anonymous mock state
    };

    const handleLogoutIntercept = (e: Event) => {
       if (pendingLogsRef.current.length > 0) {
          const proceed = window.confirm("You have unsaved log changes. Logging out will discard these updates. Are you sure you want to log out?");
          if (proceed) {
             handleForceLogout();
             window.dispatchEvent(new Event('execute-logout')); // Let Sidebar clear storage
          }
       } else {
          handleForceLogout();
          window.dispatchEvent(new Event('execute-logout'));
       }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       if (pendingLogsRef.current.length > 0) {
          e.preventDefault();
          e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
          return e.returnValue;
       }
    };
    
    // Auth success listener should now just forcefully refetch based on the new custom hook variables
    const handleAuthSuccess = () => fetchHabits(true);

    window.addEventListener('auth-success', handleAuthSuccess);
    window.addEventListener('request-logout', handleLogoutIntercept);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('add-habit', handleAddHabit);
    window.addEventListener('edit-habit', handleEditHabit);
    window.addEventListener('delete-habit', handleDeleteHabit);
    window.addEventListener('skip-conversion-modal', handleSkipConversion);

    return () => {
      window.removeEventListener('auth-success', handleAuthSuccess);
      window.removeEventListener('request-logout', handleLogoutIntercept);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('add-habit', handleAddHabit);
      window.removeEventListener('edit-habit', handleEditHabit);
      window.removeEventListener('delete-habit', handleDeleteHabit);
      window.removeEventListener('skip-conversion-modal', handleSkipConversion);
    };
  }, [user, fetchHabits]);


  const handleSave = async () => {
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
       
       setPendingLogs(prev => {
          // 1. Remove any previous exact overrides for this habit/date
          const filtered = prev.filter(p => !(p.habitId === habitId && new Date(p.date).setHours(0,0,0,0) === date.setHours(0,0,0,0)));
          
          // 2. Determine Original Server State
          const originalHabit = originalHabits.find(h => h.id === habitId);
          const originalLog = originalHabit?.logs.find(l => {
              const lDate = new Date(l.date); lDate.setHours(0,0,0,0);
              const dDate = new Date(date); dDate.setHours(0,0,0,0);
              return lDate.getTime() === dDate.getTime();
          });
          
          const originalState = originalLog ? originalLog.isCompleted : false;
          
          // 3. Compare Original vs Target
          // If the new target state identically matches the original server state, 
          // we do NOT add it to the pending queue because no change is required.
          if (originalState === isCompleted) {
              setHasChanges(filtered.length > 0);
              return filtered;
          }
          
          // Otherwise, push it to the queue
          setHasChanges(true);
          return [...filtered, { habitId, date: date.toISOString(), isCompleted }];
       });
       
    } else {
       setHasChanges(true); // For anonymous users
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
