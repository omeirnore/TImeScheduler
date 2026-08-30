import { CHART_CATEGORIES } from "@/components/chart-categories";
import { DAY_LABELS_SHORT, durationLabel, dateKeyToDayOfWeek } from "@/lib/time";
import type { DayCategoryTotals } from "@/lib/scheduling/weekly-category-totals";

const CHART_HEIGHT = 260; // px, representing a full 24h day
const MINUTES_PER_DAY = 1440;
const HOUR_MARKS = [0, 6, 12, 18, 24];

export function WeeklyChart({
  days,
  todayKey,
}: {
  days: DayCategoryTotals[];
  todayKey: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex gap-3">
        {/* Y-axis hour gridlines */}
        <div className="relative shrink-0 text-xs text-muted-foreground" style={{ height: CHART_HEIGHT, width: 28 }}>
          {HOUR_MARKS.map((h) => (
            <span
              key={h}
              className="absolute right-0 -translate-y-1/2"
              style={{ top: CHART_HEIGHT - (h / 24) * CHART_HEIGHT }}
            >
              {h}h
            </span>
          ))}
        </div>

        <div className="relative flex flex-1 items-end justify-between gap-2 border-l border-border pl-3" style={{ height: CHART_HEIGHT }}>
          {/* recessive gridlines */}
          {HOUR_MARKS.map((h) => (
            <div
              key={h}
              className="pointer-events-none absolute left-0 right-0 border-t border-border/60"
              style={{ top: CHART_HEIGHT - (h / 24) * CHART_HEIGHT }}
            />
          ))}

          {days.map((day) => {
            const isToday = day.dateKey === todayKey;
            const dayOfWeek = dateKeyToDayOfWeek(day.dateKey);
            return (
              <div key={day.dateKey} className="relative z-10 flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="flex w-full max-w-10 flex-col-reverse overflow-hidden rounded-sm"
                  style={{ height: CHART_HEIGHT }}
                >
                  {CHART_CATEGORIES.map((cat) => {
                    const minutes = day.minutesByType[cat.type];
                    if (minutes === 0) return null;
                    const height = (minutes / MINUTES_PER_DAY) * CHART_HEIGHT;
                    return (
                      <div
                        key={cat.type}
                        title={`${cat.label}: ${durationLabel(minutes)}`}
                        style={{ height, backgroundColor: cat.colorVar }}
                        className="w-full border-b-2 border-surface last:border-b-0"
                      />
                    );
                  })}
                </div>
                <span className={`text-xs ${isToday ? "font-semibold text-accent" : "text-muted-foreground"}`}>
                  {DAY_LABELS_SHORT[dayOfWeek]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
        {CHART_CATEGORIES.map((cat) => (
          <div key={cat.type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: cat.colorVar }}
            />
            {cat.label}
          </div>
        ))}
      </div>
    </div>
  );
}
