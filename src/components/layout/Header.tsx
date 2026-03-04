"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { Habit } from "@/types/habit";
import { HabitModal } from "@/components/habits/HabitModal";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConversionModal } from "@/components/auth/ConversionModal";
import { AuthModal } from "@/components/auth/AuthModal";

import { useAuthStore } from "@/store/useAuthStore";

export function Header() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);

  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleOpenEdit = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEditHabit(customEvent.detail);
      setIsModalOpen(true);
    };

    window.addEventListener('open-edit-modal', handleOpenEdit);
    return () => window.removeEventListener('open-edit-modal', handleOpenEdit);
  }, []);

  useEffect(() => {
    const handleOpenConversion = () => setIsConversionModalOpen(true);
    window.addEventListener('open-conversion-modal', handleOpenConversion);
    return () => window.removeEventListener('open-conversion-modal', handleOpenConversion);
  }, []);

  const handleNewHabitClick = () => {
    setEditHabit(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/5 dark:border-white/10 shadow-sm px-4 sm:px-8 h-16 flex items-center justify-center">
        <div className="w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-18 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-sm tracking-tighter">Habit</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground hidden sm:block">
              Tracker
            </h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {!user && (
              <button 
                onClick={() => setIsConversionModalOpen(true)}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(217,119,6,0.1)] font-semibold text-sm"
              >
                <Cloud className="w-4 h-4" />
                <span className="hidden sm:inline">Sync to Cloud</span>
              </button>
            )}
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleNewHabitClick}
                size="sm" 
                className="rounded-xl shadow-[0_0_15px_rgba(217,119,6,0.15)] bg-primary hover:bg-primary/90 text-primary-foreground transition-all h-9 px-4 font-semibold border-none"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Habit</span>
              </Button>
            </motion.div>
          </div>
        </div>
        <ConversionModal 
          isOpen={isConversionModalOpen} 
          onClose={() => setIsConversionModalOpen(false)} 
          onLoginClick={() => {
            setIsConversionModalOpen(false);
            setTimeout(() => setIsAuthModalOpen(true), 300);
          }}
          onSkip={() => {
            setIsConversionModalOpen(false);
            window.dispatchEvent(new Event('skip-conversion-modal'));
          }}
        />

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={() => {}} 
        />
      </header>

      <HabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={() => window.dispatchEvent(new Event('refresh-habits'))}
        editHabit={editHabit}
      />
    </>
  );
}
