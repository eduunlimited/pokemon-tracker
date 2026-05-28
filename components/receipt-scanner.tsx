"use client";

import { useRef, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ExpenseCategory, NewExpense } from "@/lib/types";
import type { ReceiptExtraction } from "@/lib/ocr";

interface ReceiptScannerProps {
  onExtracted: (
    expense: Partial<NewExpense>,
    extraction: ReceiptExtraction,
  ) => void;
}

export function ReceiptScanner({ onExtracted }: ReceiptScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setScanning(true);
    setError(null);

    try {
      const extraction = await api.scanReceipt(file);
      onExtracted(
        {
          vendor: extraction.vendor,
          date: extraction.date,
          amount: extraction.total,
          category: extraction.suggestedCategory,
          notes:
            extraction.lineItems.length > 0
              ? extraction.lineItems.join("; ")
              : undefined,
        },
        extraction,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={scanning}
        onClick={() => inputRef.current?.click()}
      >
        {scanning ? (
          <LoaderCircle className="size-4 animate-spin" data-icon="inline-start" />
        ) : (
          <Camera data-icon="inline-start" />
        )}
        {scanning ? "Scanning receipt..." : "Scan receipt"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
