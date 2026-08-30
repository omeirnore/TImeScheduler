import { requireUserId } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getDayContext } from "@/lib/scheduling/day-context";
import { getStudyPlanForDate } from "@/lib/scheduling/study-plan-for-date";
import { getWeeklyStudyProgress } from "@/lib/scheduling/weekly-study-progress";
import { getTodayHabitStatus, getLoggedHabitIds } from "@/lib/habits/today-status";
import { toDateKey, DAY_LABELS, getWeekRange } from "@/lib/time";
import { DateNav } from "./date-nav";
import { DashboardOverview } from "./overview";
import { Timeline } from "./timeline";
import { SkippedSlots } from "./skipped-slots";
import { StudyPlanCard } from "./study-plan-card";
import { AddTaskForm } from "./add-task-form";
import { TaskList } from "./task-list";
import { WeeklyProgress } from "./weekly-progress";

function formatDateLabel(dateKey: string, dayOfWeek: number, todayKey: string): string {
  const dayName = DAY_LABELS[dayOfWeek];
  const [, m, d] = dateKey.split("-").map(Number);
  const monthName = new Date(2000, m - 1, 1).toLocaleString("en-US", { month: "long" });
  const suffix = dateKey === todayKey ? " (Today)" : "";
  return `${dayName}, ${monthName} ${d}${suffix}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const userId = await requireUserId();
  const { date } = await searchParams;
  const now = new Date();
  const todayKey = toDateKey(now);
  const dateKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey;
  const nowMinute = now.getHours() * 60 + now.getMinutes();

  const weekRange = getWeekRange(dateKey);

  const [context, tasks, studyPlan, subjects, weekTasks, weeklyStudy, habitStatuses, todayTasks] =
    await Promise.all([
      getDayContext(userId, dateKey),
      db.task.findMany({ where: { userId, date: dateKey }, orderBy: { createdAt: "asc" } }),
      getStudyPlanForDate(userId, dateKey),
      db.subject.findMany({ where: { userId }, orderBy: { name: "asc" } }),
      db.task.findMany({
        where: { userId, date: { gte: weekRange.start, lte: weekRange.end } },
        select: { completed: true },
      }),
      getWeeklyStudyProgress(userId, todayKey, nowMinute),
      getTodayHabitStatus(userId, todayKey),
      dateKey === todayKey
        ? Promise.resolve(null)
        : db.task.findMany({ where: { userId, date: todayKey }, select: { completed: true } }),
    ]);

  const skippedSlots = context.allSlots.filter((s) => context.skippedSlotIds.has(s.id));
  const weekCompleted = weekTasks.filter((t) => t.completed).length;

  const dailyTaskSource = todayTasks ?? tasks;
  const dailyTasks = {
    completed: dailyTaskSource.filter((t) => t.completed).length,
    total: dailyTaskSource.length,
  };

  const habitBlockIds = context.result.blocks
    .filter((b) => b.type === "HABIT" && b.sourceId)
    .map((b) => b.sourceId as string);
  const loggedHabitIds = await getLoggedHabitIds(habitBlockIds, dateKey);

  const upcoming =
    dateKey === todayKey
      ? context.result.blocks
          .filter((b) => b.type !== "FREE" && b.startMinute > nowMinute)
          .sort((a, b) => a.startMinute - b.startMinute)
          .slice(0, 3)
      : [];

  return (
    <div className="space-y-8 pb-10">
      <DateNav dateKey={dateKey} label={formatDateLabel(dateKey, context.dayOfWeek, todayKey)} />

      <DashboardOverview
        todayKey={todayKey}
        dailyTasks={dailyTasks}
        weeklyStudy={weeklyStudy}
        habitStatuses={habitStatuses}
        upcoming={upcoming}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {context.result.isCollegeDay ? "Today's schedule" : "Off day"}
          </h2>
          {context.result.unscheduled.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {context.result.unscheduled.length} item(s) couldn&apos;t fit
            </span>
          )}
        </div>
        <SkippedSlots slots={skippedSlots} dateKey={dateKey} />
        <Timeline blocks={context.result.blocks} dateKey={dateKey} loggedHabitIds={loggedHabitIds} />
        {context.result.unscheduled.length > 0 && (
          <ul className="space-y-1 text-xs text-muted-foreground">
            {context.result.unscheduled.map((u) => (
              <li key={u.id}>
                {u.label}: {u.reason}
              </li>
            ))}
          </ul>
        )}
      </section>

      <StudyPlanCard dateKey={dateKey} studyPlan={studyPlan} subjects={subjects} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <WeeklyProgress completed={weekCompleted} total={weekTasks.length} />
        <AddTaskForm dateKey={dateKey} />
        <TaskList tasks={tasks} />
      </section>
    </div>
  );
}
