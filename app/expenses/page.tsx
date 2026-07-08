"use client";

import { useState } from "react";
import { Camera, Plus } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";
import type { NewExpense } from "@/lib/types";

export default function ExpensesPage() {
  const { expenses, summary, loading, error, addExpense, deleteExpense } =
    useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<
    Partial<NewExpense> | undefined
  >();

  function openAddExpense(initialValues?: Partial<NewExpense>) {
    setFormInitialValues(initialValues);
    setAddOpen(true);
  }

  function closeAddExpense() {
    setAddOpen(false);
    setFormInitialValues(undefined);
  }

  if (loading) {
    return <LoadingState label="Loading expenses..." />;
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operating costs like supplies, shipping, and event fees."
        action={
          <div className="flex flex-wrap gap-2">
            <ReceiptScanner
              onExtracted={(expense, extraction) => {
                openAddExpense({
                  ...expense,
                  receiptId: extraction.receiptId,
                });
              }}
              renderTrigger={({ scanning, onClick }) => (
                <Button
                  type="button"
                  size="lg"
                  disabled={scanning}
                  onClick={onClick}
                >
                  <Camera data-icon="inline-start" />
                  Scan Receipt
                </Button>
              )}
            />
            <Button size="lg" onClick={() => openAddExpense()}>
              <Plus data-icon="inline-start" />
              Add Expense
            </Button>
          </div>
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

      <Sheet open={addOpen} onOpenChange={(open) => !open && closeAddExpense()}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {formInitialValues?.vendor ? "Review scanned expense" : "Add expense"}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-6">
            <ExpenseForm
              key={formInitialValues?.receiptId ?? "manual"}
              initialValues={formInitialValues}
              onSubmit={async (expense) => {
                await addExpense(expense);
                closeAddExpense();
              }}
              onCancel={closeAddExpense}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
