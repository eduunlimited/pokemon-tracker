"use client";

import { DashboardCards } from "@/components/dashboard-cards";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { loading, error } = useAppStore();

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Track spend and mileage against your Collectr portfolio value."
      />
      {error ? (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      ) : null}
      <DashboardCards />
    </div>
  );
}
