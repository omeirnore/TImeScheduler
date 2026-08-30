import { dateKeyToDayOfWeek, shiftDateKey } from "@/lib/time";

const MAX_LOOKBACK_DAYS = 3650; // 10 years, just a safety bound on the walk-back

/**
 * Current streak for a habit: consecutive applicable days (its target days of week)
 * that have a completion log, walking backward from today. If today is an applicable
 * day but not yet logged, it doesn't break the streak (there's still time today) —
 * counting simply starts from the most recent applicable day before today instead.
 */
export function computeHabitStreak(
  targetDays: number[],
  loggedDates: Set<string>,
  todayKey: string
): number {
  if (targetDays.length === 0) return 0;

  let cursor = todayKey;
  const todayIsApplicable = targetDays.includes(dateKeyToDayOfWeek(todayKey));
  if (todayIsApplicable && !loggedDates.has(todayKey)) {
    cursor = shiftDateKey(cursor, -1);
  }

  let streak = 0;
  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const isApplicable = targetDays.includes(dateKeyToDayOfWeek(cursor));
    if (isApplicable) {
      if (loggedDates.has(cursor)) {
        streak++;
      } else {
        break;
      }
    }
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}
