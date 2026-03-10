"use client";

import { useState, useEffect } from "react";
import { Habit } from "@/features/habits/types/habit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { DialogPortal, DialogOverlay } from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";

export function HabitModal({ isOpen, onClose, onRefresh, editHabit }: { isOpen: boolean; onClose: () => void; onRefresh: () => void; editHabit?: Habit | null }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [duration, setDuration] = useState<"1-week" | "all-time" | "custom">("all-time");
  const [frequencyMode, setFrequencyMode] = useState<"everyday" | "specific">("everyday");
  const [frequency, setFrequency] = useState<number[]>([]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editHabit) {
        setTitle(editHabit.title);
        setPriority(editHabit.priority);
        setDuration(editHabit.duration);
        setFrequencyMode(editHabit.frequency && editHabit.frequency.length < 7 ? "specific" : "everyday");
        setFrequency(editHabit.frequency || []);

        if (editHabit.duration === "custom") {
          setCustomStartDate(editHabit.customStartDate ? editHabit.customStartDate.split('T')[0] : "");
          setCustomEndDate(editHabit.customEndDate ? editHabit.customEndDate.split('T')[0] : "");
        } else {
          setCustomStartDate("");
          setCustomEndDate("");
        }
      } else {
        setTitle("");
        setPriority("Medium");
        setDuration("all-time");
        setFrequencyMode("everyday");
        setFrequency([]);
        setCustomStartDate("");
        setCustomEndDate("");
      }
    }
  }, [isOpen, editHabit]);

  const WEEKDAYS = [
    { label: 'M', value: 1 },
    { label: 'T', value: 2 },
    { label: 'W', value: 3 },
    { label: 'T', value: 4 },
    { label: 'F', value: 5 },
    { label: 'S', value: 6 },
    { label: 'S', value: 0 },
  ];

  const toggleDay = (val: number) => {
    setFrequency(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val].sort());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (duration === "custom" && (!customStartDate || !customEndDate)) return;
    if (frequencyMode === "specific" && frequency.length === 0) return;

    const finalFrequency = frequencyMode === "everyday" ? [0, 1, 2, 3, 4, 5, 6] : frequency;

    // The backend expects full ISO strings, but the HTML input only provides "YYYY-MM-DD"
    // We parse it and append the current time safely to make it a valid ISO string payload
    let finalStartDate = customStartDate;
    let finalEndDate = customEndDate;
    if (duration === "custom") {
      finalStartDate = new Date(customStartDate).toISOString();
      finalEndDate = new Date(customEndDate).toISOString();
    }

    setLoading(true);
    // Simulate network delay for UI fluidity
    setTimeout(() => {
      const payload = { title, priority, duration, customStartDate: finalStartDate, customEndDate: finalEndDate, frequency: finalFrequency };
      if (editHabit) {
        window.dispatchEvent(new CustomEvent('edit-habit', { detail: { id: editHabit.id, ...payload } }));
      } else {
        window.dispatchEvent(new CustomEvent('add-habit', { detail: payload }));
      }
      onClose();
      setLoading(false);
    }, 400);
  };

  const handleDelete = () => {
    if (!editHabit) return;
    window.dispatchEvent(new CustomEvent('delete-habit', { detail: { id: editHabit.id } }));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogPortal forceMount>
            <DialogOverlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
              />
            </DialogOverlay>
            <DialogContent
              className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border-0 bg-transparent p-0 shadow-none sm:max-w-[400px]"
              showCloseButton={false}
            >
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                className="w-full rounded-[24px] border border-white/10 dark:border-white/5 bg-card/95 p-7 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-card/80"
              >
                <DialogHeader className="mb-6 space-y-1">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                    {editHabit ? "Edit Habit" : "New Habit"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground font-medium">
                    {editHabit ? "Refine your daily routine details." : "What daily action builds your identity?"}
                  </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      placeholder="E.g., Read technical blog..."
                      className="border-0 border-b-2 border-border/50 bg-transparent px-1 py-6 text-xl shadow-none focus-visible:ring-0 focus-visible:border-primary font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/40 transition-colors rounded-none"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                    />

                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Frequency</label>
                        <Select value={frequencyMode} onValueChange={(val: any) => setFrequencyMode(val)}>
                          <SelectTrigger className="w-[160px] border-white/10 dark:border-white/5 bg-background shadow-none font-medium rounded-xl h-9 text-xs">
                            <SelectValue placeholder="Frequency" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-white/10">
                            <SelectItem value="everyday" className="font-medium rounded-lg text-xs">Every Day</SelectItem>
                            <SelectItem value="specific" className="font-medium rounded-lg text-xs">Specific Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <AnimatePresence>
                        {frequencyMode === "specific" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-between gap-2 pt-2 overflow-hidden"
                          >
                            {WEEKDAYS.map(day => (
                              <button
                                key={`${day.label}-${day.value}`}
                                type="button"
                                onClick={() => toggleDay(day.value)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${frequency.includes(day.value)
                                    ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border'
                                  }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Priority</label>
                        <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                          <SelectTrigger className="w-full border-white/10 dark:border-white/5 bg-background shadow-none font-medium rounded-xl h-11">
                            <SelectValue placeholder="Priority Level" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-white/10">
                            <SelectItem value="High" className="font-semibold text-red-500 rounded-lg">High Priority</SelectItem>
                            <SelectItem value="Medium" className="font-semibold text-orange-500 rounded-lg">Medium Priority</SelectItem>
                            <SelectItem value="Low" className="font-semibold text-blue-500 rounded-lg">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Timeline</label>
                        <Select value={duration} onValueChange={(val: any) => setDuration(val)}>
                          <SelectTrigger className="w-full border-white/10 dark:border-white/5 bg-background shadow-none font-medium rounded-xl h-11">
                            <SelectValue placeholder="Duration" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-white/10">
                            <SelectItem value="1-week" className="font-medium rounded-lg">1 Week Only</SelectItem>
                            <SelectItem value="all-time" className="font-medium rounded-lg">All Year</SelectItem>
                            <SelectItem value="custom" className="font-medium rounded-lg">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <AnimatePresence>
                      {duration === "custom" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-4 pt-2 overflow-hidden"
                        >
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">From</label>
                            <Input
                              type="date"
                              className="w-full border-white/10 dark:border-white/5 bg-background shadow-none font-medium text-foreground rounded-xl h-11 px-3"
                              value={customStartDate}
                              onChange={(e) => setCustomStartDate(e.target.value)}
                              required={duration === "custom"}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">To</label>
                            <Input
                              type="date"
                              className="w-full border-white/10 dark:border-white/5 bg-background shadow-none font-medium text-foreground rounded-xl h-11 px-3"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              required={duration === "custom"}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-4 flex justify-between gap-3">
                    {editHabit ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={loading}
                        className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/10 h-11 px-4 font-bold"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    ) : (
                      <div className="flex-1" />
                    )}

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 h-11 px-5"
                      >
                        Cancel
                      </Button>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={loading || !title.trim() || (frequencyMode === "specific" && frequency.length === 0)}
                          className="rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(217,119,6,0.2)] disabled:opacity-50 disabled:shadow-none h-11 px-6 border-none"
                        >
                          {loading ? "Saving..." : editHabit ? "Save Changes" : "Create Habit"}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </form>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
