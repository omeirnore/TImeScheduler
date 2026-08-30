import { z } from "zod";

// Relations are referenced by human-readable keys (subject name, not DB id) so the
// export is portable and re-importable without needing to remap internal ids.
export const backupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  email: z.string(),
  commuteConfig: z
    .object({
      toCollegeMinutes: z.number().int(),
      fromCollegeMinutes: z.number().int(),
      restBufferMinutes: z.number().int(),
      wakeMinute: z.number().int(),
      sleepMinute: z.number().int(),
    })
    .nullable(),
  timetableSlots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startMinute: z.number().int(),
      endMinute: z.number().int(),
      subject: z.string(),
      room: z.string().nullable(),
      type: z.enum(["LECTURE", "LAB", "TUTORIAL", "OTHER"]),
      skips: z.array(z.object({ date: z.string(), reason: z.string().nullable() })),
    })
  ),
  subjects: z.array(
    z.object({
      name: z.string(),
      category: z.enum(["COLLEGE", "SELF_STUDY"]),
    })
  ),
  studyPlanEntries: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      subjectName: z.string(),
      durationMinutes: z.number().int(),
      orderIndex: z.number().int(),
    })
  ),
  studyPlanOverrideDays: z.array(
    z.object({
      date: z.string(),
      entries: z.array(
        z.object({
          subjectName: z.string(),
          durationMinutes: z.number().int(),
          orderIndex: z.number().int(),
        })
      ),
    })
  ),
  habits: z.array(
    z.object({
      name: z.string(),
      category: z.enum(["GYM", "READING", "MEALS", "PERSONAL_PROJECT", "CUSTOM"]),
      targetDays: z.array(z.number().int().min(0).max(6)),
      preferredStartMinute: z.number().int().nullable(),
      preferredEndMinute: z.number().int().nullable(),
      durationMinutes: z.number().int(),
      priority: z.number().int(),
      locked: z.boolean(),
      lockedStartMinute: z.number().int().nullable(),
      logs: z.array(z.object({ date: z.string(), completed: z.boolean() })),
    })
  ),
  tasks: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      estimatedMinutes: z.number().int().nullable(),
      category: z.enum(["COLLEGE", "SELF_STUDY", "HEALTH", "PERSONAL", "ADMIN"]),
      term: z.enum(["SHORT_TERM", "LONG_TERM"]),
      completed: z.boolean(),
      completedAt: z.string().nullable(),
      orderIndex: z.number().int(),
    })
  ),
  goals: z.array(
    z.object({
      title: z.string(),
      description: z.string().nullable(),
      targetDate: z.string().nullable(),
      milestones: z.array(
        z.object({
          title: z.string(),
          completed: z.boolean(),
          orderIndex: z.number().int(),
        })
      ),
    })
  ),
});

export type Backup = z.infer<typeof backupSchema>;
