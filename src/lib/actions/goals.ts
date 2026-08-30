"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";

const goalSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().max(500).optional(),
  targetDate: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: "Invalid date",
    }),
});

export interface GoalFormState {
  error?: string;
}

export async function addGoalAction(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const userId = await requireUserId();

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    targetDate: formData.get("targetDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.goal.create({
    data: {
      userId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      targetDate: parsed.data.targetDate ?? null,
    },
  });

  revalidatePath("/goals");
  return {};
}

export async function deleteGoalAction(goalId: string): Promise<void> {
  const userId = await requireUserId();
  await db.goal.deleteMany({ where: { id: goalId, userId } });
  revalidatePath("/goals");
}

const milestoneSchema = z.object({
  goalId: z.string().min(1),
  title: z.string().trim().min(1, "Milestone title is required").max(150),
});

export interface MilestoneFormState {
  error?: string;
}

export async function addMilestoneAction(
  _prevState: MilestoneFormState,
  formData: FormData
): Promise<MilestoneFormState> {
  const userId = await requireUserId();

  const parsed = milestoneSchema.safeParse({
    goalId: formData.get("goalId"),
    title: formData.get("title"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const goal = await db.goal.findFirst({ where: { id: parsed.data.goalId, userId } });
  if (!goal) {
    return { error: "Goal not found" };
  }

  const count = await db.milestone.count({ where: { goalId: goal.id } });

  await db.milestone.create({
    data: { goalId: goal.id, title: parsed.data.title, orderIndex: count },
  });

  revalidatePath("/goals");
  return {};
}

export async function toggleMilestoneAction(milestoneId: string): Promise<void> {
  const userId = await requireUserId();
  const milestone = await db.milestone.findFirst({
    where: { id: milestoneId, goal: { userId } },
  });
  if (!milestone) return;

  await db.milestone.update({
    where: { id: milestoneId },
    data: { completed: !milestone.completed },
  });

  revalidatePath("/goals");
}

export async function deleteMilestoneAction(milestoneId: string): Promise<void> {
  const userId = await requireUserId();
  await db.milestone.deleteMany({ where: { id: milestoneId, goal: { userId } } });
  revalidatePath("/goals");
}
