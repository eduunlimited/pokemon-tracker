"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ImageIcon, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const libraryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setCameraOpen(false);
    setCameraError(null);
  }, [stopCamera]);

  const processFile = useCallback(
    async (file: File) => {
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
    },
    [onExtracted],
  );

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera not available on this device.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setCameraError(null);
    } catch {
      setCameraError("Could not access the camera. Use Photos to pick an image.");
      setCameraReady(false);
    }
  }, []);

  useEffect(() => {
    if (!cameraOpen) return;

    void startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraOpen, startCamera, stopCamera]);

  function openCamera() {
    if (scanning) return;
    setError(null);
    setCameraError(null);
    setCameraOpen(true);
  }

  function openLibrary() {
    libraryInputRef.current?.click();
  }

  async function handleLibraryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    closeCamera();
    await processFile(file);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !cameraReady) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });
    if (!blob) return;

    closeCamera();
    await processFile(
      new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" }),
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={libraryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleLibraryChange(event)}
      />

      {renderTrigger ? (
        renderTrigger({ scanning, onClick: openCamera })
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={scanning}
          onClick={openCamera}
        >
          <Camera data-icon="inline-start" />
          Scan receipt
        </Button>
      )}

      <Dialog open={scanning}>
        <DialogContent
          showCloseButton={false}
          className="flex max-w-sm flex-col items-center gap-4 py-8 text-center"
        >
          <LoaderCircle className="size-10 animate-spin text-primary" />
          <div className="space-y-2">
            <DialogTitle>Analyzing receipt</DialogTitle>
            <DialogDescription>
              Reading vendor, date, and total from your photo. This usually takes
              a few seconds.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cameraOpen}
        onOpenChange={(open) => {
          if (!open) closeCamera();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 top-0 left-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-black p-0 ring-0"
        >
          <DialogTitle className="sr-only">Scan receipt</DialogTitle>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />

          {!cameraReady && !cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-sm text-white">
              <LoaderCircle className="size-6 animate-spin" />
            </div>
          ) : null}

          {cameraError ? (
            <div className="absolute inset-x-4 top-20 rounded-lg bg-black/70 px-4 py-3 text-center text-sm text-white">
              {cameraError}
            </div>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 rounded-full bg-black/45 text-white hover:bg-black/60 hover:text-white"
            onClick={closeCamera}
            aria-label="Close camera"
          >
            <X className="size-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="absolute right-4 bottom-[max(6.5rem,env(safe-area-inset-bottom))] rounded-2xl border-2 border-white/80 bg-black/45 text-white hover:bg-black/60 hover:text-white"
            onClick={openLibrary}
            aria-label="Choose from photos"
          >
            <ImageIcon className="size-6" />
          </Button>

          <div className="absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] flex justify-center">
            <button
              type="button"
              disabled={!cameraReady || scanning}
              onClick={() => void capturePhoto()}
              className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-white bg-white/20 disabled:opacity-50"
              aria-label="Capture receipt photo"
            >
              <span className="size-14 rounded-full bg-white" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
