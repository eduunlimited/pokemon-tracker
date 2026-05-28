"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";

export default function ExpensesPage() {
  const { expenses, summary, loading, error, addExpense, deleteExpense } =
    useAppStore();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <LoadingState label="Loading expenses..." />;
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operating costs like supplies, shipping, and event fees."
        action={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button>
                  <Plus data-icon="inline-start" />
                  Add Expense
                </Button>
              }
            />
            <SheetContent className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add expense</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <ExpenseForm
                  onSubmit={async (expense) => {
                    await addExpense(expense);
                    setOpen(false);
                  }}
                  onCancel={() => setOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      {error ? (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Spend"
          value={formatCurrency(summary.totalSpend)}
        />
        <StatCard title="Entries" value={String(expenses.length)} />
      </div>

      <ExpenseList
        expenses={expenses}
        onDelete={(id) => {
          void deleteExpense(id);
        }}
      />
    </div>
  );
}
