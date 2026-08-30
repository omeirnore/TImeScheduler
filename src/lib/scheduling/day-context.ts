import "server-only";
import { db } from "@/lib/db";
import { dateKeyToDayOfWeek } from "@/lib/time";
import { generateDaySchedule } from "./engine";
import type { DayScheduleResult } from "./types";
import type { TimetableSlot } from "@/generated/prisma/client";

export interface DayContext {
  dateKey: string;
  dayOfWeek: number;
  result: DayScheduleResult;
  allSlots: TimetableSlot[];
  skippedSlotIds: Set<string>;
}

export async function getDayContext(userId: string, dateKey: string): Promise<DayContext> {
  const dayOfWeek = dateKeyToDayOfWeek(dateKey);

  const [allSlots, skips, commuteConfig, studyOverride, studyEntries, habits] =
    await Promise.all([
      db.timetableSlot.findMany({ where: { userId, dayOfWeek } }),
      db.slotSkip.findMany({ where: { date: dateKey, slot: { userId } } }),
      db.commuteConfig.upsert({ where: { userId }, update: {}, create: { userId } }),
      db.studyPlanOverrideDay.findUnique({
        where: { userId_date: { userId, date: dateKey } },
        include: { entries: { include: { subject: true }, orderBy: { orderIndex: "asc" } } },
      }),
      db.studyPlanEntry.findMany({
        where: { userId, dayOfWeek },
        include: { subject: true },
        orderBy: { orderIndex: "asc" },
      }),
      db.habit.findMany({ where: { userId } }),
    ]);

  const skippedSlotIds = new Set(skips.map((s) => s.slotId));
  const activeSlots = allSlots.filter((s) => !skippedSlotIds.has(s.id));

  const resolvedStudyEntries = studyOverride
    ? studyOverride.entries.map((e) => ({
        id: e.id,
        subjectName: e.subject.name,
        durationMinutes: e.durationMinutes,
        orderIndex: e.orderIndex,
      }))
    : studyEntries.map((e) => ({
        id: e.id,
        subjectName: e.subject.name,
        durationMinutes: e.durationMinutes,
        orderIndex: e.orderIndex,
      }));

  const habitInputs = habits.map((h) => ({
    id: h.id,
    name: h.name,
    targetDays: JSON.parse(h.targetDays) as number[],
    preferredStartMinute: h.preferredStartMinute,
    preferredEndMinute: h.preferredEndMinute,
    durationMinutes: h.durationMinutes,
    priority: h.priority,
    locked: h.locked,
    lockedStartMinute: h.lockedStartMinute,
  }));

  const result = generateDaySchedule({
    dayOfWeek,
    timetableSlots: activeSlots.map((s) => ({
      id: s.id,
      startMinute: s.startMinute,
      endMinute: s.endMinute,
      subject: s.subject,
      room: s.room,
    })),
    commute: {
      toCollegeMinutes: commuteConfig.toCollegeMinutes,
      fromCollegeMinutes: commuteConfig.fromCollegeMinutes,
      restBufferMinutes: commuteConfig.restBufferMinutes,
      wakeMinute: commuteConfig.wakeMinute,
      sleepMinute: commuteConfig.sleepMinute,
    },
    studyEntries: resolvedStudyEntries,
    habits: habitInputs,
  });

  return { dateKey, dayOfWeek, result, allSlots, skippedSlotIds };
}
