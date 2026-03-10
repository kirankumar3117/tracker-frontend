"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Habit, PendingLog } from "@/features/habits/types/habit";
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  bulkUpdateHabitLogs,
} from "@/lib/api/habits";
import { recalculateAllMetrics, getMockHabits } from "@/lib/mockData";

import { useAuthStore } from "@/store/useAuthStore";

// Peek at localStorage to detect if the user was previously logged in,
// so we don't flash mock data before Zustand's persist middleware hydrates.
function getInitialLoadingState(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const persisted = localStorage.getItem("tracker-user");
    if (persisted) {
      const parsed = JSON.parse(persisted);
      if (parsed?.state?.user) return true; // expect a real fetch
    }
  } catch {
    // ignore
  }
  return false; // no stored user – skip loading state for logged-out visitors
}

export function useDashboard() {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useRef(false);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [originalHabits, setOriginalHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(getInitialLoadingState);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingLogs, setPendingLogs] = useState<PendingLog[]>([]);
  const todayPercentageRef = useRef(0);

  const pendingLogsRef = useRef(pendingLogs);
  useEffect(() => {
    pendingLogsRef.current = pendingLogs;
  }, [pendingLogs]);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());

  // Populate mock data on mount so there's content behind the blur overlay.
  // Done in useEffect to avoid SSR hydration mismatch (getMockHabits uses Date).
  useEffect(() => {
    if (habits.length === 0) {
      setHabits(getMockHabits(true));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --------------------------------------------------------------------------
  // CENTRALIZED FETCHING LOGIC
  // --------------------------------------------------------------------------
  const fetchHabits = useCallback(
    async (isLoggedIn: boolean, showLoader: boolean = true) => {
      console.log("fetchHabits called", isLoggedIn);
      if (isLoggedIn) {
        console.log("user signed in", isLoggedIn);
        if (showLoader) setLoading(true);
        try {
          const freshHabits = await getHabits(selectedMonth + 1, selectedYear);
          const mergedHabits = freshHabits.map((serverHabit) => {
            let updatedHabit = { ...serverHabit };
            pendingLogsRef.current.forEach((pl) => {
              if (pl.habitId === serverHabit.id) {
                const existingLogIndex = updatedHabit.logs.findIndex((l) => {
                  const lDate = new Date(l.date);
                  lDate.setHours(0, 0, 0, 0);
                  const dDate = new Date(pl.date);
                  dDate.setHours(0, 0, 0, 0);
                  return lDate.getTime() === dDate.getTime();
                });
                const newLogs = [...updatedHabit.logs];
                if (existingLogIndex >= 0)
                  newLogs[existingLogIndex] = {
                    ...newLogs[existingLogIndex],
                    isCompleted: pl.isCompleted,
                  };
                else
                  newLogs.push({
                    id: `temp-${Date.now()}`,
                    habitId: serverHabit.id,
                    date: pl.date,
                    isCompleted: pl.isCompleted,
                  });
                updatedHabit = recalculateAllMetrics({
                  ...updatedHabit,
                  logs: newLogs,
                });
              }
            });
            return updatedHabit;
          });
          setOriginalHabits(freshHabits);
          setHabits(mergedHabits);
          setLoading(false);
          localStorage.setItem("tracker-last-login-state", "logged-in");
        } catch (e: any) {
          if (e.status === 401) {
            setPendingLogs([]);
            setHasChanges(false);
            setOriginalHabits([]);
            setHabits([]);
            window.dispatchEvent(new Event("execute-logout"));
          }
          console.error("Failed fetching habits in Dashboard", e);
          setLoading(false);
        }
      } else {
        const saved = localStorage.getItem("tracker-mock-habits");
        const lastKnownState = localStorage.getItem("tracker-last-login-state");
        if (saved && lastKnownState === "logged-out") {
          try {
            const parsed = JSON.parse(saved);
            const validatedHabits = parsed.map((h: Habit) => ({
              ...h,
              priority: h.priority || "Medium",
              duration: h.duration || "all-time",
              frequency: h.frequency || [0, 1, 2, 3, 4, 5, 6],
            }));
            setOriginalHabits(validatedHabits);
            setHabits(validatedHabits);
          } catch {
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
    },
    [selectedMonth, selectedYear],
  );

  // --------------------------------------------------------------------------
  // BOOTSTRAP: Initial auth check + month/year change re-fetch
  // --------------------------------------------------------------------------
  useEffect(() => {
    let initialIsLoggedIn = false;
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("tracker-purged-v2")) {
        localStorage.removeItem("tracker-mock-habits");
        localStorage.setItem("tracker-purged-v2", "true");
        window.location.reload();
        return;
      }
    }
  }, []);

  // Sync fetch with user state changes.
  // On the very first render Zustand hasn't hydrated yet (user === null even
  // when the visitor IS logged in). We skip that first render and wait for
  // the real hydrated value before deciding which path to take.
  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true;
      // If user is already set on first render (SSR / fast hydration), proceed.
      // Otherwise wait for the next effect call triggered by user changing.
      if (user !== null) {
        fetchHabits(true);
      }
      // If user is still null here, the effect will re-run once Zustand hydrates.
      return;
    }
    fetchHabits(!!user);
  }, [user, fetchHabits]);

  // --------------------------------------------------------------------------
  // GLOBAL EVENT LISTENERS
  // --------------------------------------------------------------------------
  useEffect(() => {
    const handleAddHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const newHabitPayload: Record<string, unknown> = {
        title: customEvent.detail.title,
        priority: customEvent.detail.priority || "Medium",
        duration: customEvent.detail.duration || "all-time",
        frequency: customEvent.detail.frequency || [0, 1, 2, 3, 4, 5, 6],
      };
      if (
        customEvent.detail.duration === "custom" &&
        customEvent.detail.customStartDate &&
        customEvent.detail.customEndDate
      ) {
        newHabitPayload.customStartDate = customEvent.detail.customStartDate;
        newHabitPayload.customEndDate = customEvent.detail.customEndDate;
      }
      if (user) {
        try {
          setLoading(true);
          await createHabit(newHabitPayload);
          await fetchHabits(true, false);
          setLoading(false);
        } catch (err) {
          console.error("Failed creating via API", err);
        }
      } else {
        const newHabit: Habit = {
          id: `mock-${Date.now()}`,
          userId: "local-user",
          ...(newHabitPayload as Omit<
            Habit,
            | "id"
            | "userId"
            | "createdAt"
            | "logs"
            | "currentStreak"
            | "bestStreak"
            | "completionPercentage"
          >),
          createdAt: new Date().toISOString(),
          logs: [],
          currentStreak: 0,
          bestStreak: 0,
          completionPercentage: 0,
        };
        setHabits((prev) => [newHabit, ...prev]);
      }
    };

    const handleEditHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const {
        id,
        title,
        priority,
        duration,
        customStartDate,
        customEndDate,
        frequency,
      } = customEvent.detail;
      if (user && !id.startsWith("mock-")) {
        try {
          await updateHabit(id, {
            title,
            priority,
            duration,
            customStartDate,
            customEndDate,
            frequency,
          });
          fetchHabits(true, false);
        } catch (err) {
          console.error("Failed updating via API", err);
        }
      } else {
        setHabits((prev) =>
          prev.map((h) =>
            h.id === id
              ? {
                ...h,
                title,
                priority: priority || "Medium",
                duration: duration || "all-time",
                customStartDate,
                customEndDate,
                frequency: frequency || [0, 1, 2, 3, 4, 5, 6],
              }
              : h,
          ),
        );
      }
    };

    const handleDeleteHabit = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const id = customEvent.detail.id;
      if (user && !id.startsWith("mock-")) {
        try {
          setLoading(true);
          await deleteHabit(id);
          await fetchHabits(true, false);
          setLoading(false);
        } catch (err) {
          console.error(err);
          setLoading(false);
        }
      } else {
        setHabits((prev) => prev.filter((h) => h.id !== id));
      }
    };

    const handleSkipConversion = () => setHasChanges(false);

    const handleForceLogout = () => {
      setPendingLogs([]);
      setHasChanges(false);
      setOriginalHabits([]);
      setHabits([]);
      fetchHabits(false);
    };

    const handleLogoutIntercept = () => {
      if (pendingLogsRef.current.length > 0) {
        const proceed = window.confirm(
          "You have unsaved log changes. Logging out will discard these updates. Are you sure you want to log out?",
        );
        if (proceed) {
          handleForceLogout();
          window.dispatchEvent(new Event("execute-logout"));
        }
      } else {
        handleForceLogout();
        window.dispatchEvent(new Event("execute-logout"));
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingLogsRef.current.length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("request-logout", handleLogoutIntercept);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("add-habit", handleAddHabit);
    window.addEventListener("edit-habit", handleEditHabit);
    window.addEventListener("delete-habit", handleDeleteHabit);
    window.addEventListener("skip-conversion-modal", handleSkipConversion);

    return () => {
      window.removeEventListener("request-logout", handleLogoutIntercept);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("add-habit", handleAddHabit);
      window.removeEventListener("edit-habit", handleEditHabit);
      window.removeEventListener("delete-habit", handleDeleteHabit);
      window.removeEventListener("skip-conversion-modal", handleSkipConversion);
    };
  }, [user, fetchHabits]);

  // --------------------------------------------------------------------------
  // ACTION HANDLERS
  // --------------------------------------------------------------------------
  const handleSave = async () => {
    if (!user) {
      window.dispatchEvent(new Event("open-conversion-modal"));
    } else {
      if (pendingLogs.length > 0) {
        try {
          await bulkUpdateHabitLogs(pendingLogs);
          setOriginalHabits(habits); // sync baseline so future toggles compare against post-save state
          setHasChanges(false);
          setPendingLogs([]);
        } catch {
          console.error("Failed to bulk save logs");
        }
      } else {
        setHasChanges(false);
      }
    }
  };

  const handleToggleLog = async (
    habitId: string,
    date: Date,
    isCompleted: boolean,
  ) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const existingLogIndex = h.logs.findIndex((l) => {
            const lDate = new Date(l.date);
            lDate.setHours(0, 0, 0, 0);
            const dDate = new Date(date);
            dDate.setHours(0, 0, 0, 0);
            return lDate.getTime() === dDate.getTime();
          });
          const newLogs = [...h.logs];
          if (existingLogIndex >= 0)
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              isCompleted,
            };
          else
            newLogs.push({
              id: `temp-${Date.now()}`,
              habitId,
              date: date.toISOString(),
              isCompleted,
            });
          return recalculateAllMetrics({ ...h, logs: newLogs });
        }
        return h;
      }),
    );

    if (user && !habitId.startsWith("mock-")) {
      const dateNorm = new Date(date);
      dateNorm.setHours(0, 0, 0, 0);
      const dateTime = dateNorm.getTime();

      setPendingLogs((prev) => {
        const filtered = prev.filter((p) => {
          const pDate = new Date(p.date);
          pDate.setHours(0, 0, 0, 0);
          return !(p.habitId === habitId && pDate.getTime() === dateTime);
        });
        const originalHabit = originalHabits.find((h) => h.id === habitId);
        const originalLog = originalHabit?.logs.find((l) => {
          const lDate = new Date(l.date);
          lDate.setHours(0, 0, 0, 0);
          return lDate.getTime() === dateTime;
        });
        const originalState = originalLog ? originalLog.isCompleted : false;
        if (originalState === isCompleted) {
          setHasChanges(filtered.length > 0);
          return filtered;
        }
        setHasChanges(true);
        return [
          ...filtered,
          { habitId, date: dateNorm.toISOString(), isCompleted },
        ];
      });
    } else {
      setHasChanges(true);
    }
  };

  // --------------------------------------------------------------------------
  // DERIVED STATE
  // --------------------------------------------------------------------------
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const isViewingCurrentMonth =
    selectedMonth === todayStart.getMonth() &&
    selectedYear === todayStart.getFullYear();

  // Only recalculate today's progress when viewing the current month,
  // otherwise return the last known value so it stays stable.
  if (isViewingCurrentMonth) {
    let todayCompleted = 0;
    let todayActiveCount = 0;

    habits.forEach((h) => {
      let isActive = true;
      if (h.frequency && !h.frequency.includes(todayStart.getDay())) {
        isActive = false;
      }
      const compareTime = todayStart.getTime();
      if (isActive && h.duration === "1-week") {
        const start = new Date(h.createdAt);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        if (compareTime < start.getTime() || compareTime > end.getTime())
          isActive = false;
      } else if (
        isActive &&
        h.duration === "custom" &&
        h.customStartDate &&
        h.customEndDate
      ) {
        const start = new Date(h.customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(h.customEndDate);
        end.setHours(0, 0, 0, 0);
        if (compareTime < start.getTime() || compareTime > end.getTime())
          isActive = false;
      }

      if (isActive) {
        todayActiveCount++;
        const log = h.logs.find((l) => {
          const lDate = new Date(l.date);
          lDate.setHours(0, 0, 0, 0);
          return lDate.getTime() === todayStart.getTime();
        });
        if (log?.isCompleted) todayCompleted++;
      }
    });

    todayPercentageRef.current =
      todayActiveCount > 0
        ? Math.round((todayCompleted / todayActiveCount) * 100)
        : 0;
  }

  const todayPercentage = todayPercentageRef.current;

  return {
    habits,
    loading,
    hasChanges,
    todayPercentage,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    handleToggleLog,
    handleSave,
  };
}
