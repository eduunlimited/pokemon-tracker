"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  Receipt,
  Settings,
} from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  Receipt,
  Car,
  Settings,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Business Tracker
            </p>
            <h1 className="text-lg font-semibold">{APP_NAME}</h1>
          </div>
        </div>
        <nav className="mx-auto hidden max-w-6xl gap-1 px-4 pb-3 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-8">{children}</main>
      <MobileNav pathname={pathname} />
    </div>
  );
}
