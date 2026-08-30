import { deleteStudyPlanEntryAction } from "@/lib/actions/study-plan";
import { DAY_LABELS, durationLabel } from "@/lib/time";
import { X } from "lucide-react";
import type { StudyPlanEntry, Subject } from "@/generated/prisma/client";

type EntryWithSubject = StudyPlanEntry & { subject: Subject };

export function StudyPlanList({ entries }: { entries: EntryWithSubject[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No study plan entries yet. Add subjects to each day above.
      </p>
    );
  }

  const byDay = new Map<number, EntryWithSubject[]>();
  for (const entry of entries) {
    const list = byDay.get(entry.dayOfWeek) ?? [];
    list.push(entry);
    byDay.set(entry.dayOfWeek, list);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  return (
    <div className="space-y-4">
      {DAY_LABELS.map((label, dayOfWeek) => {
        const dayEntries = byDay.get(dayOfWeek);
        if (!dayEntries) return null;
        return (
          <div key={dayOfWeek}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{label}</h3>
            <ul className="space-y-2">
              {dayEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{entry.subject.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {durationLabel(entry.durationMinutes)} ·{" "}
                      {entry.subject.category === "COLLEGE" ? "College" : "Self-study"}
                    </p>
                  </div>
                  <form action={deleteStudyPlanEntryAction.bind(null, entry.id)}>
                    <button
                      type="submit"
                      aria-label={`Remove ${entry.subject.name} from ${label}`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-danger"
                    >
                      <X size={16} />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
