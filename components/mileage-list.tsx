"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { calculateMileageDeduction } from "@/lib/calculations";
import { formatCurrency, formatDate, formatMiles } from "@/lib/formatters";
import type { MileageTrip } from "@/lib/types";

interface MileageListProps {
  trips: MileageTrip[];
  onDelete: (id: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function MileageList({
  trips,
  onDelete,
  emptyTitle = "No trips yet",
  emptyDescription = "Log business mileage for card shows, pickups, and post office runs.",
}: MileageListProps) {
  if (trips.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const sorted = [...trips].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((trip) => (
        <div key={trip.id} className="glass-panel p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold">{trip.purpose}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(trip.date)} · {formatMiles(trip.miles)}
              </p>
              {trip.routeSummary ? (
                <p className="mt-1 text-sm text-muted-foreground">{trip.routeSummary}</p>
              ) : null}
              {trip.notes ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {trip.notes}
                </p>
              ) : null}
            </div>
            <div className="flex items-start gap-1">
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(calculateMileageDeduction(trip))}
                </p>
                <p className="text-xs text-muted-foreground">
                  @ {formatCurrency(trip.ratePerMile)}/mi
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(trip.id)}
                aria-label={`Delete trip ${trip.purpose}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
