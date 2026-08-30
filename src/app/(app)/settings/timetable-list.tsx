import { deleteTimetableSlotAction } from "@/lib/actions/timetable";
import { DAY_LABELS, minutesToLabel } from "@/lib/time";
import type { TimetableSlot } from "@/generated/prisma/client";
import { X } from "lucide-react";

export function TimetableList({ slots }: { slots: TimetableSlot[] }) {
  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No timetable slots yet. Add your first lecture above.
      </p>
    );
  }

  const byDay = new Map<number, TimetableSlot[]>();
  for (const slot of slots) {
    const list = byDay.get(slot.dayOfWeek) ?? [];
    list.push(slot);
    byDay.set(slot.dayOfWeek, list);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => a.startMinute - b.startMinute);
  }

  return (
    <div className="space-y-4">
      {DAY_LABELS.map((label, dayOfWeek) => {
        const daySlots = byDay.get(dayOfWeek);
        if (!daySlots) return null;
        return (
          <div key={dayOfWeek}>
            <h3 className="mb-2 text-sm font-semibold text-foreground">{label}</h3>
            <ul className="space-y-2">
              {daySlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {slot.subject}
                      {slot.room ? ` · ${slot.room}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {minutesToLabel(slot.startMinute)} – {minutesToLabel(slot.endMinute)} · {slot.type}
                    </p>
                  </div>
                  <form action={deleteTimetableSlotAction.bind(null, slot.id)}>
                    <button
                      type="submit"
                      aria-label={`Delete ${slot.subject}`}
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
