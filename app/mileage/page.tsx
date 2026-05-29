"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { LocationManager } from "@/components/location-manager";
import { MileageForm } from "@/components/mileage-form";
import { MileageList } from "@/components/mileage-list";
import {
  MileageSummary,
  useDefaultMileageMonth,
} from "@/components/mileage-summary";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterTripsByMonth } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";

export default function MileagePage() {
  const { trips, loading, error, addTrip, deleteTrip } = useAppStore();
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(useDefaultMileageMonth);

  const [year, month] = selectedMonth.split("-").map(Number);
  const filteredTrips = useMemo(
    () => filterTripsByMonth(trips, year, month),
    [trips, year, month],
  );

  if (loading) {
    return <LoadingState label="Loading mileage..." />;
  }

  return (
    <div>
      <PageHeader
        title="Mileage"
        description="Build routes from saved locations or enter miles manually."
        action={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button size="lg">
                  <Plus data-icon="inline-start" />
                  Log Trip
                </Button>
              }
            />
            <SheetContent className="overflow-y-auto sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Log mileage trip</SheetTitle>
              </SheetHeader>
              <div className="pb-6">
                <MileageForm
                  onSubmit={async (trip) => {
                    await addTrip(trip);
                    setOpen(false);
                  }}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {error ? (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      ) : null}

      <MileageSummary
        trips={trips}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <Tabs defaultValue="trips">
        <TabsList>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="trips" className="mt-4">
          <MileageList
            trips={filteredTrips}
            onDelete={(id) => {
              void deleteTrip(id);
            }}
            emptyTitle="No trips this month"
            emptyDescription="Log a trip or choose another month to view past mileage."
          />
        </TabsContent>
        <TabsContent value="locations" className="mt-4">
          <LocationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
