import { toggleSlotSkipAction } from "@/lib/actions/slot-skip";
import { minutesToLabel, durationLabel } from "@/lib/time";
import { BLOCK_STYLES } from "@/components/schedule-block-style";
import type { ScheduleBlock } from "@/lib/scheduling/types";

export function Timeline({
  blocks,
  dateKey,
}: {
  blocks: ScheduleBlock[];
  dateKey: string;
}) {
  if (blocks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nothing scheduled for this day yet.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {blocks.map((block, i) => (
        <li
          key={`${block.type}-${block.startMinute}-${i}`}
          className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm ${BLOCK_STYLES[block.type]}`}
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{block.label}</p>
            <p className="text-xs opacity-80">
              {minutesToLabel(block.startMinute)} – {minutesToLabel(block.endMinute)} ·{" "}
              {durationLabel(block.endMinute - block.startMinute)}
            </p>
          </div>
          {block.type === "COLLEGE" && block.sourceId && (
            <form action={toggleSlotSkipAction.bind(null, block.sourceId, dateKey)}>
              <button
                type="submit"
                className="shrink-0 rounded-md border border-current/30 px-2 py-1 text-xs font-medium opacity-80 hover:opacity-100"
              >
                Skip
              </button>
            </form>
          )}
        </li>
      ))}
    </ol>
  );
}
