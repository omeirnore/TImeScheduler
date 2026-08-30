"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";

const subjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required").max(100),
  category: z.enum(["COLLEGE", "SELF_STUDY"]),
});

export interface SubjectFormState {
  error?: string;
}

export async function addSubjectAction(
  _prevState: SubjectFormState,
  formData: FormData
): Promise<SubjectFormState> {
  const userId = await requireUserId();

  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.subject.create({
    data: { userId, name: parsed.data.name, category: parsed.data.category },
  });

  revalidatePath("/settings");
  return {};
}

export async function deleteSubjectAction(subjectId: string): Promise<void> {
  const userId = await requireUserId();
  await db.subject.deleteMany({ where: { id: subjectId, userId } });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
