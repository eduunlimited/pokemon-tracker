import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative";
  icon?: LucideIcon;
  accent?: "indigo" | "amber" | "emerald" | "rose";
}

const accentStyles = {
  indigo: "from-indigo-500/15 to-violet-500/5 text-indigo-600",
  amber: "from-amber-400/20 to-orange-400/5 text-amber-700",
  emerald: "from-emerald-500/15 to-teal-500/5 text-emerald-600",
  rose: "from-rose-500/15 to-pink-500/5 text-rose-600",
};

export function StatCard({
  title,
  value,
  hint,
  tone = "default",
  icon: Icon,
  accent = "indigo",
}: StatCardProps) {
  return (
    <div className="glass-panel relative overflow-hidden p-5">
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
          accent === "indigo" && "from-indigo-500 to-violet-500",
          accent === "amber" && "from-amber-400 to-orange-500",
          accent === "emerald" && "from-emerald-500 to-teal-500",
          accent === "rose" && "from-rose-500 to-pink-500",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "mt-2 text-3xl font-bold tracking-tight",
              tone === "positive" && "text-emerald-600",
              tone === "negative" && "text-rose-600",
            )}
          >
            {value}
          </p>
          {hint ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
              accentStyles[accent],
            )}
          >
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
