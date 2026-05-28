"use client";

import { useMemo } from "react";
import {
  filterTripsByMonth,
  filterTripsYearToDate,
  getCurrentMonthPeriod,
  getMileageMonthOptions,
  summarizeMileageTrips,
} from "@/lib/calculations";
import { StatCard } from "@/components/stat-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import type { MileageTrip } from "@/lib/types";

interface MileageSummaryProps {
  trips: MileageTrip[];
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}

export function MileageSummary({
  trips,
  selectedMonth,
  onMonthChange,
}: MileageSummaryProps) {
  const monthOptions = useMemo(() => getMileageMonthOptions(trips), [trips]);

  const { year, month } = useMemo(() => {
    const [yearValue, monthValue] = selectedMonth.split("-").map(Number);
    return { year: yearValue, month: monthValue };
  }, [selectedMonth]);

  const monthTrips = useMemo(
    () => filterTripsByMonth(trips, year, month),
    [trips, year, month],
  );
  const ytdTrips = useMemo(
    () => filterTripsYearToDate(trips, year, month),
    [trips, year, month],
  );

  const monthSummary = summarizeMileageTrips(monthTrips);
  const ytdSummary = summarizeMileageTrips(ytdTrips);

  const selectedLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label ??
    "Selected month";

  return (
    <div className="mb-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mileageMonth">Summary month</Label>
        <Select value={selectedMonth} onValueChange={(value) => value && onMonthChange(value)}>
          <SelectTrigger id="mileageMonth" className="w-full sm:max-w-xs">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{selectedLabel}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Miles This Month"
            value={`${monthSummary.miles.toFixed(1)} mi`}
            hint={`${monthSummary.tripCount} trip${monthSummary.tripCount === 1 ? "" : "s"}`}
          />
          <StatCard
            title="Deduction This Month"
            value={formatCurrency(monthSummary.deduction)}
          />
          <StatCard title="Trips This Month" value={String(monthSummary.tripCount)} />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Year to date ({year})
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Miles YTD"
            value={`${ytdSummary.miles.toFixed(1)} mi`}
            hint={`Through ${selectedLabel.split(" ")[0]}`}
          />
          <StatCard
            title="Deduction YTD"
            value={formatCurrency(ytdSummary.deduction)}
          />
          <StatCard title="Trips YTD" value={String(ytdSummary.tripCount)} />
        </div>
      </div>
    </div>
  );
}

export function useDefaultMileageMonth(): string {
  return getCurrentMonthPeriod().value;
}
