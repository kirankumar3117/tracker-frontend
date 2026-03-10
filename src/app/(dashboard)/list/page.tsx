"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/features/habits/hooks/useDashboard";
import { DashboardHeader } from "@/features/habits/components/DashboardHeader";
import { HabitMatrix } from "@/features/habits/components/HabitMatrix";
import { HabitVisuals } from "@/features/habits/components/HabitVisuals";
import { HabitLeaderboard } from "@/features/habits/components/HabitLeaderboard";
import { DashboardLoadingOverlay } from "@/features/habits/components/DashboardLoadingOverlay";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex flex-col gap-6 md:gap-8 pb-12 pt-14 md:pt-0"
    >
      {/* Loading overlay with blur */}
      <AnimatePresence>
        {loading && <DashboardLoadingOverlay />}
      </AnimatePresence>

      {/* Content — always rendered, non-interactive while loading */}
      <div className={loading ? "pointer-events-none select-none" : ""}>
        <DashboardHeader
          todayPercentage={todayPercentage}
          hasChanges={hasChanges}
          onSave={handleSave}
        />

        <div className="tour-matrix border border-transparent rounded-2xl mt-6 md:mt-8">
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 md:mt-8">
          <div className="xl:col-span-2 tour-visuals border border-transparent rounded-2xl">
            <HabitVisuals habits={habits} />
          </div>
          <div className="xl:col-span-1 tour-leaderboard border border-transparent rounded-2xl">
            <HabitLeaderboard habits={habits} selectedMonth={selectedMonth} selectedYear={selectedYear} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
