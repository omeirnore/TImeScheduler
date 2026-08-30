"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  addStudyOverrideEntryAction,
  type StudyOverrideFormState,
} from "@/lib/actions/study-plan";
import type { Subject } from "@/generated/prisma/client";

const initialState: StudyOverrideFormState = {};

export function AddOverrideEntryForm({
  dateKey,
  subjects,
}: {
  dateKey: string;
  subjects: Subject[];
}) {
  const [state, formAction, pending] = useActionState(addStudyOverrideEntryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  if (subjects.length === 0) return null;

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="date" value={dateKey} />
      <label className="min-w-32 flex-1 space-y-1 text-xs">
        <span className="block text-muted-foreground">Subject</span>
        <select name="subjectId" required className="field text-sm">
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs">
        <span className="block text-muted-foreground">Minutes</span>
        <input
          type="number"
          name="durationMinutes"
          min={5}
          max={480}
          step={5}
          defaultValue={60}
          className="field w-20 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Add
      </button>
      {state.error && (
        <p className="w-full text-xs text-danger" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
