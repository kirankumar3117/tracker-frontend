"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/features/habits/hooks/useDashboard";
import { DashboardHeader } from "@/features/habits/components/DashboardHeader";
import { HabitMatrix } from "@/features/habits/components/HabitMatrix";
import { HabitVisuals } from "@/features/habits/components/HabitVisuals";
import { HabitLeaderboard } from "@/features/habits/components/HabitLeaderboard";

export default function Dashboard() {
  const {
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
  } = useDashboard();

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
      <DashboardHeader
        todayPercentage={todayPercentage}
        hasChanges={hasChanges}
        onSave={handleSave}
      />

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
