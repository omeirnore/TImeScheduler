"use client";

import { useActionState, useRef, useEffect } from "react";
import { addMilestoneAction, type MilestoneFormState } from "@/lib/actions/goals";

const initialState: MilestoneFormState = {};

export function AddMilestoneForm({ goalId }: { goalId: string }) {
  const [state, formAction, pending] = useActionState(addMilestoneAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-2">
      <input type="hidden" name="goalId" value={goalId} />
      <input
        name="title"
        required
        maxLength={150}
        placeholder="Add a milestone…"
        className="field text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        Add
      </button>
      {state.error && (
        <p className="text-xs text-danger" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
