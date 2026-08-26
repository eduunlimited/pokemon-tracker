"use client";

import Link from "next/link";
import {
  ArrowRight,
  Car,
  DollarSign,
  Gem,
  Navigation,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { CollectrValueEditor } from "@/components/collectr-value-editor";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatCurrency, formatDate, formatMiles } from "@/lib/formatters";
import { calculateMileageDeduction } from "@/lib/calculations";

export function DashboardCards() {
  const { summary, expenses, sales, trips, settings, updateSettings } = useAppStore();

  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const recentSales = [...sales]
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
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/5 text-indigo-600 dark:text-indigo-400">
            <Gem className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">Collectr portfolio value</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Copy your total collection value from the Collectr app.
            </p>
          </div>
        </div>
        <CollectrValueEditor
          className="mt-4"
          value={settings.collectrInventoryValue}
          onSave={async (nextValue) => {
            await updateSettings({ collectrInventoryValue: nextValue });
          }}
        />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard
          title="Total Spend"
          value={formatCurrency(summary.totalSpend)}
          hint="Stores, parking, tickets, supplies"
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(summary.totalSales)}
          hint="Revenue from cards and product"
          icon={DollarSign}
          accent="violet"
        />
        <StatCard
          title="Miles Driven YTD"
          value={formatMiles(summary.milesYtd)}
          hint={`${new Date().getFullYear()} through ${new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date())}`}
          icon={Navigation}
          accent="indigo"
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
          hint="Collectr value plus sales minus spend and mileage"
          tone={summary.netPosition >= 0 ? "positive" : "negative"}
          icon={summary.netPosition >= 0 ? TrendingUp : TrendingDown}
          accent={summary.netPosition >= 0 ? "emerald" : "rose"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-indigo-600 dark:text-indigo-400" />
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
              <DollarSign className="size-4 text-violet-600 dark:text-violet-400" />
              <h3 className="text-base font-semibold">Recent Sales</h3>
            </div>
            <Link
              href="/sales"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentSales.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No sales yet.
              </p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="list-row">
                  <div>
                    <p className="font-semibold">{sale.item}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(sale.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(sale.amount)}
                    </p>
                    <Badge variant="secondary" className="mt-1.5">
                      {sale.platform}
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
              <Car className="size-4 text-emerald-600 dark:text-emerald-400" />
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
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
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
