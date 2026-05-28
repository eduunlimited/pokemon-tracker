import { PageHeader } from "@/components/page-header";

export default function OfflinePage() {
  return (
    <div>
      <PageHeader
        title="You are offline"
        description="Reconnect to load your latest expenses, inventory, and mileage."
      />
    </div>
  );
}
