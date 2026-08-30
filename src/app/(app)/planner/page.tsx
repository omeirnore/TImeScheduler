import { requireUserId } from "@/lib/auth/require-user";
import { getWeeklyCategoryTotals } from "@/lib/scheduling/weekly-category-totals";
import { toDateKey, getWeekRange } from "@/lib/time";
import { WeekNav } from "./week-nav";
import { WeeklyChart } from "./weekly-chart";

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const userId = await requireUserId();
  const { week } = await searchParams;
  const todayKey = toDateKey(new Date());
  const anchor = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : todayKey;
  const { start: weekStartKey } = getWeekRange(anchor);

  const days = await getWeeklyCategoryTotals(userId, weekStartKey);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Weekly overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where your time actually goes, at a glance.
        </p>
      </div>

      <WeekNav weekStartKey={weekStartKey} />
      <WeeklyChart days={days} todayKey={todayKey} />
    </div>
  );
}
