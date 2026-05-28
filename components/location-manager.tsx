"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { findSegmentMiles } from "@/lib/mileage-routes";

export function LocationManager() {
  const {
    locations,
    locationSegments,
    addLocation,
    deleteLocation,
    upsertLocationSegment,
  } = useAppStore();

  const [newLocationName, setNewLocationName] = useState("");
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [segmentMiles, setSegmentMiles] = useState("");
  const [saving, setSaving] = useState(false);

  const home = locations.find((location) => location.isHome);

  const locationItems = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations],
  );

  const segmentRows = useMemo(() => {
    return locationSegments.map((segment) => {
      const from =
        locations.find((location) => location.id === segment.locationAId) ??
        locations.find((location) => location.id === segment.locationBId);
      const to =
        locations.find((location) => location.id === segment.locationBId) ??
        locations.find((location) => location.id === segment.locationAId);

      const fromName =
        locations.find((location) => location.id === segment.locationAId)?.name ??
        "?";
      const toName =
        locations.find((location) => location.id === segment.locationBId)?.name ??
        "?";

      return {
        ...segment,
        fromName,
        toName,
        from,
        to,
      };
    });
  }, [locationSegments, locations]);

  async function handleAddLocation() {
    if (!newLocationName.trim()) return;
    setSaving(true);
    try {
      await addLocation({
        name: newLocationName.trim(),
        isHome: false,
      });
      setNewLocationName("");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSegment() {
    if (!fromId || !toId || !segmentMiles || fromId === toId) return;
    setSaving(true);
    try {
      await upsertLocationSegment({
        fromLocationId: fromId,
        toLocationId: toId,
        miles: Number(segmentMiles),
      });
      setSegmentMiles("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saved locations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Store distances between places you visit often. Multi-stop trips add
            each leg in order (Home → Post Office → Card Show), not separate
            round trips from home.
          </p>

          <div className="space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{location.name}</span>
                  {location.isHome ? <Badge>Home</Badge> : null}
                </div>
                {!location.isHome ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => void deleteLocation(location.id)}
                    aria-label={`Delete ${location.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newLocationName}
              onChange={(event) => setNewLocationName(event.target.value)}
              placeholder="New location name"
            />
            <Button
              type="button"
              onClick={() => void handleAddLocation()}
              disabled={saving}
            >
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segment distances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select
                value={fromId}
                items={locationItems}
                onValueChange={(value) => value && setFromId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select
                value={toId}
                items={locationItems}
                onValueChange={(value) => value && setToId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="segmentMiles">Miles</Label>
              <Input
                id="segmentMiles"
                type="number"
                min="0"
                step="0.1"
                value={segmentMiles}
                onChange={(event) => setSegmentMiles(event.target.value)}
                placeholder="12.0"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                className="w-full"
                disabled={saving}
                onClick={() => void handleSaveSegment()}
              >
                Save segment
              </Button>
            </div>
          </div>

          {fromId && toId && fromId !== toId ? (
            <p className="text-xs text-muted-foreground">
              Current saved distance:{" "}
              {findSegmentMiles(fromId, toId, locationSegments) ?? "Not set"} mi
            </p>
          ) : null}

          <div className="space-y-2">
            {segmentRows.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span>
                  {segment.fromName} ↔ {segment.toName}
                </span>
                <span className="font-medium">{segment.miles.toFixed(1)} mi</span>
              </div>
            ))}
          </div>

          {home ? (
            <p className="text-xs text-muted-foreground">
              Tip: enter Home ↔ each location, plus location ↔ location pairs you
              drive between on the same outing.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
