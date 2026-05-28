"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ReceiptScanner } from "@/components/receipt-scanner";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { toInputDate } from "@/lib/formatters";
import type { ExpenseCategory, NewExpense } from "@/lib/types";

interface ExpenseFormProps {
  onSubmit: (expense: NewExpense) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<NewExpense>;
  showReceiptScanner?: boolean;
}

export function ExpenseForm({
  onSubmit,
  onCancel,
  initialValues,
  showReceiptScanner = true,
}: ExpenseFormProps) {
  const [vendor, setVendor] = useState(initialValues?.vendor ?? "");
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : "",
  );
  const [date, setDate] = useState(initialValues?.date ?? toInputDate());
  const [category, setCategory] = useState<ExpenseCategory>(
    initialValues?.category ?? "Store Purchases",
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [receiptId, setReceiptId] = useState<string | undefined>(
    initialValues?.receiptId,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setVendor(initialValues?.vendor ?? "");
    setAmount(
      initialValues?.amount !== undefined ? String(initialValues.amount) : "",
    );
    setDate(initialValues?.date ?? toInputDate());
    setCategory(initialValues?.category ?? "Supplies");
    setNotes(initialValues?.notes ?? "");
    setReceiptId(initialValues?.receiptId);
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!vendor.trim() || !amount) return;

    setSubmitting(true);
    try {
      await onSubmit({
        vendor: vendor.trim(),
        amount: Number(amount),
        date,
        category,
        notes: notes.trim() || undefined,
        receiptId,
      });

      setVendor("");
      setAmount("");
      setDate(toInputDate());
      setCategory("Store Purchases");
      setNotes("");
      setReceiptId(undefined);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showReceiptScanner ? (
        <ReceiptScanner
          onExtracted={(expense, extraction) => {
            if (expense.vendor) setVendor(expense.vendor);
            if (expense.amount !== undefined) setAmount(String(expense.amount));
            if (expense.date) setDate(expense.date);
            if (expense.category) setCategory(expense.category);
            if (expense.notes) setNotes(expense.notes);
            if (extraction.receiptId) setReceiptId(extraction.receiptId);
          }}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Input
            id="vendor"
            value={vendor}
            onChange={(event) => setVendor(event.target.value)}
            placeholder="Ultra Pro"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(value) =>
              value && setCategory(value as ExpenseCategory)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional details"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Expense"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
