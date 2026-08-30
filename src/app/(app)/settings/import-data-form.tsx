"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { importDataAction, type ImportFormState } from "@/lib/actions/data-transfer";
import { AlertTriangle } from "lucide-react";

const initialState: ImportFormState = {};

export function ImportDataForm() {
  const [state, formAction, pending] = useActionState(importDataAction, initialState);
  const [confirmed, setConfirmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.success) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onReset={() => setConfirmed(false)}
      className="space-y-3"
    >
      <div className="flex gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>
          Importing a backup <strong>replaces all your current data</strong> — timetable,
          study plan, habits, tasks, and goals. This can&apos;t be undone.
        </p>
      </div>

      <input
        type="file"
        name="file"
        accept="application/json"
        required
        className="field text-sm"
      />

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        I understand this replaces all my current data
      </label>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state.success && <p className="text-sm text-success">Import complete.</p>}

      <button
        type="submit"
        disabled={!confirmed || pending}
        className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "Importing…" : "Import and replace data"}
      </button>
    </form>
  );
}
