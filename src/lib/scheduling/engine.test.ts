import { describe, expect, it } from "vitest";
import { generateDaySchedule } from "./engine";
import type {
  CommuteConfigInput,
  DayScheduleInput,
  HabitInput,
} from "./types";

const commute: CommuteConfigInput = {
  toCollegeMinutes: 30,
  fromCollegeMinutes: 30,
  restBufferMinutes: 45,
  wakeMinute: 6 * 60, // 06:00
  sleepMinute: 23 * 60, // 23:00
};

function baseInput(overrides: Partial<DayScheduleInput> = {}): DayScheduleInput {
  return {
    dayOfWeek: 1, // Monday
    timetableSlots: [],
    commute,
    studyEntries: [],
    habits: [],
    ...overrides,
  };
}

describe("generateDaySchedule", () => {
  it("marks a day with no timetable slots as an off day", () => {
    const result = generateDaySchedule(baseInput());
    expect(result.isCollegeDay).toBe(false);
    expect(result.blocks.some((b) => b.type === "COMMUTE")).toBe(false);
  });

  it("wraps college slots with commute and rest blocks", () => {
    const result = generateDaySchedule(
      baseInput({
        timetableSlots: [
          { id: "s1", startMinute: 8 * 60, endMinute: 9 * 60, subject: "DSA" },
          { id: "s2", startMinute: 9 * 60, endMinute: 10 * 60, subject: "Maths" },
        ],
      })
    );

    expect(result.isCollegeDay).toBe(true);
    const commuteTo = result.blocks.find(
      (b) => b.type === "COMMUTE" && b.label === "Commute to college"
    );
    const commuteHome = result.blocks.find(
      (b) => b.type === "COMMUTE" && b.label === "Commute home"
    );
    const rest = result.blocks.find((b) => b.type === "REST");

    expect(commuteTo).toEqual({
      startMinute: 7 * 60 + 30,
      endMinute: 8 * 60,
      type: "COMMUTE",
      label: "Commute to college",
    });
    expect(commuteHome).toEqual({
      startMinute: 10 * 60,
      endMinute: 10 * 60 + 30,
      type: "COMMUTE",
      label: "Commute home",
    });
    expect(rest).toEqual({
      startMinute: 10 * 60 + 30,
      endMinute: 11 * 60 + 15,
      type: "REST",
      label: "Rest / wind-down",
    });
  });

  it("clamps commute-to at midnight instead of going negative", () => {
    const result = generateDaySchedule(
      baseInput({
        timetableSlots: [
          { id: "s1", startMinute: 10, endMinute: 60, subject: "Early Lab" },
        ],
      })
    );
    const commuteTo = result.blocks.find(
      (b) => b.type === "COMMUTE" && b.label === "Commute to college"
    );
    expect(commuteTo?.startMinute).toBe(0);
    expect(commuteTo?.endMinute).toBe(10);
  });

  it("places study entries into the free gap in order", () => {
    const result = generateDaySchedule(
      baseInput({
        studyEntries: [
          { id: "st1", subjectName: "DSA revision", durationMinutes: 60, orderIndex: 0 },
          { id: "st2", subjectName: "Networks", durationMinutes: 30, orderIndex: 1 },
        ],
      })
    );
    const dsa = result.blocks.find((b) => b.sourceId === "st1");
    const net = result.blocks.find((b) => b.sourceId === "st2");
    expect(dsa?.startMinute).toBe(commute.wakeMinute);
    expect(dsa?.endMinute).toBe(commute.wakeMinute + 60);
    expect(net?.startMinute).toBe(commute.wakeMinute + 60);
    expect(net?.endMinute).toBe(commute.wakeMinute + 90);
  });

  it("places a locked habit at its exact time and leaves gaps around it", () => {
    const habit: HabitInput = {
      id: "h1",
      name: "Gym",
      targetDays: [1],
      durationMinutes: 90,
      priority: 0,
      locked: true,
      lockedStartMinute: 18 * 60,
    };
    const result = generateDaySchedule(baseInput({ habits: [habit] }));
    const gym = result.blocks.find((b) => b.sourceId === "h1");
    expect(gym).toMatchObject({
      startMinute: 18 * 60,
      endMinute: 19 * 60 + 30,
      type: "HABIT",
      locked: true,
    });
  });

  it("reports a locked habit as unscheduled when it conflicts with college", () => {
    const habit: HabitInput = {
      id: "h1",
      name: "Gym",
      targetDays: [1],
      durationMinutes: 60,
      priority: 0,
      locked: true,
      lockedStartMinute: 8 * 60 + 30, // overlaps the 08:00-10:00 lecture below
    };
    const result = generateDaySchedule(
      baseInput({
        timetableSlots: [
          { id: "s1", startMinute: 8 * 60, endMinute: 10 * 60, subject: "DSA" },
        ],
        habits: [habit],
      })
    );
    expect(result.blocks.some((b) => b.sourceId === "h1")).toBe(false);
    expect(result.unscheduled).toEqual([
      {
        kind: "HABIT",
        id: "h1",
        label: "Gym",
        durationMinutes: 60,
        reason: "Locked time conflicts with an existing commitment",
      },
    ]);
  });

  it("places floating habits by priority within their preferred window", () => {
    const gym: HabitInput = {
      id: "gym",
      name: "Gym",
      targetDays: [1],
      preferredStartMinute: 17 * 60,
      preferredEndMinute: 20 * 60,
      durationMinutes: 90,
      priority: 0,
      locked: false,
    };
    const reading: HabitInput = {
      id: "reading",
      name: "Reading",
      targetDays: [1],
      durationMinutes: 30,
      priority: 5,
      locked: false,
    };
    const result = generateDaySchedule(baseInput({ habits: [gym, reading] }));
    const gymBlock = result.blocks.find((b) => b.sourceId === "gym");
    const readingBlock = result.blocks.find((b) => b.sourceId === "reading");
    expect(gymBlock?.startMinute).toBe(17 * 60);
    expect(gymBlock?.endMinute).toBe(18 * 60 + 30);
    // Reading has no preferred window, so it floats into the earliest remaining gap.
    expect(readingBlock?.startMinute).toBe(commute.wakeMinute);
  });

  it("skips a habit not scheduled for the given day of week", () => {
    const habit: HabitInput = {
      id: "gym",
      name: "Gym",
      targetDays: [2, 4], // Tue/Thu only
      durationMinutes: 90,
      priority: 0,
      locked: false,
    };
    const result = generateDaySchedule(baseInput({ dayOfWeek: 1, habits: [habit] }));
    expect(result.blocks.some((b) => b.sourceId === "gym")).toBe(false);
    expect(result.unscheduled.some((u) => u.id === "gym")).toBe(false);
  });

  it("marks a habit unscheduled when its preferred window has no room", () => {
    const habit: HabitInput = {
      id: "gym",
      name: "Gym",
      targetDays: [1],
      preferredStartMinute: 8 * 60,
      preferredEndMinute: 9 * 60,
      durationMinutes: 90,
      priority: 0,
      locked: false,
    };
    const result = generateDaySchedule(baseInput({ habits: [habit] }));
    expect(result.blocks.some((b) => b.sourceId === "gym")).toBe(false);
    expect(result.unscheduled).toEqual([
      {
        kind: "HABIT",
        id: "gym",
        label: "Gym",
        durationMinutes: 90,
        reason: "No free gap in preferred time window",
      },
    ]);
  });

  it("never produces overlapping blocks", () => {
    const result = generateDaySchedule(
      baseInput({
        timetableSlots: [
          { id: "s1", startMinute: 8 * 60, endMinute: 13 * 60 + 30, subject: "Lectures" },
        ],
        studyEntries: [
          { id: "st1", subjectName: "DSA", durationMinutes: 120, orderIndex: 0 },
        ],
        habits: [
          {
            id: "gym",
            name: "Gym",
            targetDays: [1],
            preferredStartMinute: 18 * 60,
            preferredEndMinute: 20 * 60,
            durationMinutes: 90,
            priority: 0,
            locked: false,
          },
        ],
      })
    );

    const sorted = [...result.blocks].sort((a, b) => a.startMinute - b.startMinute);
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].startMinute).toBeGreaterThanOrEqual(sorted[i - 1].endMinute);
    }
    expect(result.unscheduled).toEqual([]);
  });
});
