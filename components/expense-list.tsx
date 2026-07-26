"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Expense } from "@/lib/types";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Add your first business expense to start tracking costs."
      />
    );
  }

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((expense) => (
        <div key={expense.id} className="glass-panel p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{expense.vendor}</p>
                <Badge variant="secondary">{expense.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(expense.date)}
              </p>
              {expense.notes ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {expense.notes}
                </p>
              ) : null}
            </div>
            <div className="flex items-start gap-1">
              <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(expense)}
                aria-label={`Edit expense ${expense.vendor}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(expense.id)}
                aria-label={`Delete expense ${expense.vendor}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
