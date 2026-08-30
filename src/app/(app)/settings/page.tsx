import { requireUserId } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { CommuteForm } from "./commute-form";
import { AddSlotForm } from "./add-slot-form";
import { TimetableList } from "./timetable-list";
import { AddSubjectForm } from "./add-subject-form";
import { SubjectsList } from "./subjects-list";
import { AddStudyEntryForm } from "./add-study-entry-form";
import { StudyPlanList } from "./study-plan-list";
import { AddHabitForm } from "./add-habit-form";
import { HabitsList } from "./habits-list";

export default async function SettingsPage() {
  const userId = await requireUserId();

  const [commuteConfig, slots, subjects, studyEntries, habits] = await Promise.all([
    db.commuteConfig.upsert({
      where: { userId },
      update: {},
      create: { userId },
    }),
    db.timetableSlot.findMany({ where: { userId } }),
    db.subject.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    db.studyPlanEntry.findMany({ where: { userId }, include: { subject: true } }),
    db.habit.findMany({ where: { userId } }),
  ]);

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your timetable and commute preferences shape every day&apos;s schedule.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Commute &amp; recovery</h2>
          <p className="text-sm text-muted-foreground">
            These blocks are carved out of every college day automatically.
          </p>
        </div>
        <CommuteForm
          toCollegeMinutes={commuteConfig.toCollegeMinutes}
          fromCollegeMinutes={commuteConfig.fromCollegeMinutes}
          restBufferMinutes={commuteConfig.restBufferMinutes}
          wakeMinute={commuteConfig.wakeMinute}
          sleepMinute={commuteConfig.sleepMinute}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weekly timetable</h2>
          <p className="text-sm text-muted-foreground">
            Set your recurring college schedule once. You can skip a single class for a
            specific day from today&apos;s dashboard.
          </p>
        </div>
        <AddSlotForm />
        <TimetableList slots={slots} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Subjects</h2>
          <p className="text-sm text-muted-foreground">
            College-related revision and self-study topics you want to build a study plan
            from.
          </p>
        </div>
        <AddSubjectForm />
        <SubjectsList subjects={subjects} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weekly study plan</h2>
          <p className="text-sm text-muted-foreground">
            Set once per week; you can adjust a single day from the dashboard without
            changing the template.
          </p>
        </div>
        <AddStudyEntryForm subjects={subjects} />
        <StudyPlanList entries={studyEntries} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Habits</h2>
          <p className="text-sm text-muted-foreground">
            Gym, reading, meals, personal projects — anything recurring the scheduler
            should fit into your remaining time, by priority.
          </p>
        </div>
        <AddHabitForm />
        <HabitsList habits={habits} />
      </section>
    </div>
  );
}
