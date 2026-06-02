"use client";

import { useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  filterTripsByYear,
  getCurrentYear,
  getMileageYearOptions,
  summarizeMileageTrips,
} from "@/lib/calculations";
import { downloadMileageReportPdf } from "@/lib/mileage-report-pdf";
import { formatCurrency } from "@/lib/formatters";
import type { MileageTrip } from "@/lib/types";

interface MileageYearReportProps {
  trips: MileageTrip[];
}

export function MileageYearReport({ trips }: MileageYearReportProps) {
  const yearOptions = useMemo(() => getMileageYearOptions(trips), [trips]);
  const [selectedYear, setSelectedYear] = useState(String(getCurrentYear()));
  const [generating, setGenerating] = useState(false);

  const year = Number(selectedYear);
  const yearTrips = useMemo(
    () => filterTripsByYear(trips, year),
    [trips, year],
  );
  const yearSummary = useMemo(
    () => summarizeMileageTrips(yearTrips),
    [yearTrips],
  );

  async function handleExport() {
    setGenerating(true);
    try {
      downloadMileageReportPdf({ trips: yearTrips, year });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="glass-panel space-y-4 p-5">
      <div>
        <h3 className="text-base font-semibold">Annual mileage report</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Export a PDF with every trip for a calendar year, including totals.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="reportYear">Report year</Label>
          <Select
            value={selectedYear}
            items={yearOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            onValueChange={(value) => value && setSelectedYear(value)}
          >
            <SelectTrigger id="reportYear" className="w-full sm:w-40">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          className="sm:mb-0.5"
          disabled={generating || yearTrips.length === 0}
          onClick={() => void handleExport()}
        >
          <FileDown data-icon="inline-start" />
          {generating ? "Generating..." : "Export PDF"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            Total miles ({year})
          </p>
          <p className="mt-1 text-lg font-semibold">
            {yearSummary.miles.toFixed(1)} mi
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-xs font-medium text-muted-foreground">
            Total deduction ({year})
          </p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrency(yearSummary.deduction)}
          </p>
        </div>
      </div>
    </div>
  );
}
