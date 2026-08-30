import {
  deleteStudyOverrideEntryAction,
  resetStudyOverrideAction,
  startCustomizingStudyPlanAction,
} from "@/lib/actions/study-plan";
import { durationLabel } from "@/lib/time";
import { AddOverrideEntryForm } from "./add-override-entry-form";
import { X } from "lucide-react";
import type { StudyPlanForDate } from "@/lib/scheduling/study-plan-for-date";
import type { Subject } from "@/generated/prisma/client";

export function StudyPlanCard({
  dateKey,
  studyPlan,
  subjects,
}: {
  dateKey: string;
  studyPlan: StudyPlanForDate;
  subjects: Subject[];
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Study plan</h3>
        {studyPlan.isOverride ? (
          <form action={resetStudyOverrideAction.bind(null, dateKey)}>
            <button type="submit" className="text-xs text-accent hover:underline">
              Reset to weekly template
            </button>
          </form>
        ) : (
          <form action={startCustomizingStudyPlanAction.bind(null, dateKey)}>
            <button type="submit" className="text-xs text-accent hover:underline">
              Customize this day
            </button>
          </form>
        )}
      </div>

      {studyPlan.entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nothing planned for this day.</p>
      ) : (
        <ul className="space-y-1.5">
          {studyPlan.entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-md bg-background px-2.5 py-1.5 text-sm"
            >
              <span className="text-foreground">{entry.subjectName}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {durationLabel(entry.durationMinutes)}
                {studyPlan.isOverride && (
                  <form action={deleteStudyOverrideEntryAction.bind(null, entry.id)}>
                    <button
                      type="submit"
                      aria-label={`Remove ${entry.subjectName}`}
                      className="rounded p-0.5 hover:text-danger"
                    >
                      <X size={14} />
                    </button>
                  </form>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {studyPlan.isOverride && <AddOverrideEntryForm dateKey={dateKey} subjects={subjects} />}
    </div>
  );
}
