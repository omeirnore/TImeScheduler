"use client";

import { useRef, useState } from "react";
import { toggleTaskCompletedAction, deleteTaskAction, reorderTasksAction } from "@/lib/actions/tasks";
import { durationLabel } from "@/lib/time";
import { X, Check, GripVertical } from "lucide-react";
import type { Task } from "@/generated/prisma/client";

const CATEGORY_LABELS: Record<string, string> = {
  COLLEGE: "College",
  SELF_STUDY: "Self-study",
  HEALTH: "Health",
  PERSONAL: "Personal",
  ADMIN: "Admin",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const dragIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No tasks for this day yet.
      </p>
    );
  }

  const completed = tasks.filter((t) => t.completed).length;
  const pct = Math.round((completed / tasks.length) * 100);

  function handleDrop(targetIndex: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === targetIndex) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(targetIndex, 0, moved);
    void reorderTasksAction(reordered.map((t) => t.id));
  }

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
        {tasks.map((task, i) => (
          <li
            key={task.id}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragOverIndex !== i) setDragOverIndex(i);
            }}
            onDragLeave={() => setDragOverIndex((cur) => (cur === i ? null : cur))}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => {
              dragIndex.current = null;
              setDragOverIndex(null);
            }}
            className={`flex items-center gap-2 rounded-lg border bg-surface px-3 py-2.5 text-sm transition-opacity ${
              task.completed ? "opacity-70" : ""
            } ${dragOverIndex === i ? "border-accent" : "border-border"}`}
          >
            <span className="shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing">
              <GripVertical size={14} />
            </span>
            <form action={toggleTaskCompletedAction.bind(null, task.id)}>
              <button
                type="submit"
                aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors active:scale-90 ${
                  task.completed
                    ? "border-success bg-success text-white"
                    : "border-border hover:border-accent"
                }`}
              >
                {task.completed && <Check size={14} className="animate-check-pop" />}
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
