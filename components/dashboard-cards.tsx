"use client";

import Link from "next/link";
import {
  ArrowRight,
  Car,
  Gem,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { CollectrValueEditor } from "@/components/collectr-value-editor";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-8">
      <section className="glass-panel relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400" />
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/5 text-indigo-600">
            <Gem className="size-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-base font-semibold">Collectr portfolio value</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy your total collection value from the Collectr app.
              </p>
            </div>
            <CollectrValueEditor
              value={settings.collectrInventoryValue}
              onSave={async (nextValue) => {
                await updateSettings({ collectrInventoryValue: nextValue });
              }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Collectr Value"
          value={formatCurrency(summary.collectrInventoryValue)}
          hint="Manual value from Collectr"
          icon={Gem}
          accent="indigo"
        />
        <StatCard
          title="Total Spend"
          value={formatCurrency(summary.totalSpend)}
          hint="Stores, parking, tickets, supplies"
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          title="Mileage Deduction"
          value={formatCurrency(summary.mileageDeduction)}
          icon={Car}
          accent="emerald"
        />
        <StatCard
          title="Net Position"
          value={formatCurrency(summary.netPosition)}
          hint="Collectr value minus spend and mileage"
          tone={summary.netPosition >= 0 ? "positive" : "negative"}
          icon={summary.netPosition >= 0 ? TrendingUp : TrendingDown}
          accent={summary.netPosition >= 0 ? "emerald" : "rose"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-indigo-600" />
              <h3 className="text-base font-semibold">Recent Expenses</h3>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentExpenses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No expenses yet.
              </p>
            ) : (
              recentExpenses.map((expense) => (
                <div key={expense.id} className="list-row">
                  <div>
                    <p className="font-semibold">{expense.vendor}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(expense.amount)}</p>
                    <Badge variant="secondary" className="mt-1.5">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="size-4 text-emerald-600" />
              <h3 className="text-base font-semibold">Recent Trips</h3>
            </div>
            <Link
              href="/mileage"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentTrips.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No trips yet.
              </p>
            ) : (
              recentTrips.map((trip) => (
                <div key={trip.id} className="list-row">
                  <div>
                    <p className="font-semibold">{trip.purpose}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(trip.date)} · {trip.miles} mi
                    </p>
                  </div>
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(calculateMileageDeduction(trip))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
