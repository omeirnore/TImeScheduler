"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";
import { hhmmToMinutes } from "@/lib/time";

const timeField = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d{2}:\d{2}$/.test(v), { message: "Invalid time" });

const habitSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    category: z.enum(["GYM", "READING", "MEALS", "PERSONAL_PROJECT", "CUSTOM"]),
    durationMinutes: z.coerce.number().int().min(5).max(600),
    priority: z.coerce.number().int().min(0).max(20),
    targetDays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "Pick at least one day"),
    schedulingMode: z.enum(["LOCKED", "FLEXIBLE"]),
    lockedStart: timeField,
    preferredStart: timeField,
    preferredEnd: timeField,
  })
  .refine((v) => v.schedulingMode !== "LOCKED" || v.lockedStart !== undefined, {
    message: "Pick a fixed time",
    path: ["lockedStart"],
  })
  .refine(
    (v) =>
      v.preferredStart === undefined ||
      v.preferredEnd === undefined ||
      hhmmToMinutes(v.preferredEnd) > hhmmToMinutes(v.preferredStart),
    { message: "Window end must be after start", path: ["preferredEnd"] }
  );

export interface HabitFormState {
  error?: string;
}

export async function addHabitAction(
  _prevState: HabitFormState,
  formData: FormData
): Promise<HabitFormState> {
  const userId = await requireUserId();

  const parsed = habitSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    durationMinutes: formData.get("durationMinutes"),
    priority: formData.get("priority"),
    targetDays: formData.getAll("targetDays"),
    schedulingMode: formData.get("schedulingMode"),
    lockedStart: formData.get("lockedStart") || undefined,
    preferredStart: formData.get("preferredStart") || undefined,
    preferredEnd: formData.get("preferredEnd") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const locked = parsed.data.schedulingMode === "LOCKED";

  await db.habit.create({
    data: {
      userId,
      name: parsed.data.name,
      category: parsed.data.category,
      durationMinutes: parsed.data.durationMinutes,
      priority: parsed.data.priority,
      targetDays: JSON.stringify(parsed.data.targetDays),
      locked,
      lockedStartMinute: locked ? hhmmToMinutes(parsed.data.lockedStart!) : null,
      preferredStartMinute:
        !locked && parsed.data.preferredStart ? hhmmToMinutes(parsed.data.preferredStart) : null,
      preferredEndMinute:
        !locked && parsed.data.preferredEnd ? hhmmToMinutes(parsed.data.preferredEnd) : null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteHabitAction(habitId: string): Promise<void> {
  const userId = await requireUserId();
  await db.habit.deleteMany({ where: { id: habitId, userId } });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
