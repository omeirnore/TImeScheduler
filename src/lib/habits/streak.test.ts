import { describe, expect, it } from "vitest";
import { computeHabitStreak } from "./streak";

// A Sunday, for a stable reference point (2026-08-30 is a Sunday).
const TODAY = "2026-08-30";
const DAILY = [0, 1, 2, 3, 4, 5, 6];

describe("computeHabitStreak", () => {
  it("is 0 with no logs at all", () => {
    expect(computeHabitStreak(DAILY, new Set(), TODAY)).toBe(0);
  });

  it("counts today when today is logged", () => {
    expect(computeHabitStreak(DAILY, new Set([TODAY]), TODAY)).toBe(1);
  });

  it("doesn't break the streak if today isn't logged yet, but counts from yesterday", () => {
    const logged = new Set(["2026-08-29", "2026-08-28"]);
    expect(computeHabitStreak(DAILY, logged, TODAY)).toBe(2);
  });

  it("stops at the first gap", () => {
    const logged = new Set(["2026-08-29", "2026-08-27"]); // 28th missing
    expect(computeHabitStreak(DAILY, logged, TODAY)).toBe(1);
  });

  it("only counts applicable days for a non-daily habit (Mon/Wed/Fri)", () => {
    // Mon=1, Wed=3, Fri=5. Today (Sun) isn't applicable, so counting starts at Fri 28th.
    const logged = new Set(["2026-08-28", "2026-08-26", "2026-08-24"]);
    expect(computeHabitStreak([1, 3, 5], logged, TODAY)).toBe(3);
  });

  it("skips inapplicable days without breaking the streak", () => {
    // Mon/Wed/Fri habit; Tue/Thu/weekend gaps in the log shouldn't matter.
    const logged = new Set(["2026-08-28"]); // last Friday only
    expect(computeHabitStreak([1, 3, 5], logged, TODAY)).toBe(1);
  });

  it("returns 0 for a habit with no target days", () => {
    expect(computeHabitStreak([], new Set([TODAY]), TODAY)).toBe(0);
  });
});
