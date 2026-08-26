"use client";

import { DashboardCards } from "@/components/dashboard-cards";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { loading, error, refresh } = useAppStore();

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Track spend, sales, and mileage against your Collectr portfolio value."
      />
      {error ? (
        <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void refresh()}
          >
            Try again
          </Button>
        </div>
      ) : null}
      <DashboardCards />
    </div>
  );
}
