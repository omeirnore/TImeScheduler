import "server-only";
import { shiftDateKey } from "@/lib/time";
import { getDayContext } from "./day-context";
import type { BlockType } from "./types";

export interface DayCategoryTotals {
  dateKey: string;
  minutesByType: Record<BlockType, number>;
}

/** Per-day total minutes by block category, for `dayCount` days starting at startKey. */
export async function getCategoryTotalsForRange(
  userId: string,
  startKey: string,
  dayCount: number
): Promise<DayCategoryTotals[]> {
  const dateKeys: string[] = [];
  let cursor = startKey;
  for (let i = 0; i < dayCount; i++) {
    dateKeys.push(cursor);
    cursor = shiftDateKey(cursor, 1);
  }

  const contexts = await Promise.all(dateKeys.map((dateKey) => getDayContext(userId, dateKey)));

  return contexts.map((context, i) => {
    const minutesByType: Record<BlockType, number> = {
      COLLEGE: 0,
      COMMUTE: 0,
      REST: 0,
      STUDY: 0,
      HABIT: 0,
      FREE: 0,
    };
    for (const block of context.result.blocks) {
      minutesByType[block.type] += block.endMinute - block.startMinute;
    }
    return { dateKey: dateKeys[i], minutesByType };
  });
}

/** Per-day total minutes by block category, for the 7 days starting at weekStartKey. */
export function getWeeklyCategoryTotals(
  userId: string,
  weekStartKey: string
): Promise<DayCategoryTotals[]> {
  return getCategoryTotalsForRange(userId, weekStartKey, 7);
}
