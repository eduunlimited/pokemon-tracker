"use client";

import { AppShell } from "@/components/app-shell";
import { AppStoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppStoreProvider>
      <AppShell>{children}</AppShell>
    </AppStoreProvider>
  );
}
