"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { NewExpense } from "@/lib/types";
import type { ReceiptExtraction } from "@/lib/ocr";

interface ReceiptScannerProps {
  onExtracted: (
    expense: Partial<NewExpense>,
    extraction: ReceiptExtraction,
  ) => void;
  renderTrigger?: (props: {
    scanning: boolean;
    onClick: () => void;
  }) => React.ReactNode;
}

export function ReceiptScanner({
  onExtracted,
  renderTrigger,
}: ReceiptScannerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openSourcePicker() {
    if (scanning) return;
    setSourceOpen(true);
  }

  function openCamera() {
    setSourceOpen(false);
    cameraInputRef.current?.click();
  }

  function openLibrary() {
    setSourceOpen(false);
    libraryInputRef.current?.click();
  }

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
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {renderTrigger ? (
        renderTrigger({ scanning, onClick: openSourcePicker })
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={scanning}
          onClick={openSourcePicker}
        >
          {scanning ? (
            <LoaderCircle className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Camera data-icon="inline-start" />
          )}
          {scanning ? "Scanning receipt..." : "Scan receipt"}
        </Button>
      )}

      <Dialog open={sourceOpen} onOpenChange={setSourceOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Add receipt photo</DialogTitle>
            <DialogDescription>
              Take a new photo or choose an existing image from your photos app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button type="button" size="lg" onClick={openCamera}>
              <Camera data-icon="inline-start" />
              Take photo
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={openLibrary}>
              <ImageIcon data-icon="inline-start" />
              Choose from photos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
