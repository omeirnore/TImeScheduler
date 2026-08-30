"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTimetableSlotAction, type TimetableFormState } from "@/lib/actions/timetable";
import { DAY_LABELS } from "@/lib/time";

const initialState: TimetableFormState = {};

export function AddSlotForm() {
  const [state, formAction, pending] = useActionState(addTimetableSlotAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Day</span>
          <select name="dayOfWeek" className="field" defaultValue={1}>
            {DAY_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Type</span>
          <select name="type" className="field" defaultValue="LECTURE">
            <option value="LECTURE">Lecture</option>
            <option value="LAB">Lab</option>
            <option value="TUTORIAL">Tutorial</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Subject</span>
          <input name="subject" required maxLength={100} className="field" placeholder="Data Structures" />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Start</span>
          <input type="time" name="startTime" required defaultValue="09:00" className="field" />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">End</span>
          <input type="time" name="endTime" required defaultValue="10:00" className="field" />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Room (optional)</span>
          <input name="room" maxLength={50} className="field" placeholder="LH-3" />
        </label>
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
        {pending ? "Adding…" : "Add slot"}
      </button>
    </form>
  );
}
