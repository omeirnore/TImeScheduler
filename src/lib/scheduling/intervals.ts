export interface Interval {
  start: number;
  end: number;
}

/** Sorts and merges overlapping/adjacent intervals. */
export function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [sorted[0]];
  for (const cur of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (cur.start <= last.end) {
      last.end = Math.max(last.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

/** Complement of `busy` (already merged, sorted) within [bound.start, bound.end). */
export function complement(busy: Interval[], bound: Interval): Interval[] {
  const free: Interval[] = [];
  let cursor = bound.start;
  for (const b of busy) {
    const start = Math.max(b.start, bound.start);
    const end = Math.min(b.end, bound.end);
    if (start >= end) continue;
    if (start > cursor) free.push({ start: cursor, end: start });
    cursor = Math.max(cursor, end);
  }
  if (cursor < bound.end) free.push({ start: cursor, end: bound.end });
  return free;
}

/**
 * Finds the earliest free interval (from a sorted, non-overlapping list) that can
 * fit `duration` minutes, optionally constrained to overlap `window`.
 * Returns the placement start time and the index of the interval it was cut from, or null.
 */
export function findEarliestFit(
  freeIntervals: Interval[],
  duration: number,
  window?: Interval
): { start: number; intervalIndex: number } | null {
  for (let i = 0; i < freeIntervals.length; i++) {
    const iv = freeIntervals[i];
    const lo = window ? Math.max(iv.start, window.start) : iv.start;
    const hi = window ? Math.min(iv.end, window.end) : iv.end;
    if (hi - lo >= duration) {
      return { start: lo, intervalIndex: i };
    }
  }
  return null;
}

/** Removes [start, start+duration) from freeIntervals[index], splitting as needed. In place. */
export function consume(
  freeIntervals: Interval[],
  index: number,
  start: number,
  duration: number
): void {
  const iv = freeIntervals[index];
  const end = start + duration;
  const remainder: Interval[] = [];
  if (iv.start < start) remainder.push({ start: iv.start, end: start });
  if (end < iv.end) remainder.push({ start: end, end: iv.end });
  freeIntervals.splice(index, 1, ...remainder);
}
