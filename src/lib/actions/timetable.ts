"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";
import { hhmmToMinutes } from "@/lib/time";

const slotSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    subject: z.string().trim().min(1, "Subject is required").max(100),
    room: z.string().trim().max(50).optional(),
    type: z.enum(["LECTURE", "LAB", "TUTORIAL", "OTHER"]),
  })
  .refine((v) => hhmmToMinutes(v.endTime) > hhmmToMinutes(v.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export interface TimetableFormState {
  error?: string;
}

export async function addTimetableSlotAction(
  _prevState: TimetableFormState,
  formData: FormData
): Promise<TimetableFormState> {
  const userId = await requireUserId();

  const parsed = slotSchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    subject: formData.get("subject"),
    room: formData.get("room") || undefined,
    type: formData.get("type"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.timetableSlot.create({
    data: {
      userId,
      dayOfWeek: parsed.data.dayOfWeek,
      startMinute: hhmmToMinutes(parsed.data.startTime),
      endMinute: hhmmToMinutes(parsed.data.endTime),
      subject: parsed.data.subject,
      room: parsed.data.room ?? null,
      type: parsed.data.type,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteTimetableSlotAction(slotId: string): Promise<void> {
  const userId = await requireUserId();
  await db.timetableSlot.deleteMany({ where: { id: slotId, userId } });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
