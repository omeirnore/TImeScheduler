import {
  complement,
  consume,
  findEarliestFit,
  mergeIntervals,
  type Interval,
} from "./intervals";
import type {
  DayScheduleInput,
  DayScheduleResult,
  ScheduleBlock,
  UnscheduledItem,
} from "./types";

const MIN_FREE_BLOCK_MINUTES = 5;

function overlapsAny(iv: Interval, busy: Interval[]): boolean {
  return busy.some((b) => iv.start < b.end && b.start < iv.end);
}

/**
 * Computes a full day's timeline from source data:
 * college timetable -> commute + rest -> study plan -> habits (by priority) -> leftover free time.
 * Pure function: no I/O, deterministic, easy to unit test.
 */
export function generateDaySchedule(input: DayScheduleInput): DayScheduleResult {
  const { timetableSlots, commute, studyEntries, habits, dayOfWeek } = input;

  const blocks: ScheduleBlock[] = [];
  const busy: Interval[] = [];
  const unscheduled: UnscheduledItem[] = [];

  const isCollegeDay = timetableSlots.length > 0;

  const sortedSlots = [...timetableSlots].sort((a, b) => a.startMinute - b.startMinute);
  for (const slot of sortedSlots) {
    blocks.push({
      startMinute: slot.startMinute,
      endMinute: slot.endMinute,
      type: "COLLEGE",
      label: slot.subject + (slot.room ? ` (${slot.room})` : ""),
      sourceId: slot.id,
    });
    busy.push({ start: slot.startMinute, end: slot.endMinute });
  }

  if (isCollegeDay) {
    const firstStart = Math.min(...sortedSlots.map((s) => s.startMinute));
    const lastEnd = Math.max(...sortedSlots.map((s) => s.endMinute));

    const commuteToStart = Math.max(0, firstStart - commute.toCollegeMinutes);
    if (commuteToStart < firstStart) {
      blocks.push({
        startMinute: commuteToStart,
        endMinute: firstStart,
        type: "COMMUTE",
        label: "Commute to college",
      });
      busy.push({ start: commuteToStart, end: firstStart });
    }

    const commuteFromEnd = lastEnd + commute.fromCollegeMinutes;
    blocks.push({
      startMinute: lastEnd,
      endMinute: commuteFromEnd,
      type: "COMMUTE",
      label: "Commute home",
    });
    busy.push({ start: lastEnd, end: commuteFromEnd });

    const restEnd = commuteFromEnd + commute.restBufferMinutes;
    blocks.push({
      startMinute: commuteFromEnd,
      endMinute: restEnd,
      type: "REST",
      label: "Rest / wind-down",
    });
    busy.push({ start: commuteFromEnd, end: restEnd });
  }

  // Locked habits are placed at their exact fixed time, same tier as college/commute/rest.
  const lockedHabits = habits
    .filter((h) => h.locked && h.targetDays.includes(dayOfWeek))
    .sort((a, b) => (a.lockedStartMinute ?? 0) - (b.lockedStartMinute ?? 0));

  for (const habit of lockedHabits) {
    const start = habit.lockedStartMinute ?? 0;
    const iv: Interval = { start, end: start + habit.durationMinutes };
    if (overlapsAny(iv, busy)) {
      unscheduled.push({
        kind: "HABIT",
        id: habit.id,
        label: habit.name,
        durationMinutes: habit.durationMinutes,
        reason: "Locked time conflicts with an existing commitment",
      });
      continue;
    }
    blocks.push({
      startMinute: iv.start,
      endMinute: iv.end,
      type: "HABIT",
      label: habit.name,
      sourceId: habit.id,
      locked: true,
    });
    busy.push(iv);
  }

  const dayBound: Interval = { start: commute.wakeMinute, end: commute.sleepMinute };
  const freeIntervals = complement(mergeIntervals(busy), dayBound);

  // Study plan entries are placed before floating habits, per spec priority order.
  const sortedStudy = [...studyEntries].sort((a, b) => a.orderIndex - b.orderIndex);
  for (const entry of sortedStudy) {
    const fit = findEarliestFit(freeIntervals, entry.durationMinutes);
    if (!fit) {
      unscheduled.push({
        kind: "STUDY",
        id: entry.id,
        label: entry.subjectName,
        durationMinutes: entry.durationMinutes,
        reason: "No free gap large enough today",
      });
      continue;
    }
    blocks.push({
      startMinute: fit.start,
      endMinute: fit.start + entry.durationMinutes,
      type: "STUDY",
      label: entry.subjectName,
      sourceId: entry.id,
    });
    consume(freeIntervals, fit.intervalIndex, fit.start, entry.durationMinutes);
  }

  // Floating (unlocked) habits fill remaining gaps, highest priority (lowest number) first.
  const floatingHabits = habits
    .filter((h) => !h.locked && h.targetDays.includes(dayOfWeek))
    .sort((a, b) => a.priority - b.priority);

  for (const habit of floatingHabits) {
    const window: Interval | undefined =
      habit.preferredStartMinute != null && habit.preferredEndMinute != null
        ? { start: habit.preferredStartMinute, end: habit.preferredEndMinute }
        : undefined;
    const fit = findEarliestFit(freeIntervals, habit.durationMinutes, window);
    if (!fit) {
      unscheduled.push({
        kind: "HABIT",
        id: habit.id,
        label: habit.name,
        durationMinutes: habit.durationMinutes,
        reason: window
          ? "No free gap in preferred time window"
          : "No free time left today",
      });
      continue;
    }
    blocks.push({
      startMinute: fit.start,
      endMinute: fit.start + habit.durationMinutes,
      type: "HABIT",
      label: habit.name,
      sourceId: habit.id,
    });
    consume(freeIntervals, fit.intervalIndex, fit.start, habit.durationMinutes);
  }

  for (const free of freeIntervals) {
    if (free.end - free.start >= MIN_FREE_BLOCK_MINUTES) {
      blocks.push({
        startMinute: free.start,
        endMinute: free.end,
        type: "FREE",
        label: "Free time",
      });
    }
  }

  blocks.sort((a, b) => a.startMinute - b.startMinute);

  return { isCollegeDay, blocks, unscheduled };
}
