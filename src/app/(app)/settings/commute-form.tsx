"use client";

import { useActionState } from "react";
import { updateCommuteConfigAction, type CommuteFormState } from "@/lib/actions/commute";
import { minutesToHHMM } from "@/lib/time";

const initialState: CommuteFormState = {};

export function CommuteForm({
  toCollegeMinutes,
  fromCollegeMinutes,
  restBufferMinutes,
  wakeMinute,
  sleepMinute,
}: {
  toCollegeMinutes: number;
  fromCollegeMinutes: number;
  restBufferMinutes: number;
  wakeMinute: number;
  sleepMinute: number;
}) {
  const [state, formAction, pending] = useActionState(updateCommuteConfigAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Commute to college (min)">
          <input
            type="number"
            name="toCollegeMinutes"
            min={0}
            max={300}
            defaultValue={toCollegeMinutes}
            className="field"
          />
        </Field>
        <Field label="Commute home (min)">
          <input
            type="number"
            name="fromCollegeMinutes"
            min={0}
            max={300}
            defaultValue={fromCollegeMinutes}
            className="field"
          />
        </Field>
        <Field label="Rest buffer (min)">
          <input
            type="number"
            name="restBufferMinutes"
            min={0}
            max={300}
            defaultValue={restBufferMinutes}
            className="field"
          />
        </Field>
        <Field label="Wake time">
          <input
            type="time"
            name="wake"
            defaultValue={minutesToHHMM(wakeMinute)}
            className="field"
          />
        </Field>
        <Field label="Sleep time">
          <input
            type="time"
            name="sleep"
            defaultValue={minutesToHHMM(sleepMinute)}
            className="field"
          />
        </Field>
      </div>
      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state.success && !state.error && (
        <p className="text-sm text-success">Saved.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="block font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
