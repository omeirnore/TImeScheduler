import "server-only";
import { db } from "@/lib/db";
import { dateKeyToDayOfWeek } from "@/lib/time";
import { computeHabitStreak } from "./streak";

export interface HabitTodayStatus {
  habitId: string;
  name: string;
  loggedToday: boolean;
  streak: number;
}

/** Habits scheduled for todayKey's day-of-week, with their logged-today state and current streak. */
export async function getTodayHabitStatus(
  userId: string,
  todayKey: string
): Promise<HabitTodayStatus[]> {
  const dayOfWeek = dateKeyToDayOfWeek(todayKey);
  const habits = await db.habit.findMany({ where: { userId } });
  const scheduledToday = habits.filter((h) =>
    (JSON.parse(h.targetDays) as number[]).includes(dayOfWeek)
  );
  if (scheduledToday.length === 0) return [];

  const logs = await db.habitLog.findMany({
    where: { habitId: { in: scheduledToday.map((h) => h.id) }, completed: true },
    select: { habitId: true, date: true },
  });

  const logsByHabit = new Map<string, Set<string>>();
  for (const log of logs) {
    const set = logsByHabit.get(log.habitId) ?? new Set<string>();
    set.add(log.date);
    logsByHabit.set(log.habitId, set);
  }

  return scheduledToday.map((h) => {
    const loggedDates = logsByHabit.get(h.id) ?? new Set<string>();
    return {
      habitId: h.id,
      name: h.name,
      loggedToday: loggedDates.has(todayKey),
      streak: computeHabitStreak(JSON.parse(h.targetDays), loggedDates, todayKey),
    };
  });
}

/** Which of the given habit IDs are logged done on dateKey (for rendering the timeline's mark-done state). */
export async function getLoggedHabitIds(habitIds: string[], dateKey: string): Promise<Set<string>> {
  if (habitIds.length === 0) return new Set();
  const logs = await db.habitLog.findMany({
    where: { habitId: { in: habitIds }, date: dateKey, completed: true },
    select: { habitId: true },
  });
  return new Set(logs.map((l) => l.habitId));
}
