import type { BlockType } from "@/lib/scheduling/types";

// Matches the validated categorical chart palette in globals.css (see --chart-*),
// so a category reads the same color on the timeline as it does in the Planner/Insights charts.
export const BLOCK_STYLES: Record<BlockType, string> = {
  COLLEGE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
  COMMUTE: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  REST: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-900",
  STUDY: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  HABIT: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
  FREE: "border-dashed border-border text-muted-foreground",
};
