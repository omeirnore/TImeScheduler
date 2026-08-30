import Link from "next/link";

export function PeriodToggle({ period }: { period: "week" | "month" }) {
  const base = "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";
  const active = "bg-accent text-accent-foreground";
  const inactive = "text-muted-foreground hover:bg-background hover:text-foreground";

  return (
    <div className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
      <Link href="/insights?period=week" className={`${base} ${period === "week" ? active : inactive}`}>
        This week
      </Link>
      <Link href="/insights?period=month" className={`${base} ${period === "month" ? active : inactive}`}>
        This month
      </Link>
    </div>
  );
}
