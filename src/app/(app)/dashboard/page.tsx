import { requireUserId } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getDayContext } from "@/lib/scheduling/day-context";
import { toDateKey, DAY_LABELS } from "@/lib/time";
import { DateNav } from "./date-nav";
import { Timeline } from "./timeline";
import { SkippedSlots } from "./skipped-slots";
import { AddTaskForm } from "./add-task-form";
import { TaskList } from "./task-list";

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
  const todayKey = toDateKey(new Date());
  const dateKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayKey;

  const [context, tasks] = await Promise.all([
    getDayContext(userId, dateKey),
    db.task.findMany({ where: { userId, date: dateKey }, orderBy: { createdAt: "asc" } }),
  ]);

  const skippedSlots = context.allSlots.filter((s) => context.skippedSlotIds.has(s.id));

  return (
    <div className="space-y-8 pb-10">
      <DateNav dateKey={dateKey} label={formatDateLabel(dateKey, context.dayOfWeek, todayKey)} />

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
        <Timeline blocks={context.result.blocks} dateKey={dateKey} />
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <AddTaskForm dateKey={dateKey} />
        <TaskList tasks={tasks} />
      </section>
    </div>
  );
}
