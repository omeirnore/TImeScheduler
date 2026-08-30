import { requireUserId } from "@/lib/auth/require-user";
import { getPeriodStats } from "@/lib/insights/period-stats";
import { toDateKey, getWeekRange, getMonthRange } from "@/lib/time";
import { PeriodToggle } from "./period-toggle";
import { StatCard } from "./stat-card";
import { TimeDistribution } from "./time-distribution";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const userId = await requireUserId();
  const { period } = await searchParams;
  const resolvedPeriod = period === "month" ? "month" : "week";
  const todayKey = toDateKey(new Date());

  const { start, dayCount } =
    resolvedPeriod === "month"
      ? getMonthRange(todayKey)
      : { ...getWeekRange(todayKey), dayCount: 7 };

  const stats = await getPeriodStats(userId, start, dayCount);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Insights</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How this {resolvedPeriod} actually went.
        </p>
      </div>

      <PeriodToggle period={resolvedPeriod} />

      <div className="flex flex-wrap gap-3">
        <StatCard label="Hours studied" value={`${stats.studyHours}h`} />
        <StatCard
          label="Habit hit-rate"
          value={stats.habitHitRatePct === null ? "—" : `${stats.habitHitRatePct}%`}
          hint={stats.habitHitRatePct === null ? "No habits scheduled yet" : undefined}
        />
        <StatCard
          label="Most productive day"
          value={stats.mostProductiveDay ? stats.mostProductiveDay.label : "—"}
          hint={
            stats.mostProductiveDay
              ? `${stats.mostProductiveDay.completedTasks} tasks completed`
              : "No completed tasks yet"
          }
        />
      </div>

      <TimeDistribution days={stats.days} />
    </div>
  );
}
