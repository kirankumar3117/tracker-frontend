"use client";

import { useTheme } from "next-themes";
import { Habit } from "@/features/habits/types/habit";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface HabitVisualsProps {
  habits: Habit[];
}

export function HabitVisuals({ habits }: HabitVisualsProps) {
  const { resolvedTheme } = useTheme();

  // Dynamic theme colors for charts
  const axisColor = resolvedTheme === "dark" ? "#8b949e" : "#64748b";
  const gridColor = resolvedTheme === "dark" ? "#30363d" : "#e2e8f0";
  const barColor = resolvedTheme === "dark" ? "#d97706" : "#d97706";
  const tooltipBg = resolvedTheme === "dark" ? "#161b22" : "#ffffff";
  const tooltipBorder = resolvedTheme === "dark" ? "#30363d" : "#e2e8f0";
  const tooltipText = resolvedTheme === "dark" ? "#f8fafc" : "#0f172a";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = subDays(today, 13); // Last 14 days
  const days = eachDayOfInterval({ start: startDate, end: today });

  // Format date range label using native Intl (no extra deps)
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(d);
  const dateRangeLabel = `${fmt(startDate)} - ${fmt(today)}`;

  // Compute daily completion rates
  const chartData = days.map((day) => {
    let completedCount = 0;
    let expectedCount = habits.length;

    habits.forEach((habit) => {
      const log = habit.logs.find(l => {
        const ld = new Date(l.date);
        return ld.getDate() === day.getDate() && ld.getMonth() === day.getMonth() && ld.getFullYear() === day.getFullYear();
      });
      if (log?.isCompleted) {
        completedCount++;
      }
    });

    const completionRate = expectedCount > 0 ? Math.round((completedCount / expectedCount) * 100) : 0;

    return {
      date: format(day, "MMM d"),
      "Completed Habits": completedCount,
      "Completion Rate": completionRate,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Bar Chart: Daily Volume */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[300px]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Volume Overview</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Showing past 14 days ({dateRangeLabel})</p>
        </div>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: resolvedTheme === 'dark' ? '#30363d' : '#f1f5f9', opacity: 0.4 }}
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: barColor, fontWeight: 'bold' }}
              />
              <Bar dataKey="Completed Habits" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart: Percentage Consistency */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col h-[300px]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Consistency Trend (%)</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Showing past 14 days ({dateRangeLabel})</p>
        </div>
        <div className="flex-1 w-full relative min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: barColor, fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="Completion Rate" stroke={barColor} strokeWidth={3} dot={{ r: 4, fill: tooltipBg, stroke: barColor, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
