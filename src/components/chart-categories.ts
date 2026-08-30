import type { BlockType } from "@/lib/scheduling/types";

export interface ChartCategory {
  type: BlockType;
  label: string;
  colorVar: string;
}

// Fixed order — this exact sequence is what was validated for adjacent colorblind-safe
// separation (see the dataviz palette check run when this was built). Don't reorder.
export const CHART_CATEGORIES: ChartCategory[] = [
  { type: "COLLEGE", label: "College", colorVar: "var(--chart-college)" },
  { type: "HABIT", label: "Habits", colorVar: "var(--chart-habit)" },
  { type: "STUDY", label: "Study", colorVar: "var(--chart-study)" },
  { type: "REST", label: "Rest", colorVar: "var(--chart-rest)" },
  { type: "COMMUTE", label: "Commute", colorVar: "var(--chart-commute)" },
  { type: "FREE", label: "Free time", colorVar: "var(--chart-free)" },
];
