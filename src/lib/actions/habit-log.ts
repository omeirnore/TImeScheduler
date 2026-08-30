"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";

export async function toggleHabitLogAction(habitId: string, dateKey: string): Promise<void> {
  const userId = await requireUserId();

  const habit = await db.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) return;

  const existing = await db.habitLog.findUnique({
    where: { habitId_date: { habitId, date: dateKey } },
  });

  if (existing) {
    await db.habitLog.delete({ where: { id: existing.id } });
  } else {
    await db.habitLog.create({ data: { habitId, date: dateKey, completed: true } });
  }

  revalidatePath("/dashboard");
}
