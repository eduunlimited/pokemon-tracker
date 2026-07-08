"use client";

import { useMemo, useState } from "react";
import { ArrowDown, Plus, RotateCcw, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatCurrency, toInputDate } from "@/lib/formatters";
import { calculateMileageDeduction } from "@/lib/calculations";
import { calculateRoute } from "@/lib/mileage-routes";
import { DEFAULT_TRIP_PURPOSE } from "@/lib/constants";
import type { Location, NewMileageTrip } from "@/lib/types";

interface RouteMileageFormProps {
  onSubmit: (trip: NewMileageTrip) => void | Promise<void>;
  onCancel?: () => void;
}

function getStopNumbers(locationId: string, stopIds: string[]): number[] {
  return stopIds
    .map((id, index) => (id === locationId ? index + 1 : null))
    .filter((value): value is number => value !== null);
}

export function RouteMileageForm({ onSubmit, onCancel }: RouteMileageFormProps) {
  const {
    settings,
    locations,
    locationSegments,
    addLocation,
    upsertLocationSegment,
  } = useAppStore();

  const [purpose, setPurpose] = useState(DEFAULT_TRIP_PURPOSE);
  const [date, setDate] = useState(toInputDate());
  const [notes, setNotes] = useState("");
  const [stopIds, setStopIds] = useState<string[]>([]);
  const [submitting, setSaving] = useState(false);
  const [missingMiles, setMissingMiles] = useState<Record<string, string>>({});
  const [newLocationOpen, setNewLocationOpen] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationMiles, setNewLocationMiles] = useState("");
  const [newLocationError, setNewLocationError] = useState<string | null>(null);
  const [savingNewLocation, setSavingNewLocation] = useState(false);

  const previousStop = useMemo(() => {
    const previousId = stopIds[stopIds.length - 1];
    if (!previousId) return null;
    return locations.find((location) => location.id === previousId) ?? null;
  }, [stopIds, locations]);

  const calculation = useMemo(() => {
    if (stopIds.length < 2) {
      return null;
    }
    return calculateRoute(stopIds, locations, locationSegments);
  }, [stopIds, locations, locationSegments]);

  const previewDeduction =
    calculation?.totalMiles != null
      ? calculateMileageDeduction({
          id: "preview",
          purpose,
          miles: calculation.totalMiles,
          ratePerMile: settings.mileageRate,
          date,
          mode: "route",
        })
      : 0;

  function toggleStop(locationId: string) {
    setStopIds((current) => {
      if (current.length > 0 && current[current.length - 1] === locationId) {
        return current.slice(0, -1);
      }
      return [...current, locationId];
    });
  }

  function undoLastStop() {
    setStopIds((current) => current.slice(0, -1));
  }

  function clearRoute() {
    setStopIds([]);
    setMissingMiles({});
  }

  function removeStopAt(index: number) {
    setStopIds((current) => current.filter((_, idx) => idx !== index));
  }

  async function saveMissingSegments() {
    if (!calculation) return;

    for (const leg of calculation.missingLegs) {
      const key = `${leg.fromId}:${leg.toId}`;
      const miles = Number(missingMiles[key]);
      if (!miles || Number.isNaN(miles)) {
        throw new Error(`Enter miles for ${leg.fromName} → ${leg.toName}`);
      }
      await upsertLocationSegment({
        fromLocationId: leg.fromId,
        toLocationId: leg.toId,
        miles,
      });
    }
  }

  function openNewLocationDialog() {
    setNewLocationName("");
    setNewLocationMiles("");
    setNewLocationError(null);
    setNewLocationOpen(true);
  }

  async function handleAddNewLocation(event: React.FormEvent) {
    event.preventDefault();

    const name = newLocationName.trim();
    if (!name) {
      setNewLocationError("Enter a location name.");
      return;
    }

    const previousId = stopIds[stopIds.length - 1];
    const miles =
      previousId && newLocationMiles.trim()
        ? Number(newLocationMiles)
        : previousId
          ? NaN
          : null;

    if (previousId && (Number.isNaN(miles) || miles === null || miles < 0)) {
      setNewLocationError("Enter the miles from your previous stop.");
      return;
    }

    setSavingNewLocation(true);
    setNewLocationError(null);

    try {
      const created = await addLocation({ name, isHome: false });

      if (previousId && miles != null) {
        await upsertLocationSegment({
          fromLocationId: previousId,
          toLocationId: created.id,
          miles,
        });
      }

      setStopIds((current) => [...current, created.id]);
      setNewLocationOpen(false);
      setNewLocationName("");
      setNewLocationMiles("");
    } catch (err) {
      setNewLocationError(
        err instanceof Error ? err.message : "Could not add location.",
      );
    } finally {
      setSavingNewLocation(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!purpose.trim() || stopIds.length < 2) return;

    setSaving(true);
    try {
      if (calculation?.missingLegs.length) {
        await saveMissingSegments();
      }

      const refreshed = await api.calculateRoute(stopIds);
      if (refreshed.totalMiles == null) {
        throw new Error("Route is still missing segment distances");
      }

      await onSubmit({
        purpose: purpose.trim(),
        date,
        notes: notes.trim() || undefined,
        mode: "route",
        locationPath: stopIds,
        routeSummary: refreshed.routeSummary,
        miles: refreshed.totalMiles,
      });

      setPurpose(DEFAULT_TRIP_PURPOSE);
      setDate(toInputDate());
      setNotes("");
      setMissingMiles({});
      setStopIds([]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="routePurpose">Trip purpose</Label>
        <Input
          id="routePurpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          placeholder={DEFAULT_TRIP_PURPOSE}
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label>Tap locations in trip order</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={stopIds.length === 0}
              onClick={undoLastStop}
            >
              <Undo2 data-icon="inline-start" />
              Undo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={stopIds.length === 0}
              onClick={clearRoute}
            >
              <RotateCcw data-icon="inline-start" />
              Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {locations.map((location) => (
            <LocationStopButton
              key={location.id}
              location={location}
              stopNumbers={getStopNumbers(location.id, stopIds)}
              onSelect={() => toggleStop(location.id)}
            />
          ))}
          <button
            type="button"
            onClick={openNewLocationDialog}
            className="relative flex min-h-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-4 text-center transition-all hover:border-primary hover:bg-primary/10"
          >
            <Plus className="mb-2 size-5 text-primary" />
            <span className="font-medium leading-tight text-primary">New Location</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Tap each stop in order — tap again to remove the last stop. Use New
          Location to add a stop and save its distance for future trips.
        </p>
      </div>

      <Dialog open={newLocationOpen} onOpenChange={setNewLocationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new location</DialogTitle>
            <DialogDescription>
              {previousStop
                ? `Save "${previousStop.name}" to your new stop so you can tap it next time.`
                : "Add the first stop on this route. You can save distances on the next stop."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => void handleAddNewLocation(event)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newLocationName">Location name</Label>
              <Input
                id="newLocationName"
                value={newLocationName}
                onChange={(event) => setNewLocationName(event.target.value)}
                placeholder="Card shop, post office, etc."
                autoFocus
                required
              />
            </div>
            {previousStop ? (
              <div className="space-y-2">
                <Label htmlFor="newLocationMiles">
                  Miles from {previousStop.name}
                </Label>
                <Input
                  id="newLocationMiles"
                  type="number"
                  min="0"
                  step="0.1"
                  value={newLocationMiles}
                  onChange={(event) => setNewLocationMiles(event.target.value)}
                  placeholder="12.5"
                  required
                />
              </div>
            ) : null}
            {newLocationError ? (
              <p className="text-sm text-destructive">{newLocationError}</p>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={savingNewLocation}>
                {savingNewLocation ? "Saving..." : "Add to route"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={savingNewLocation}
                onClick={() => setNewLocationOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {stopIds.length > 0 ? (
        <div className="rounded-lg border bg-background p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">
              Your route ({stopIds.length} stop{stopIds.length === 1 ? "" : "s"})
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stopIds.map((stopId, index) => {
              const location = locations.find((item) => item.id === stopId);
              return (
                <button
                  key={`${index}-${stopId}`}
                  type="button"
                  onClick={() => removeStopAt(index)}
                  className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-1 text-xs transition-colors hover:bg-muted"
                  title="Tap to remove this stop"
                >
                  <span className="font-semibold text-primary">{index + 1}</span>
                  <span>{location?.name ?? "Unknown"}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {calculation ? (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <p className="font-medium">{calculation.routeSummary}</p>
          <div className="mt-3 space-y-2">
            {calculation.legs.map((leg) => (
              <div
                key={`${leg.fromId}-${leg.toId}`}
                className="flex items-center justify-between text-muted-foreground"
              >
                <span className="inline-flex items-center gap-1">
                  {leg.fromName}
                  <ArrowDown className="size-3 rotate-[-90deg]" />
                  {leg.toName}
                </span>
                <span>{leg.miles != null ? `${leg.miles.toFixed(1)} mi` : "Missing"}</span>
              </div>
            ))}
          </div>

          {calculation.missingLegs.length > 0 ? (
            <div className="mt-4 space-y-3 border-t pt-4">
              <p className="text-xs text-destructive">
                Add missing segment distances to calculate this route:
              </p>
              {calculation.missingLegs.map((leg) => {
                const key = `${leg.fromId}:${leg.toId}`;
                return (
                  <div key={key} className="grid gap-2 sm:grid-cols-[1fr_120px]">
                    <Label>
                      {leg.fromName} → {leg.toName}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={missingMiles[key] ?? ""}
                      onChange={(event) =>
                        setMissingMiles((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      placeholder="Miles"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-lg font-semibold">
              Total: {calculation.totalMiles?.toFixed(1)} mi
            </p>
          )}
        </div>
      ) : stopIds.length === 1 ? (
        <p className="text-sm text-muted-foreground">
          Select at least one more stop to calculate mileage.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="routeDate">Date</Label>
        <Input
          id="routeDate"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="text-muted-foreground">Estimated deduction</p>
        <p className="text-lg font-semibold">{formatCurrency(previewDeduction)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="routeNotes">Notes</Label>
        <Textarea
          id="routeNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting || stopIds.length < 2}>
          {submitting ? "Saving..." : "Save Route Trip"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function LocationStopButton({
  location,
  stopNumbers,
  onSelect,
}: {
  location: Location;
  stopNumbers: number[];
  onSelect: () => void;
}) {
  const isSelected = stopNumbers.length > 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex min-h-20 flex-col items-center justify-center rounded-xl border-2 px-3 py-4 text-center transition-all",
        isSelected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      <span className="font-medium leading-tight">{location.name}</span>
      {location.isHome ? (
        <Badge variant="secondary" className="mt-2">
          Home
        </Badge>
      ) : null}
      {isSelected ? (
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {stopNumbers.map((stopNumber) => (
            <span
              key={stopNumber}
              className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            >
              {stopNumber}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
