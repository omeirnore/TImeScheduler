"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTaskAction, type TaskFormState } from "@/lib/actions/tasks";

const initialState: TaskFormState = {};

const CATEGORY_LABELS: Record<string, string> = {
  COLLEGE: "College",
  SELF_STUDY: "Self-study",
  HEALTH: "Health",
  PERSONAL: "Personal",
  ADMIN: "Admin",
};

export function AddTaskForm({ dateKey }: { dateKey: string }) {
  const [state, formAction, pending] = useActionState(addTaskAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="date" value={dateKey} />
      <div className="flex gap-2">
        <input
          name="title"
          required
          maxLength={200}
          placeholder="Add a task…"
          className="field"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <select name="category" defaultValue="PERSONAL" className="field w-auto text-xs">
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select name="term" defaultValue="SHORT_TERM" className="field w-auto text-xs">
          <option value="SHORT_TERM">This week</option>
          <option value="LONG_TERM">This month/semester</option>
        </select>
        <input
          type="number"
          name="estimatedMinutes"
          min={1}
          max={1440}
          placeholder="mins (optional)"
          className="field w-32 text-xs"
        />
      </div>
      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
