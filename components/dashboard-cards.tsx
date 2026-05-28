"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { calculateMileageDeduction } from "@/lib/calculations";

export function DashboardCards() {
  const { summary, expenses, trips, settings, updateSettings } = useAppStore();

  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const recentTrips = [...trips]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-background p-4">
        <div className="space-y-2">
          <Label htmlFor="collectrValue">Collectr portfolio value</Label>
          <Input
            id="collectrValue"
            type="number"
            min="0"
            step="0.01"
            defaultValue={settings.collectrInventoryValue}
            onBlur={(event) => {
              const nextValue = Number(event.target.value);
              if (
                !Number.isNaN(nextValue) &&
                nextValue !== settings.collectrInventoryValue
              ) {
                void updateSettings({ collectrInventoryValue: nextValue });
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Copy your total collection value from the Collectr app and update it here.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Collectr Value"
          value={formatCurrency(summary.collectrInventoryValue)}
          hint="Manual value from Collectr"
        />
        <StatCard
          title="Total Spend"
          value={formatCurrency(summary.totalSpend)}
          hint="Stores, parking, tickets, supplies, etc."
        />
        <StatCard
          title="Mileage Deduction"
          value={formatCurrency(summary.mileageDeduction)}
        />
        <StatCard
          title="Net Position"
          value={formatCurrency(summary.netPosition)}
          hint="Collectr value minus spend and mileage"
          tone={summary.netPosition >= 0 ? "positive" : "negative"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Expenses</CardTitle>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses yet.</p>
            ) : (
              recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{expense.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(expense.amount)}</p>
                    <Badge variant="secondary" className="mt-1">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <Link
              href="/mileage"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTrips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips yet.</p>
            ) : (
              recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{trip.purpose}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(trip.date)} · {trip.miles} mi
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(calculateMileageDeduction(trip))}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
