"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import {
  getStoredThemePreference,
  setThemePreference,
  subscribeToThemePreference,
  type ThemePreference,
} from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Monitor }[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

function getServerSnapshot(): ThemePreference {
  return "system";
}

export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribeToThemePreference,
    getStoredThemePreference,
    getServerSnapshot
  );

  return (
    <div className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setThemePreference(opt.value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
