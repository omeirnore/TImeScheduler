"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.enum(["COLLEGE", "SELF_STUDY", "HEALTH", "PERSONAL", "ADMIN"]),
  term: z.enum(["SHORT_TERM", "LONG_TERM"]),
  estimatedMinutes: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v > 0 && v <= 1440), {
      message: "Enter a valid duration in minutes",
    }),
});

export interface TaskFormState {
  error?: string;
}

export async function addTaskAction(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const userId = await requireUserId();

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    category: formData.get("category"),
    term: formData.get("term"),
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const count = await db.task.count({ where: { userId, date: parsed.data.date } });

  await db.task.create({
    data: {
      userId,
      title: parsed.data.title,
      date: parsed.data.date,
      category: parsed.data.category,
      term: parsed.data.term,
      estimatedMinutes: parsed.data.estimatedMinutes,
      orderIndex: count,
    },
  });

  revalidatePath("/dashboard");
  return {};
}

/** Persists a drag-and-drop reorder: taskIds in their new display order. */
export async function reorderTasksAction(taskIds: string[]): Promise<void> {
  const userId = await requireUserId();
  const tasks = await db.task.findMany({
    where: { id: { in: taskIds }, userId },
    select: { id: true },
  });
  const ownedIds = new Set(tasks.map((t) => t.id));

  await db.$transaction(
    taskIds
      .filter((id) => ownedIds.has(id))
      .map((id, index) => db.task.update({ where: { id }, data: { orderIndex: index } }))
  );

  revalidatePath("/dashboard");
}

export async function toggleTaskCompletedAction(taskId: string): Promise<void> {
  const userId = await requireUserId();
  const task = await db.task.findFirst({ where: { id: taskId, userId } });
  if (!task) return;

  await db.task.update({
    where: { id: taskId },
    data: {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : null,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteTaskAction(taskId: string): Promise<void> {
  const userId = await requireUserId();
  await db.task.deleteMany({ where: { id: taskId, userId } });
  revalidatePath("/dashboard");
}
