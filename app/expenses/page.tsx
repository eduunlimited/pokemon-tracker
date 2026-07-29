"use client";

import { useMemo, useState } from "react";
import { Camera, Plus, Search } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";
import { filterExpenses } from "@/lib/expense-search";
import type { Expense, NewExpense } from "@/lib/types";

export default function ExpensesPage() {
  const {
    expenses,
    summary,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useAppStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<
    Partial<NewExpense> | undefined
  >();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExpenses = useMemo(
    () => filterExpenses(expenses, searchQuery),
    [expenses, searchQuery],
  );

  function openCreateExpense(initialValues?: Partial<NewExpense>) {
    setEditingExpense(null);
    setFormInitialValues(initialValues);
    setSheetOpen(true);
  }

  function openEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setFormInitialValues({
      vendor: expense.vendor,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      notes: expense.notes,
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingExpense(null);
    setFormInitialValues(undefined);
  }

  if (loading) {
    return <LoadingState label="Loading expenses..." />;
  }

  const isEditing = editingExpense !== null;
  const isReceiptReview =
    !isEditing && Boolean(formInitialValues?.receiptId || formInitialValues?.vendor);

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track operating costs like supplies, shipping, and event fees."
        action={
          <div className="flex flex-wrap gap-2">
            <ReceiptScanner
              onExtracted={(expense, extraction) => {
                openCreateExpense({
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
            <Button size="lg" onClick={() => openCreateExpense()}>
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

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search vendor, notes, category, amount, or date..."
          className="pl-9"
          aria-label="Search expenses"
        />
      </div>

      <ExpenseList
        expenses={filteredExpenses}
        searchQuery={searchQuery}
        onEdit={openEditExpense}
        onDelete={(id) => {
          void deleteExpense(id);
        }}
      />

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing
                ? "Edit expense"
                : isReceiptReview
                  ? "Review scanned expense"
                  : "Add expense"}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-6">
            <ExpenseForm
              key={editingExpense?.id ?? formInitialValues?.receiptId ?? "manual"}
              mode={isEditing ? "edit" : "create"}
              initialValues={formInitialValues}
              onSubmit={async (expense) => {
                if (editingExpense) {
                  await updateExpense(editingExpense.id, expense);
                } else {
                  await addExpense(expense);
                }
                closeSheet();
              }}
              onCancel={closeSheet}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
