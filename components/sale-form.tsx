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
import { SALE_PLATFORMS } from "@/lib/constants";
import { toInputDate } from "@/lib/formatters";
import type { NewSale, SalePlatform } from "@/lib/types";

interface SaleFormProps {
  onSubmit: (sale: NewSale) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<NewSale>;
  mode?: "create" | "edit";
}

export function SaleForm({
  onSubmit,
  onCancel,
  initialValues,
  mode = "create",
}: SaleFormProps) {
  const [item, setItem] = useState(initialValues?.item ?? "");
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : "",
  );
  const [date, setDate] = useState(initialValues?.date ?? toInputDate());
  const [platform, setPlatform] = useState<SalePlatform>(
    initialValues?.platform ?? "eBay",
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setItem(initialValues?.item ?? "");
    setAmount(
      initialValues?.amount !== undefined ? String(initialValues.amount) : "",
    );
    setDate(initialValues?.date ?? toInputDate());
    setPlatform(initialValues?.platform ?? "eBay");
    setNotes(initialValues?.notes ?? "");
  }, [initialValues]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!item.trim() || !amount) return;

    setSubmitting(true);
    try {
      await onSubmit({
        item: item.trim(),
        amount: Number(amount),
        date,
        platform,
        notes: notes.trim() || undefined,
      });

      if (mode === "create") {
        setItem("");
        setAmount("");
        setDate(toInputDate());
        setPlatform("eBay");
        setNotes("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="item">Item sold</Label>
          <Input
            id="item"
            value={item}
            onChange={(event) => setItem(event.target.value)}
            placeholder="Charizard ex - Obsidian Flames"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="saleAmount">Sale amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              $
            </span>
            <Input
              id="saleAmount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="pl-7"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="saleDate">Date</Label>
          <Input
            id="saleDate"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Platform</Label>
          <Select
            value={platform}
            onValueChange={(value) =>
              value && setPlatform(value as SalePlatform)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {SALE_PLATFORMS.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {entry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="saleNotes">Notes</Label>
        <Textarea
          id="saleNotes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Buyer, fees, shipping details, etc."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Sale"
              : "Save Sale"}
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
