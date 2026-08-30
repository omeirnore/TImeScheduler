import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d + deltaDays);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function DateNav({ dateKey, label }: { dateKey: string; label: string }) {
  const prev = shiftDateKey(dateKey, -1);
  const next = shiftDateKey(dateKey, 1);

  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={`/dashboard?date=${prev}`}
        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
        aria-label="Previous day"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="text-center">
        <h1 className="text-lg font-semibold text-foreground">{label}</h1>
        <Link href="/dashboard" className="text-xs text-accent hover:underline">
          Jump to today
        </Link>
      </div>
      <Link
        href={`/dashboard?date=${next}`}
        className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </Link>
    </div>
  );
}
