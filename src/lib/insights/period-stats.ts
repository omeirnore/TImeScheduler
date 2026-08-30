import "server-only";
import { db } from "@/lib/db";
import { dateKeyToDayOfWeek, formatDateKey, shiftDateKey } from "@/lib/time";
import { getCategoryTotalsForRange, type DayCategoryTotals } from "@/lib/scheduling/weekly-category-totals";

export interface PeriodStats {
  days: DayCategoryTotals[];
  studyHours: number;
  habitHitRatePct: number | null;
  mostProductiveDay: { dateKey: string; label: string; completedTasks: number } | null;
}

export async function getPeriodStats(
  userId: string,
  startKey: string,
  dayCount: number
): Promise<PeriodStats> {
  const endKey = shiftDateKey(startKey, dayCount - 1);

  const [days, habits, tasks] = await Promise.all([
    getCategoryTotalsForRange(userId, startKey, dayCount),
    db.habit.findMany({ where: { userId } }),
    db.task.findMany({
      where: { userId, date: { gte: startKey, lte: endKey } },
      select: { date: true, completed: true },
    }),
  ]);

  const studyMinutes = days.reduce((sum, d) => sum + d.minutesByType.STUDY, 0);

  // Habit hit-rate: completed logs on applicable days / total applicable days across all habits.
  let applicableDays = 0;
  let completedDays = 0;
  if (habits.length > 0) {
    const logs = await db.habitLog.findMany({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        date: { gte: startKey, lte: endKey },
        completed: true,
      },
      select: { habitId: true, date: true },
    });
    const loggedByHabit = new Map<string, Set<string>>();
    for (const log of logs) {
      const set = loggedByHabit.get(log.habitId) ?? new Set<string>();
      set.add(log.date);
      loggedByHabit.set(log.habitId, set);
    }

    for (const habit of habits) {
      const targetDays: number[] = JSON.parse(habit.targetDays);
      const loggedDates = loggedByHabit.get(habit.id) ?? new Set<string>();
      let cursor = startKey;
      for (let i = 0; i < dayCount; i++) {
        if (targetDays.includes(dateKeyToDayOfWeek(cursor))) {
          applicableDays++;
          if (loggedDates.has(cursor)) completedDays++;
        }
        cursor = shiftDateKey(cursor, 1);
      }
    }
  }

  const completedByDate = new Map<string, number>();
  for (const task of tasks) {
    if (!task.completed) continue;
    completedByDate.set(task.date, (completedByDate.get(task.date) ?? 0) + 1);
  }
  let mostProductiveDay: PeriodStats["mostProductiveDay"] = null;
  for (const [dateKey, completedTasks] of completedByDate) {
    if (!mostProductiveDay || completedTasks > mostProductiveDay.completedTasks) {
      mostProductiveDay = { dateKey, label: formatDateKey(dateKey), completedTasks };
    }
  }

  return {
    days,
    studyHours: Math.round((studyMinutes / 60) * 10) / 10,
    habitHitRatePct: applicableDays > 0 ? Math.round((completedDays / applicableDays) * 100) : null,
    mostProductiveDay,
  };
}
