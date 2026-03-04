import { Habit, HabitLog } from "@/types/habit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("tracker-token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getHabits = async (month?: number, year?: number): Promise<Habit[]> => {
  try {
    const url = new URL(`${API_BASE_URL}/habits`);
    if (month !== undefined) url.searchParams.append("month", month.toString());
    if (year !== undefined) url.searchParams.append("year", year.toString());

    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch habits");

    return data.data;
  } catch (error) {
    console.error("Error fetching habits:", error);
    throw error;
  }
};

export const createHabit = async (habitData: Partial<Habit>): Promise<Habit> => {
  try {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to create habit");

    return data.data;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
};

export const updateHabit = async (id: string, habitData: Partial<Habit>): Promise<Habit> => {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(habitData),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to update habit");

    return data.data;
  } catch (error) {
    console.error("Error updating habit:", error);
    throw error;
  }
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to delete habit");

    return true;
  } catch (error) {
    console.error("Error deleting habit:", error);
    throw error;
  }
};

export const toggleHabitLog = async (habitId: string, date: string, isCompleted: boolean): Promise<HabitLog> => {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}/logs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, isCompleted }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to toggle habit log");

    return data.data;
  } catch (error) {
    console.error("Error toggling habit log:", error);
    throw error;
  }
};

export const bulkUpdateHabitLogs = async (logs: Array<{ habitId: string; date: string; isCompleted: boolean }>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/habits/logs/bulk`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ logs }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to bulk update habit logs");

    return true;
  } catch (error) {
    console.error("Error performing bulk habit log update:", error);
    throw error;
  }
};
