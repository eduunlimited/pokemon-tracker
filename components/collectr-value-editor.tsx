"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CollectrValueEditorProps {
  value: number;
  onSave: (value: number) => Promise<void>;
  compact?: boolean;
  className?: string;
}

export function CollectrValueEditor({
  value,
  onSave,
  compact = false,
  className,
}: CollectrValueEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value || ""));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) {
      setDraft(value ? String(value) : "");
    }
  }, [value, editing]);

  const startEditing = () => {
    setDraft(value ? String(value) : "");
    setSaveError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(value ? String(value) : "");
    setSaveError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    const nextValue = Number(draft);
    if (Number.isNaN(nextValue) || nextValue < 0) {
      setSaveError("Enter a valid amount (0 or more).");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await onSave(nextValue);
      setEditing(false);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className={cn(
          "group relative w-full rounded-xl border border-input bg-background px-12 py-3 text-center transition-colors hover:border-primary/40 hover:bg-muted/40",
          className,
        )}
      >
        <p className="text-2xl font-bold tracking-tight">
          {formatCurrency(value)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap to enter or update your Collectr value
        </p>
        <div className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Pencil className="size-4" />
        </div>
      </button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        autoFocus
        className={
          compact
            ? "h-11 rounded-xl text-center text-base font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            : "h-12 rounded-xl text-center text-lg font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        }
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            void handleSave();
          }
          if (event.key === "Escape") {
            cancelEditing();
          }
        }}
        placeholder="0.00"
        aria-label="Collectr portfolio value"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="lg"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          <Check data-icon="inline-start" />
          {saving ? "Saving..." : value > 0 ? "Update" : "Save"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={saving}
          onClick={cancelEditing}
        >
          <X data-icon="inline-start" />
          Cancel
        </Button>
      </div>
      {saveError ? (
        <p className="text-sm text-destructive">{saveError}</p>
      ) : null}
    </div>
  );
}
