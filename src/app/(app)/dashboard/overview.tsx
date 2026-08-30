import { ProgressRing } from "@/components/progress-ring";
import { toggleHabitLogAction } from "@/lib/actions/habit-log";
import { minutesToLabel, durationLabel } from "@/lib/time";
import { Flame, Check } from "lucide-react";
import type { HabitTodayStatus } from "@/lib/habits/today-status";
import type { ScheduleBlock } from "@/lib/scheduling/types";

export function DashboardOverview({
  todayKey,
  dailyTasks,
  weeklyStudy,
  habitStatuses,
  upcoming,
}: {
  todayKey: string;
  dailyTasks: { completed: number; total: number };
  weeklyStudy: { plannedMinutes: number; elapsedMinutes: number };
  habitStatuses: HabitTodayStatus[];
  upcoming: ScheduleBlock[];
}) {
  const hasAnything =
    dailyTasks.total > 0 ||
    weeklyStudy.plannedMinutes > 0 ||
    habitStatuses.length > 0 ||
    upcoming.length > 0;

  if (!hasAnything) return null;

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">Am I on track?</h2>

      <div className="flex flex-wrap gap-6">
        {dailyTasks.total > 0 && (
          <ProgressRing
            pct={(dailyTasks.completed / dailyTasks.total) * 100}
            label="Today's tasks"
            sublabel={`${dailyTasks.completed} of ${dailyTasks.total}`}
            color="var(--success)"
          />
        )}
        {weeklyStudy.plannedMinutes > 0 && (
          <ProgressRing
            pct={(weeklyStudy.elapsedMinutes / weeklyStudy.plannedMinutes) * 100}
            label="Week's study plan"
            sublabel={`${durationLabel(weeklyStudy.elapsedMinutes)} of ${durationLabel(weeklyStudy.plannedMinutes)}`}
            color="var(--accent)"
          />
        )}
      </div>

      {habitStatuses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Today&apos;s habits</h3>
          <ul className="flex flex-wrap gap-2">
            {habitStatuses.map((h) => (
              <li key={h.habitId}>
                <form action={toggleHabitLogAction.bind(null, h.habitId, todayKey)}>
                  <button
                    type="submit"
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      h.loggedToday
                        ? "border-success bg-success text-white"
                        : "border-border text-foreground hover:border-accent"
                    }`}
                  >
                    {h.loggedToday ? <Check size={12} /> : null}
                    {h.name}
                    {h.streak > 0 && (
                      <span className="flex items-center gap-0.5 opacity-90">
                        <Flame size={12} />
                        {h.streak}
                      </span>
                    )}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">Coming up</h3>
          <ul className="space-y-1.5">
            {upcoming.map((block, i) => (
              <li
                key={`${block.type}-${block.startMinute}-${i}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground">{block.label}</span>
                <span className="text-xs text-muted-foreground">
                  {minutesToLabel(block.startMinute)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
