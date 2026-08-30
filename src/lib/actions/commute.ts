"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";
import { hhmmToMinutes } from "@/lib/time";

const schema = z.object({
  toCollegeMinutes: z.coerce.number().int().min(0).max(300),
  fromCollegeMinutes: z.coerce.number().int().min(0).max(300),
  restBufferMinutes: z.coerce.number().int().min(0).max(300),
  wake: z.string().regex(/^\d{2}:\d{2}$/),
  sleep: z.string().regex(/^\d{2}:\d{2}$/),
});

export interface CommuteFormState {
  error?: string;
  success?: boolean;
}

export async function updateCommuteConfigAction(
  _prevState: CommuteFormState,
  formData: FormData
): Promise<CommuteFormState> {
  const userId = await requireUserId();

  const parsed = schema.safeParse({
    toCollegeMinutes: formData.get("toCollegeMinutes"),
    fromCollegeMinutes: formData.get("fromCollegeMinutes"),
    restBufferMinutes: formData.get("restBufferMinutes"),
    wake: formData.get("wake"),
    sleep: formData.get("sleep"),
  });
  if (!parsed.success) {
    return { error: "Please check the values you entered." };
  }

  const wakeMinute = hhmmToMinutes(parsed.data.wake);
  const sleepMinute = hhmmToMinutes(parsed.data.sleep);
  if (sleepMinute <= wakeMinute) {
    return { error: "Sleep time must be after wake time." };
  }

  await db.commuteConfig.upsert({
    where: { userId },
    update: {
      toCollegeMinutes: parsed.data.toCollegeMinutes,
      fromCollegeMinutes: parsed.data.fromCollegeMinutes,
      restBufferMinutes: parsed.data.restBufferMinutes,
      wakeMinute,
      sleepMinute,
    },
    create: {
      userId,
      toCollegeMinutes: parsed.data.toCollegeMinutes,
      fromCollegeMinutes: parsed.data.fromCollegeMinutes,
      restBufferMinutes: parsed.data.restBufferMinutes,
      wakeMinute,
      sleepMinute,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
