"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";
import { dateKeyToDayOfWeek } from "@/lib/time";

const entrySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  subjectId: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(5).max(480),
});

export interface StudyPlanFormState {
  error?: string;
}

export async function addStudyPlanEntryAction(
  _prevState: StudyPlanFormState,
  formData: FormData
): Promise<StudyPlanFormState> {
  const userId = await requireUserId();

  const parsed = entrySchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    subjectId: formData.get("subjectId"),
    durationMinutes: formData.get("durationMinutes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const subject = await db.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
  });
  if (!subject) {
    return { error: "Choose a valid subject" };
  }

  const count = await db.studyPlanEntry.count({
    where: { userId, dayOfWeek: parsed.data.dayOfWeek },
  });

  await db.studyPlanEntry.create({
    data: {
      userId,
      dayOfWeek: parsed.data.dayOfWeek,
      subjectId: parsed.data.subjectId,
      durationMinutes: parsed.data.durationMinutes,
      orderIndex: count,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteStudyPlanEntryAction(entryId: string): Promise<void> {
  const userId = await requireUserId();
  await db.studyPlanEntry.deleteMany({ where: { id: entryId, userId } });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

const overrideEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  subjectId: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(5).max(480),
});

export interface StudyOverrideFormState {
  error?: string;
}

/**
 * Finds the override row for a date, or creates one seeded with a copy of that
 * weekday's template entries. This is a copy-on-write: the first edit to a date
 * snapshots the template so later template changes don't retroactively affect it,
 * and so the entries shown on screen (template-derived or not) always have a real
 * row to edit.
 */
async function getOrCreateOverrideDay(userId: string, date: string) {
  const existing = await db.studyPlanOverrideDay.findUnique({
    where: { userId_date: { userId, date } },
  });
  if (existing) return existing;

  const dayOfWeek = dateKeyToDayOfWeek(date);
  const templateEntries = await db.studyPlanEntry.findMany({
    where: { userId, dayOfWeek },
    orderBy: { orderIndex: "asc" },
  });

  return db.studyPlanOverrideDay.create({
    data: {
      userId,
      date,
      entries: {
        create: templateEntries.map((e) => ({
          subjectId: e.subjectId,
          durationMinutes: e.durationMinutes,
          orderIndex: e.orderIndex,
        })),
      },
    },
  });
}

export async function addStudyOverrideEntryAction(
  _prevState: StudyOverrideFormState,
  formData: FormData
): Promise<StudyOverrideFormState> {
  const userId = await requireUserId();

  const parsed = overrideEntrySchema.safeParse({
    date: formData.get("date"),
    subjectId: formData.get("subjectId"),
    durationMinutes: formData.get("durationMinutes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const subject = await db.subject.findFirst({
    where: { id: parsed.data.subjectId, userId },
  });
  if (!subject) {
    return { error: "Choose a valid subject" };
  }

  const overrideDay = await getOrCreateOverrideDay(userId, parsed.data.date);
  const count = await db.studyPlanOverrideEntry.count({
    where: { dayId: overrideDay.id },
  });

  await db.studyPlanOverrideEntry.create({
    data: {
      dayId: overrideDay.id,
      subjectId: parsed.data.subjectId,
      durationMinutes: parsed.data.durationMinutes,
      orderIndex: count,
    },
  });

  revalidatePath("/dashboard");
  return {};
}

export async function deleteStudyOverrideEntryAction(entryId: string): Promise<void> {
  const userId = await requireUserId();
  await db.studyPlanOverrideEntry.deleteMany({
    where: { id: entryId, day: { userId } },
  });
  revalidatePath("/dashboard");
}

/** Removes today's override entirely, reverting that date back to the weekly template. */
export async function resetStudyOverrideAction(dateKey: string): Promise<void> {
  const userId = await requireUserId();
  await db.studyPlanOverrideDay.deleteMany({ where: { userId, date: dateKey } });
  revalidatePath("/dashboard");
}

/** Starts customizing a date: seeds an override row from the template if one doesn't exist yet. */
export async function startCustomizingStudyPlanAction(dateKey: string): Promise<void> {
  const userId = await requireUserId();
  await getOrCreateOverrideDay(userId, dateKey);
  revalidatePath("/dashboard");
}
