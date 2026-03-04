"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

interface DashboardHeaderProps {
  todayPercentage: number;
  hasChanges: boolean;
  onSave: () => void;
}

export function DashboardHeader({ todayPercentage, hasChanges, onSave }: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium flex items-center gap-2 flex-wrap">
          Monitor consistencies and advanced spreadsheet analytics.
          {!user && <motion.span
            animate={{
              boxShadow: ["0px 0px 0px rgba(249,115,22,0)", "0px 0px 12px rgba(249,115,22,0.4)", "0px 0px 0px rgba(249,115,22,0)"],
              borderColor: ["rgba(255,255,255,0.1)", "rgba(249,115,22,0.5)", "rgba(255,255,255,0.1)"]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-white/5 text-orange-400"
          >
            Mock Data Mode
          </motion.span>}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 bg-card border border-border px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Progress</span>
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
                onClick={onSave}
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
  );
}
