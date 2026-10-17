"use client";

import { useEffect, useMemo, useState } from "react";
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
  onDeleteSelected: (ids: string[]) => Promise<void>;
  searchQuery?: string;
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onDeleteSelected,
  searchQuery,
}: ExpenseListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const sorted = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)),
    [expenses],
  );
  const visibleIds = useMemo(() => sorted.map((expense) => expense.id), [sorted]);
  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => visibleIds.includes(id)));
  }, [visibleIds]);

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function deleteSelected() {
    if (selectedIds.length === 0 || deleting) return;
    const label = selectedIds.length === 1 ? "1 expense" : `${selectedIds.length} expenses`;
    if (!window.confirm(`Delete ${label}?`)) return;
    setDeleting(true);
    try {
      await onDeleteSelected(selectedIds);
      setSelectedIds([]);
    } finally {
      setDeleting(false);
    }
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title={searchQuery?.trim() ? "No matching expenses" : "No expenses yet"}
        description={
          searchQuery?.trim()
            ? "Try a different vendor, note, category, amount, or date."
            : "Add your first business expense to start tracking costs."
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 px-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={allSelected}
            onChange={() => setSelectedIds(allSelected ? [] : visibleIds)}
            aria-label="Select all expenses"
          />
          Select all
        </label>
        {selectedIds.length > 0 ? (
          <>
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={() => void deleteSelected()}
            >
              <Trash2 data-icon="inline-start" />
              Delete selected
            </Button>
          </>
        ) : null}
      </div>
      {sorted.map((expense) => (
        <div key={expense.id} className="glass-panel p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-primary"
                checked={selected.has(expense.id)}
                onChange={() => toggle(expense.id)}
                aria-label={`Select expense ${expense.vendor}`}
              />
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
