"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HabitModal({ isOpen, onClose, onRefresh }: { isOpen: boolean; onClose: () => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    // Simulate network delay for UI fluidity
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('add-habit', { detail: { title } }));
      setTitle("");
      onRefresh();
      onClose();
      setLoading(false);
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-7 border-border shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5 border-b border-border pb-4">
            <Input
              placeholder="E.g., Read 10 pages..."
              className="border-0 bg-transparent px-0 text-xl shadow-none focus-visible:ring-0 font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={loading || !title.trim()}
                className="rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-[0_0_15px_rgba(217,119,6,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? "Adding..." : "Add Habit"}
              </Button>
            </motion.div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
