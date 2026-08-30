"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";
import { backupSchema } from "@/lib/data-transfer/schema";

export interface ImportFormState {
  error?: string;
  success?: boolean;
}

export async function importDataAction(
  _prevState: ImportFormState,
  formData: FormData
): Promise<ImportFormState> {
  const userId = await requireUserId();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a backup file to import" };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(await file.text());
  } catch {
    return { error: "That file isn't valid JSON" };
  }

  const parsed = backupSchema.safeParse(parsedJson);
  if (!parsed.success) {
    return { error: "That file doesn't look like a TimeScheduler backup" };
  }
  const backup = parsed.data;

  await db.$transaction(async (tx) => {
    // Wiping these root tables cascades to their child rows (skips, log entries,
    // override entries, milestones) automatically.
    await tx.timetableSlot.deleteMany({ where: { userId } });
    await tx.commuteConfig.deleteMany({ where: { userId } });
    await tx.subject.deleteMany({ where: { userId } });
    await tx.studyPlanEntry.deleteMany({ where: { userId } });
    await tx.studyPlanOverrideDay.deleteMany({ where: { userId } });
    await tx.habit.deleteMany({ where: { userId } });
    await tx.task.deleteMany({ where: { userId } });
    await tx.goal.deleteMany({ where: { userId } });

    if (backup.commuteConfig) {
      await tx.commuteConfig.create({ data: { userId, ...backup.commuteConfig } });
    }

    for (const slot of backup.timetableSlots) {
      await tx.timetableSlot.create({
        data: {
          userId,
          dayOfWeek: slot.dayOfWeek,
          startMinute: slot.startMinute,
          endMinute: slot.endMinute,
          subject: slot.subject,
          room: slot.room,
          type: slot.type,
          skips: { create: slot.skips },
        },
      });
    }

    const subjectIdByName = new Map<string, string>();
    for (const subject of backup.subjects) {
      const created = await tx.subject.create({
        data: { userId, name: subject.name, category: subject.category },
      });
      subjectIdByName.set(subject.name, created.id);
    }

    for (const entry of backup.studyPlanEntries) {
      const subjectId = subjectIdByName.get(entry.subjectName);
      if (!subjectId) continue;
      await tx.studyPlanEntry.create({
        data: {
          userId,
          dayOfWeek: entry.dayOfWeek,
          subjectId,
          durationMinutes: entry.durationMinutes,
          orderIndex: entry.orderIndex,
        },
      });
    }

    for (const day of backup.studyPlanOverrideDays) {
      await tx.studyPlanOverrideDay.create({
        data: {
          userId,
          date: day.date,
          entries: {
            create: day.entries
              .filter((e) => subjectIdByName.has(e.subjectName))
              .map((e) => ({
                subjectId: subjectIdByName.get(e.subjectName)!,
                durationMinutes: e.durationMinutes,
                orderIndex: e.orderIndex,
              })),
          },
        },
      });
    }

    for (const habit of backup.habits) {
      await tx.habit.create({
        data: {
          userId,
          name: habit.name,
          category: habit.category,
          targetDays: JSON.stringify(habit.targetDays),
          preferredStartMinute: habit.preferredStartMinute,
          preferredEndMinute: habit.preferredEndMinute,
          durationMinutes: habit.durationMinutes,
          priority: habit.priority,
          locked: habit.locked,
          lockedStartMinute: habit.lockedStartMinute,
          logs: { create: habit.logs },
        },
      });
    }

    for (const task of backup.tasks) {
      await tx.task.create({
        data: {
          userId,
          title: task.title,
          date: task.date,
          estimatedMinutes: task.estimatedMinutes,
          category: task.category,
          term: task.term,
          completed: task.completed,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          orderIndex: task.orderIndex,
        },
      });
    }

    for (const goal of backup.goals) {
      await tx.goal.create({
        data: {
          userId,
          title: goal.title,
          description: goal.description,
          targetDate: goal.targetDate,
          milestones: { create: goal.milestones },
        },
      });
    }
  });

  revalidatePath("/", "layout");
  return { success: true };
}
