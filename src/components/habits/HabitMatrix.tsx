"use client";

import { Habit } from "@/types/habit";
import { format, eachDayOfInterval } from "date-fns";
import { Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitMatrixProps {
  habits: Habit[];
  onToggleLog: (habitId: string, date: Date, isCompleted: boolean) => void;
  loadingHabitId: string | null;
}

export function HabitMatrix({ habits, onToggleLog, loadingHabitId }: HabitMatrixProps) {
  const priorityWeight = { "High": 3, "Medium": 2, "Low": 1 };
  const sortedHabits = [...habits].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
  
  // Exact days in the selected month
  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0);
  const daysInMonth = endDate.getDate();
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const isHabitActiveOnDate = (habit: Habit, date: Date) => {
    // 1. Check Frequency (Day of week)
    if (habit.frequency && !habit.frequency.includes(date.getDay())) {
      return false;
    }

    // 2. Check Duration (Calendar boundaries)
    const compareTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    
    if (habit.duration === "1-week") {
      const start = new Date(habit.createdAt);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return compareTime >= start.getTime() && compareTime <= end.getTime();
    } else if (habit.duration === "custom" && habit.customStartDate && habit.customEndDate) {
      const start = new Date(habit.customStartDate);
      start.setHours(0,0,0,0);
      const end = new Date(habit.customEndDate);
      end.setHours(0,0,0,0);
      return compareTime >= start.getTime() && compareTime <= end.getTime();
    }
    return true;
  };

  const visibleHabits = sortedHabits.filter(habit => {
    if (habit.duration === "all-time") return true;
    
    const monthStart = startDate.getTime();
    const monthEnd = endDate.getTime();
    
    let hStart, hEnd;
    if (habit.duration === "1-week") {
      hStart = new Date(habit.createdAt);
      hStart.setHours(0,0,0,0);
      hEnd = new Date(hStart);
      hEnd.setDate(hEnd.getDate() + 6);
    } else if (habit.duration === "custom" && habit.customStartDate && habit.customEndDate) {
      hStart = new Date(habit.customStartDate);
      hStart.setHours(0,0,0,0);
      hEnd = new Date(habit.customEndDate);
      hEnd.setHours(0,0,0,0);
    } else {
      return true;
    }
    
    return hStart.getTime() <= monthEnd && hEnd.getTime() >= monthStart;
  });

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      if (isCurrentMonth && todayRef.current) {
        const container = scrollContainerRef.current;
        const target = todayRef.current;
        const scrollPos = target.offsetLeft - (container.clientWidth / 2) + (target.clientWidth / 2);
        container.scrollTo({ left: scrollPos, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
      // initial check
      setTimeout(checkScroll, 100);
    }
  }, [habits.length, selectedMonth, selectedYear, isCurrentMonth]);

  const scrollBy = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const getLogForDate = (habit: Habit, date: Date) => {
    return habit.logs.find(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === date.getDate() && 
             logDate.getMonth() === date.getMonth() && 
             logDate.getFullYear() === date.getFullYear();
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Sleek Control Header */}
      <div className="flex items-center justify-between border border-border bg-card px-4 py-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
            <SelectTrigger className="w-[140px] border-border bg-background shadow-none font-medium rounded-xl h-10">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(2000, i, 1);
                return (
                  <SelectItem key={i} value={i.toString()} className="rounded-lg">
                    {format(date, "MMMM")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[100px] border-border bg-background shadow-none font-medium rounded-xl h-10">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {[today.getFullYear() - 1, today.getFullYear(), today.getFullYear() + 1].map(year => (
                <SelectItem key={year} value={year.toString()} className="rounded-lg">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 relative group">
      
      {/* Scroll Controls */}
      {canScrollLeft && (
        <div className="absolute left-52 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scrollBy(-250)}
            className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {canScrollRight && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scrollBy(250)}
            className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center text-foreground shadow-md hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto no-scrollbar border border-border rounded-2xl bg-card snap-x snap-mandatory"
      >
        <div className="min-w-max">
          {/* Header Row */}
          <div className="flex items-center border-b border-border bg-muted/30">
            <div className="w-48 shrink-0 px-4 py-3 font-semibold text-sm text-muted-foreground border-r border-border sticky left-0 bg-card z-20 shadow-[2px_0_10px_-3px_rgba(0,0,0,0.1)] flex flex-col justify-center gap-0.5">
              <span className="text-foreground">Habit</span>
              <span className="text-xs font-normal">Current {daysInMonth} Days</span>
            </div>
            <div className="flex-1 flex">
              {days.map((day) => {
                const isToday = day.getTime() === today.getTime();
                return (
                  <div 
                    key={day.toISOString()} 
                    ref={isToday ? todayRef : null}
                    className={`w-14 shrink-0 flex flex-col items-center justify-center py-2 border-r border-border snap-center ${isToday ? 'bg-primary/5' : ''}`}
                  >
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(day, "EEE")}</span>
                    <span className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        {/* Habits Rows */}
        <div className="flex flex-col">
          {visibleHabits.length === 0 ? (
             <div className="p-8 text-center text-sm text-muted-foreground">No habits found. Generate a baseline or add one.</div>
          ) : visibleHabits.map((habit, idx) => (
            <div key={habit.id} className={`flex items-center ${idx !== visibleHabits.length - 1 ? 'border-b border-border' : ''} hover:bg-muted/10 transition-colors`}>
              <div className="w-48 shrink-0 px-4 py-3 font-medium text-sm text-foreground border-r border-border sticky left-0 bg-card z-10 shadow-[2px_0_10px_-3px_rgba(0,0,0,0.1)] flex flex-col justify-center gap-1.5">
                <div className="flex items-center gap-2 w-full">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate flex-1 cursor-default">{habit.title}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="start" className="max-w-[250px] break-words z-50 rounded-xl">
                        <p className="font-medium text-sm">{habit.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    habit.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    habit.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {habit.priority === 'High' ? 'P1' : habit.priority === 'Medium' ? 'P2' : 'P3'}
                  </span>
                </div>
                {(habit.duration === '1-week' || (habit.duration === 'custom' && habit.customEndDate)) && (
                  <div className="flex items-center gap-2">
                    {habit.duration === '1-week' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-muted bg-muted/50 text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        7 Days
                      </span>
                    )}
                    {habit.duration === 'custom' && habit.customEndDate && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-muted bg-muted/50 text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Until {format(new Date(habit.customEndDate), "MMM d")}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 flex">
                {days.map((day) => {
                  const log = getLogForDate(habit, day);
                  const isCompleted = log?.isCompleted ?? false;
                  const isLoading = loadingHabitId === `${habit.id}-${day.getTime()}`;
                  const isToday = day.getTime() === today.getTime();
                  const isActive = isHabitActiveOnDate(habit, day);

                  return (
                    <div key={day.toISOString()} className={`w-14 shrink-0 flex items-center justify-center border-r border-border h-12 snap-center ${isToday ? 'bg-primary/5' : ''}`}>
                      <motion.button
                        whileTap={isActive && !isLoading ? { scale: 0.8 } : {}}
                        disabled={isLoading || !isActive}
                        onClick={() => isActive && onToggleLog(habit.id, day, !isCompleted)}
                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                          isLoading ? 'opacity-50' : ''
                        } ${
                          !isActive ? 'opacity-20 cursor-not-allowed bg-muted/20 border-border' :
                          isCompleted 
                            ? 'bg-primary text-primary-foreground border-transparent shadow-[0_0_10px_rgba(217,119,6,0.3)]' 
                            : 'bg-transparent border-2 border-muted-foreground/30 hover:border-primary/50'
                        }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                        ) : isCompleted && isActive ? (
                          <Check className="w-4 h-4" strokeWidth={3} />
                        ) : null}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
