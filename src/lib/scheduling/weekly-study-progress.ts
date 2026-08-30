import "server-only";
import { getWeekRange, shiftDateKey } from "@/lib/time";
import { getDayContext } from "./day-context";

export interface WeeklyStudyProgress {
  plannedMinutes: number;
  elapsedMinutes: number;
}

/**
 * Sums this week's planned study time (from the scheduled STUDY blocks, template or override)
 * against how much of it has already occurred by `nowMinute` on `todayKey` — i.e. "how far
 * through this week's study plan are you," with no separate completion-tracking concept.
 */
export async function getWeeklyStudyProgress(
  userId: string,
  todayKey: string,
  nowMinute: number
): Promise<WeeklyStudyProgress> {
  const { start } = getWeekRange(todayKey);

  let plannedMinutes = 0;
  let elapsedMinutes = 0;

  let cursor = start;
  for (let i = 0; i < 7; i++) {
    const context = await getDayContext(userId, cursor);
    const studyBlocks = context.result.blocks.filter((b) => b.type === "STUDY");
    const dayMinutes = studyBlocks.reduce((sum, b) => sum + (b.endMinute - b.startMinute), 0);
    plannedMinutes += dayMinutes;

    if (cursor < todayKey) {
      elapsedMinutes += dayMinutes;
    } else if (cursor === todayKey) {
      elapsedMinutes += studyBlocks
        .filter((b) => b.endMinute <= nowMinute)
        .reduce((sum, b) => sum + (b.endMinute - b.startMinute), 0);
    }

    cursor = shiftDateKey(cursor, 1);
  }

  return { plannedMinutes, elapsedMinutes };
}
