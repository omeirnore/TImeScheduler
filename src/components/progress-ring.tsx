export function ProgressRing({
  pct,
  label,
  sublabel,
  size = 84,
  strokeWidth = 8,
  color = "var(--accent)",
}: {
  pct: number;
  label: string;
  sublabel?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
          {Math.round(clamped)}%
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
