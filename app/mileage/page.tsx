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
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterTripsByMonth } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import type { MileageTrip } from "@/lib/types";

export default function MileagePage() {
  const { trips, loading, error, addTrip, updateTrip, deleteTrip } = useAppStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<MileageTrip | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(useDefaultMileageMonth);

  const [year, month] = selectedMonth.split("-").map(Number);
  const filteredTrips = useMemo(
    () => filterTripsByMonth(trips, year, month),
    [trips, year, month],
  );

  function openCreateTrip() {
    setEditingTrip(null);
    setSheetOpen(true);
  }

  function openEditTrip(trip: MileageTrip) {
    setEditingTrip(trip);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingTrip(null);
  }

  if (loading) {
    return <LoadingState label="Loading mileage..." />;
  }

  return (
    <div>
      <PageHeader
        title="Mileage"
        description="Build routes from saved locations or enter miles manually."
        action={
          <Button size="lg" onClick={openCreateTrip}>
            <Plus data-icon="inline-start" />
            Log Trip
          </Button>
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
            onEdit={openEditTrip}
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

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {editingTrip ? "Edit mileage trip" : "Log mileage trip"}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-6">
            <MileageForm
              key={editingTrip?.id ?? "new"}
              mode={editingTrip ? "edit" : "create"}
              initialValues={editingTrip ?? undefined}
              onSubmit={async (trip) => {
                if (editingTrip) {
                  await updateTrip(editingTrip.id, trip);
                } else {
                  await addTrip(trip);
                }
                closeSheet();
              }}
              onCancel={closeSheet}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
