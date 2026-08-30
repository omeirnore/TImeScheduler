import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, CalendarRange, Target, BarChart3, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planner", label: "Planner", icon: CalendarRange },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
