import { deleteHabitAction } from "@/lib/actions/habits";
import { DAY_LABELS_SHORT, durationLabel, minutesToLabel } from "@/lib/time";
import { X } from "lucide-react";
import type { Habit } from "@/generated/prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  GYM: "Gym",
  READING: "Reading",
  MEALS: "Meals",
  PERSONAL_PROJECT: "Personal project",
  CUSTOM: "Custom",
};

const PRIORITY_LABELS: Record<number, string> = { 0: "High", 10: "Medium", 20: "Low" };

function scheduleSummary(habit: Habit): string {
  if (habit.locked && habit.lockedStartMinute != null) {
    return `Fixed at ${minutesToLabel(habit.lockedStartMinute)}`;
  }
  if (habit.preferredStartMinute != null && habit.preferredEndMinute != null) {
    return `${minutesToLabel(habit.preferredStartMinute)} – ${minutesToLabel(habit.preferredEndMinute)}`;
  }
  return "Anytime";
}

export function HabitsList({ habits }: { habits: Habit[] }) {
  if (habits.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No habits yet. Add gym, reading, meals, or projects above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {habits.map((habit) => {
        const days: number[] = JSON.parse(habit.targetDays);
        return (
          <li
            key={habit.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{habit.name}</p>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[habit.category]} · {durationLabel(habit.durationMinutes)} ·{" "}
                {PRIORITY_LABELS[habit.priority] ?? "Medium"} priority · {scheduleSummary(habit)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {days
                  .sort((a, b) => a - b)
                  .map((d) => DAY_LABELS_SHORT[d])
                  .join(", ")}
              </p>
            </div>
            <form action={deleteHabitAction.bind(null, habit.id)}>
              <button
                type="submit"
                aria-label={`Delete ${habit.name}`}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-danger"
              >
                <X size={16} />
              </button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}
