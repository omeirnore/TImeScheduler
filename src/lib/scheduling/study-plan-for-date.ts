import "server-only";
import { db } from "@/lib/db";
import { dateKeyToDayOfWeek } from "@/lib/time";

export interface ResolvedStudyEntry {
  id: string;
  subjectId: string;
  subjectName: string;
  durationMinutes: number;
  orderIndex: number;
}

export interface StudyPlanForDate {
  isOverride: boolean;
  entries: ResolvedStudyEntry[];
}

/** Resolves the study plan actually in effect for a date: the per-date override if one exists, else the weekly template. */
export async function getStudyPlanForDate(
  userId: string,
  dateKey: string
): Promise<StudyPlanForDate> {
  const overrideDay = await db.studyPlanOverrideDay.findUnique({
    where: { userId_date: { userId, date: dateKey } },
    include: { entries: { include: { subject: true }, orderBy: { orderIndex: "asc" } } },
  });

  if (overrideDay) {
    return {
      isOverride: true,
      entries: overrideDay.entries.map((e) => ({
        id: e.id,
        subjectId: e.subjectId,
        subjectName: e.subject.name,
        durationMinutes: e.durationMinutes,
        orderIndex: e.orderIndex,
      })),
    };
  }

  const dayOfWeek = dateKeyToDayOfWeek(dateKey);
  const templateEntries = await db.studyPlanEntry.findMany({
    where: { userId, dayOfWeek },
    include: { subject: true },
    orderBy: { orderIndex: "asc" },
  });

  return {
    isOverride: false,
    entries: templateEntries.map((e) => ({
      id: e.id,
      subjectId: e.subjectId,
      subjectName: e.subject.name,
      durationMinutes: e.durationMinutes,
      orderIndex: e.orderIndex,
    })),
  };
}
