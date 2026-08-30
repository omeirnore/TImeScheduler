"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { addHabitAction, type HabitFormState } from "@/lib/actions/habits";
import { DAY_LABELS_SHORT } from "@/lib/time";

const initialState: HabitFormState = {};

const CATEGORY_OPTIONS = [
  { value: "GYM", label: "Gym" },
  { value: "READING", label: "Reading" },
  { value: "MEALS", label: "Meals" },
  { value: "PERSONAL_PROJECT", label: "Personal project" },
  { value: "CUSTOM", label: "Custom" },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: "High" },
  { value: 10, label: "Medium" },
  { value: 20, label: "Low" },
];

export function AddHabitForm() {
  const [state, formAction, pending] = useActionState(addHabitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"LOCKED" | "FLEXIBLE">("FLEXIBLE");

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => setMode("FLEXIBLE")}
      className="card space-y-3 p-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="col-span-2 space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Name</span>
          <input name="name" required maxLength={100} className="field" placeholder="Gym" />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Category</span>
          <select name="category" className="field" defaultValue="CUSTOM">
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Priority</span>
          <select name="priority" className="field" defaultValue={10}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Duration (min)</span>
          <input
            type="number"
            name="durationMinutes"
            min={5}
            max={600}
            step={5}
            defaultValue={60}
            className="field"
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <span className="block text-sm font-medium text-foreground">Days</span>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS_SHORT.map((label, i) => (
            <label
              key={label}
              className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-accent-foreground"
            >
              <input type="checkbox" name="targetDays" value={i} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="schedulingMode"
              value="FLEXIBLE"
              checked={mode === "FLEXIBLE"}
              onChange={() => setMode("FLEXIBLE")}
            />
            Flexible window
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="schedulingMode"
              value="LOCKED"
              checked={mode === "LOCKED"}
              onChange={() => setMode("LOCKED")}
            />
            Lock to a fixed time
          </label>
        </div>

        {mode === "FLEXIBLE" ? (
          <div className="flex flex-wrap gap-3">
            <label className="space-y-1.5 text-sm">
              <span className="block text-xs text-muted-foreground">Preferred start (optional)</span>
              <input type="time" name="preferredStart" className="field" />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="block text-xs text-muted-foreground">Preferred end (optional)</span>
              <input type="time" name="preferredEnd" className="field" />
            </label>
          </div>
        ) : (
          <label className="block space-y-1.5 text-sm">
            <span className="block text-xs text-muted-foreground">Fixed start time</span>
            <input type="time" name="lockedStart" defaultValue="18:00" className="field w-auto" />
          </label>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add habit"}
      </button>
    </form>
  );
}
