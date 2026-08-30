import {
  deleteGoalAction,
  deleteMilestoneAction,
  toggleMilestoneAction,
} from "@/lib/actions/goals";
import { formatDateKey } from "@/lib/time";
import { AddMilestoneForm } from "./add-milestone-form";
import { Check, X } from "lucide-react";
import type { Goal, Milestone } from "@/generated/prisma/client";

type GoalWithMilestones = Goal & { milestones: Milestone[] };

export function GoalCard({ goal }: { goal: GoalWithMilestones }) {
  const total = goal.milestones.length;
  const completed = goal.milestones.filter((m) => m.completed).length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : null;

  return (
    <div className="card space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{goal.title}</h3>
          {goal.description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{goal.description}</p>
          )}
          {goal.targetDate && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Target: {formatDateKey(goal.targetDate)}
            </p>
          )}
        </div>
        <form action={deleteGoalAction.bind(null, goal.id)}>
          <button
            type="submit"
            aria-label={`Delete ${goal.title}`}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-danger"
          >
            <X size={16} />
          </button>
        </form>
      </div>

      {pct !== null ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {completed} of {total} milestones
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Add milestones to track progress.</p>
      )}

      {total > 0 && (
        <ul className="space-y-1.5">
          {goal.milestones.map((milestone) => (
            <li
              key={milestone.id}
              className={`flex items-center gap-2 text-sm transition-opacity ${
                milestone.completed ? "opacity-70" : ""
              }`}
            >
              <form action={toggleMilestoneAction.bind(null, milestone.id)}>
                <button
                  type="submit"
                  aria-label={milestone.completed ? "Mark incomplete" : "Mark complete"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors active:scale-90 ${
                    milestone.completed
                      ? "border-success bg-success text-white"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {milestone.completed && <Check size={12} className="animate-check-pop" />}
                </button>
              </form>
              <span
                className={`min-w-0 flex-1 truncate transition-colors ${
                  milestone.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {milestone.title}
              </span>
              <form action={deleteMilestoneAction.bind(null, milestone.id)}>
                <button
                  type="submit"
                  aria-label={`Delete ${milestone.title}`}
                  className="rounded p-1 text-muted-foreground hover:text-danger"
                >
                  <X size={13} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <AddMilestoneForm goalId={goal.id} />
    </div>
  );
}
