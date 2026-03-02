"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { HabitModal } from "@/components/habits/HabitModal";
import { motion } from "framer-motion";

import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNewHabitClick = () => {
    setIsModalOpen(true);
  };

  const formatTitle = (path: string) => {
    switch (path) {
      case "/list":
        return "Dashboard overview";
      case "/kanban":
        return "Task Board flow";
      case "/calendar":
        return "Calendar schedule";
      default:
        return "Dashboard overview";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border pl-64 h-16 flex items-center justify-between px-8">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          {formatTitle(pathname)}
        </h2>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={handleNewHabitClick}
              size="sm" 
              className="rounded-lg shadow-sm border border-border bg-secondary hover:bg-accent text-foreground transition-colors h-9 px-4 font-medium"
            >
              <Plus className="w-4 h-4 mr-2 text-primary" />
              New Habit
            </Button>
          </motion.div>
        </div>
      </header>

      <HabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={() => window.dispatchEvent(new Event('refresh-habits'))}
      />
    </>
  );
}
