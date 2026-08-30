import { toggleSlotSkipAction } from "@/lib/actions/slot-skip";
import { minutesToLabel } from "@/lib/time";
import type { TimetableSlot } from "@/generated/prisma/client";

export function SkippedSlots({
  slots,
  dateKey,
}: {
  slots: TimetableSlot[];
  dateKey: string;
}) {
  if (slots.length === 0) return null;

  return (
    <div className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium">Skipped today: </span>
      {slots.map((slot, i) => (
        <span key={slot.id}>
          {slot.subject} ({minutesToLabel(slot.startMinute)})
          <form action={toggleSlotSkipAction.bind(null, slot.id, dateKey)} className="ml-1 inline">
            <button type="submit" className="underline hover:text-foreground">
              restore
            </button>
          </form>
          {i < slots.length - 1 ? ", " : ""}
        </span>
      ))}
    </div>
  );
}
