import "server-only";
import { db } from "@/lib/db";
import type { Backup } from "./schema";

export async function buildBackup(userId: string): Promise<Backup> {
  const [user, commuteConfig, timetableSlots, subjects, studyPlanEntries, overrideDays, habits, tasks, goals] =
    await Promise.all([
      db.user.findUniqueOrThrow({ where: { id: userId } }),
      db.commuteConfig.findUnique({ where: { userId } }),
      db.timetableSlot.findMany({ where: { userId }, include: { skips: true } }),
      db.subject.findMany({ where: { userId } }),
      db.studyPlanEntry.findMany({ where: { userId }, include: { subject: true } }),
      db.studyPlanOverrideDay.findMany({
        where: { userId },
        include: { entries: { include: { subject: true } } },
      }),
      db.habit.findMany({ where: { userId }, include: { logs: true } }),
      db.task.findMany({ where: { userId } }),
      db.goal.findMany({ where: { userId }, include: { milestones: true } }),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    email: user.email,
    commuteConfig: commuteConfig
      ? {
          toCollegeMinutes: commuteConfig.toCollegeMinutes,
          fromCollegeMinutes: commuteConfig.fromCollegeMinutes,
          restBufferMinutes: commuteConfig.restBufferMinutes,
          wakeMinute: commuteConfig.wakeMinute,
          sleepMinute: commuteConfig.sleepMinute,
        }
      : null,
    timetableSlots: timetableSlots.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startMinute: s.startMinute,
      endMinute: s.endMinute,
      subject: s.subject,
      room: s.room,
      type: s.type,
      skips: s.skips.map((sk) => ({ date: sk.date, reason: sk.reason })),
    })),
    subjects: subjects.map((s) => ({ name: s.name, category: s.category })),
    studyPlanEntries: studyPlanEntries.map((e) => ({
      dayOfWeek: e.dayOfWeek,
      subjectName: e.subject.name,
      durationMinutes: e.durationMinutes,
      orderIndex: e.orderIndex,
    })),
    studyPlanOverrideDays: overrideDays.map((d) => ({
      date: d.date,
      entries: d.entries.map((e) => ({
        subjectName: e.subject.name,
        durationMinutes: e.durationMinutes,
        orderIndex: e.orderIndex,
      })),
    })),
    habits: habits.map((h) => ({
      name: h.name,
      category: h.category,
      targetDays: JSON.parse(h.targetDays),
      preferredStartMinute: h.preferredStartMinute,
      preferredEndMinute: h.preferredEndMinute,
      durationMinutes: h.durationMinutes,
      priority: h.priority,
      locked: h.locked,
      lockedStartMinute: h.lockedStartMinute,
      logs: h.logs.map((l) => ({ date: l.date, completed: l.completed })),
    })),
    tasks: tasks.map((t) => ({
      title: t.title,
      date: t.date,
      estimatedMinutes: t.estimatedMinutes,
      category: t.category,
      term: t.term,
      completed: t.completed,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      orderIndex: t.orderIndex,
    })),
    goals: goals.map((g) => ({
      title: g.title,
      description: g.description,
      targetDate: g.targetDate,
      milestones: g.milestones.map((m) => ({
        title: m.title,
        completed: m.completed,
        orderIndex: m.orderIndex,
      })),
    })),
  };
}
