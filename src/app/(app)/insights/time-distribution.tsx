import { CHART_CATEGORIES } from "@/components/chart-categories";
import { durationLabel } from "@/lib/time";
import type { DayCategoryTotals } from "@/lib/scheduling/weekly-category-totals";

export function TimeDistribution({ days }: { days: DayCategoryTotals[] }) {
  const totals = CHART_CATEGORIES.map((cat) => ({
    ...cat,
    minutes: days.reduce((sum, d) => sum + d.minutesByType[cat.type], 0),
  }));
  const grandTotal = totals.reduce((sum, t) => sum + t.minutes, 0);

  if (grandTotal === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Nothing scheduled in this period yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-foreground">Time distribution</h3>
      <div className="space-y-2.5">
        {totals
          .filter((t) => t.minutes > 0)
          .map((t) => {
            const pct = Math.round((t.minutes / grandTotal) * 100);
            return (
              <div key={t.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: t.colorVar }}
                    />
                    {t.label}
                  </span>
                  <span className="text-muted-foreground">
                    {durationLabel(t.minutes)} · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: t.colorVar }}
                  />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
