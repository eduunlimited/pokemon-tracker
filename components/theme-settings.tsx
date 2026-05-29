"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[4.5rem] animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;

        return (
          <Button
            key={value}
            type="button"
            variant={active ? "default" : "outline"}
            className={cn("h-auto flex-col gap-1.5 py-4")}
            onClick={() => setTheme(value)}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        );
      })}
    </div>
  );
}
