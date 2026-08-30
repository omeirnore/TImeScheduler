import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateKey, shiftDateKey } from "@/lib/time";

export function WeekNav({ weekStartKey }: { weekStartKey: string }) {
  const weekEndKey = shiftDateKey(weekStartKey, 6);
  const prevWeek = shiftDateKey(weekStartKey, -7);
  const nextWeek = shiftDateKey(weekStartKey, 7);

  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={`/planner?week=${prevWeek}`}
        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
        aria-label="Previous week"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="text-center">
        <h1 className="text-lg font-semibold text-foreground">
          {formatDateKey(weekStartKey)} – {formatDateKey(weekEndKey)}
        </h1>
        <Link href="/planner" className="text-xs text-accent hover:underline">
          Jump to this week
        </Link>
      </div>
      <Link
        href={`/planner?week=${nextWeek}`}
        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
        aria-label="Next week"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
