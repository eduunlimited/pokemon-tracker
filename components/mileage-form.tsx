"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RouteMileageForm } from "@/components/route-mileage-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import { formatCurrency, toInputDate } from "@/lib/formatters";
import { calculateMileageDeduction } from "@/lib/calculations";
import { DEFAULT_TRIP_PURPOSE } from "@/lib/constants";
import type { MileageTrip, NewMileageTrip } from "@/lib/types";

interface MileageFormProps {
  onSubmit: (trip: NewMileageTrip) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<MileageTrip>;
  mode?: "create" | "edit";
}

function ManualMileageForm({
  onSubmit,
  onCancel,
  initialValues,
  mode = "create",
}: MileageFormProps) {
  const { settings } = useAppStore();
  const [purpose, setPurpose] = useState(
    initialValues?.purpose ?? DEFAULT_TRIP_PURPOSE,
  );
  const [miles, setMiles] = useState(
    initialValues?.miles !== undefined ? String(initialValues.miles) : "",
  );
  const [date, setDate] = useState(initialValues?.date ?? toInputDate());
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPurpose(initialValues?.purpose ?? DEFAULT_TRIP_PURPOSE);
    setMiles(
      initialValues?.miles !== undefined ? String(initialValues.miles) : "",
    );
    setDate(initialValues?.date ?? toInputDate());
    setNotes(initialValues?.notes ?? "");
  }, [initialValues]);

  const previewDeduction =
    miles && !Number.isNaN(Number(miles))
      ? calculateMileageDeduction({
          id: "preview",
          purpose,
          miles: Number(miles),
          ratePerMile: initialValues?.ratePerMile ?? settings.mileageRate,
          date,
          mode: "manual",
        })
      : 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!purpose.trim() || !miles) return;

    setSubmitting(true);
    try {
      await onSubmit({
        purpose: purpose.trim(),
        miles: Number(miles),
        date,
        notes: notes.trim() || undefined,
        mode: "manual",
      });

      if (mode === "create") {
        setPurpose(DEFAULT_TRIP_PURPOSE);
        setMiles("");
        setDate(toInputDate());
        setNotes("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="purpose">Trip purpose</Label>
          <Input
            id="purpose"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder={DEFAULT_TRIP_PURPOSE}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="miles">Miles driven</Label>
          <Input
            id="miles"
            type="number"
            min="0"
            step="0.1"
            value={miles}
            onChange={(event) => setMiles(event.target.value)}
            placeholder="86"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tripDate">Date</Label>
          <Input
            id="tripDate"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/40 p-4 text-sm">
        <p className="text-muted-foreground">Estimated deduction</p>
        <p className="text-lg font-semibold">{formatCurrency(previewDeduction)}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tripNotes">Notes</Label>
        <Textarea
          id="tripNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Round trip, tolls, etc."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Trip"
              : "Save Trip"}
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

export function MileageForm({
  onSubmit,
  onCancel,
  initialValues,
  mode = "create",
}: MileageFormProps) {
  const defaultTab = initialValues?.mode === "manual" ? "manual" : "route";

  return (
    <Tabs defaultValue={defaultTab} key={initialValues?.id ?? "new"}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="route">From locations</TabsTrigger>
        <TabsTrigger value="manual">Manual miles</TabsTrigger>
      </TabsList>
      <TabsContent value="route" className="mt-4">
        <RouteMileageForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialValues={initialValues}
          mode={mode}
        />
      </TabsContent>
      <TabsContent value="manual" className="mt-4">
        <ManualMileageForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          initialValues={initialValues}
          mode={mode}
        />
      </TabsContent>
    </Tabs>
  );
}
