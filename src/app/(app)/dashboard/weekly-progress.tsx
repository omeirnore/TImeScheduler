export function WeeklyProgress({ completed, total }: { completed: number; total: number }) {
  if (total === 0) return null;

  const pct = Math.round((completed / total) * 100);

  return (
    <div className="card space-y-1 p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>This week: {completed} of {total} tasks done</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
