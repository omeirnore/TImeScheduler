"use client";

import { useActionState, useRef, useEffect } from "react";
import { addStudyPlanEntryAction, type StudyPlanFormState } from "@/lib/actions/study-plan";
import { DAY_LABELS } from "@/lib/time";
import type { Subject } from "@/generated/prisma/client";

const initialState: StudyPlanFormState = {};

export function AddStudyEntryForm({ subjects }: { subjects: Subject[] }) {
  const [state, formAction, pending] = useActionState(addStudyPlanEntryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  if (subjects.length === 0) return null;

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="space-y-1.5 text-sm">
        <span className="block font-medium text-foreground">Day</span>
        <select name="dayOfWeek" className="field w-auto" defaultValue={1}>
          {DAY_LABELS.map((label, i) => (
            <option key={label} value={i}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="min-w-40 flex-1 space-y-1.5 text-sm">
        <span className="block font-medium text-foreground">Subject</span>
        <select name="subjectId" required className="field">
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="block font-medium text-foreground">Minutes</span>
        <input
          type="number"
          name="durationMinutes"
          min={5}
          max={480}
          step={5}
          defaultValue={60}
          className="field w-24"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Add
      </button>
      {state.error && (
        <p className="w-full text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
