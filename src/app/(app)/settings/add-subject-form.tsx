"use client";

import { useActionState, useRef, useEffect } from "react";
import { addSubjectAction, type SubjectFormState } from "@/lib/actions/subjects";

const initialState: SubjectFormState = {};

export function AddSubjectForm() {
  const [state, formAction, pending] = useActionState(addSubjectAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="min-w-40 flex-1 space-y-1.5 text-sm">
        <span className="block font-medium text-foreground">Subject name</span>
        <input name="name" required maxLength={100} className="field" placeholder="Operating Systems" />
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="block font-medium text-foreground">Type</span>
        <select name="category" className="field w-auto" defaultValue="COLLEGE">
          <option value="COLLEGE">College</option>
          <option value="SELF_STUDY">Self-study</option>
        </select>
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
