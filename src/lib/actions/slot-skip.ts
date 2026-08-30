"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";

export async function toggleSlotSkipAction(slotId: string, dateKey: string): Promise<void> {
  const userId = await requireUserId();

  const slot = await db.timetableSlot.findFirst({ where: { id: slotId, userId } });
  if (!slot) return;

  const existing = await db.slotSkip.findUnique({
    where: { slotId_date: { slotId, date: dateKey } },
  });

  if (existing) {
    await db.slotSkip.delete({ where: { id: existing.id } });
  } else {
    await db.slotSkip.create({ data: { slotId, date: dateKey } });
  }

  revalidatePath("/dashboard");
}
