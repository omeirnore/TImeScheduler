"use client";

import { useActionState, useRef, useEffect } from "react";
import { addGoalAction, type GoalFormState } from "@/lib/actions/goals";

const initialState: GoalFormState = {};

export function AddGoalForm() {
  const [state, formAction, pending] = useActionState(addGoalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="card space-y-3 p-4"
    >
      <div className="flex flex-wrap gap-3">
        <label className="min-w-48 flex-1 space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Goal</span>
          <input
            name="title"
            required
            maxLength={150}
            className="field"
            placeholder="Get an A in Data Structures"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="block font-medium text-foreground">Target date (optional)</span>
          <input type="date" name="targetDate" className="field" />
        </label>
      </div>
      <label className="block space-y-1.5 text-sm">
        <span className="block font-medium text-foreground">Description (optional)</span>
        <input
          name="description"
          maxLength={500}
          className="field"
          placeholder="What does done look like?"
        />
      </label>
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
        {pending ? "Adding…" : "Add goal"}
      </button>
    </form>
  );
}
