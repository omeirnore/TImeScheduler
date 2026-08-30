import { toggleTaskCompletedAction, deleteTaskAction } from "@/lib/actions/tasks";
import { durationLabel } from "@/lib/time";
import { X, Check } from "lucide-react";
import type { Task } from "@/generated/prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  COLLEGE: "College",
  SELF_STUDY: "Self-study",
  HEALTH: "Health",
  PERSONAL: "Personal",
  ADMIN: "Admin",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No tasks for this day yet.
      </p>
    );
  }

  const completed = tasks.filter((t) => t.completed).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {completed} of {tasks.length} done
          </span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <form action={toggleTaskCompletedAction.bind(null, task.id)}>
              <button
                type="submit"
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  task.completed
                    ? "border-success bg-success text-white"
                    : "border-border hover:border-accent"
                }`}
              >
                {task.completed && <Check size={14} />}
              </button>
            </form>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate font-medium transition-colors ${
                  task.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[task.category]}
                {task.estimatedMinutes ? ` · ${durationLabel(task.estimatedMinutes)}` : ""}
                {task.term === "LONG_TERM" ? " · long-term" : ""}
              </p>
            </div>
            <form action={deleteTaskAction.bind(null, task.id)}>
              <button
                type="submit"
                aria-label={`Delete ${task.title}`}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-danger"
              >
                <X size={16} />
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
