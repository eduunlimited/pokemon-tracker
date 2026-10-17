"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ThemeSettings } from "@/components/theme-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";

export default function SettingsPage() {
  const { settings, loading, updateSettings, refresh } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.profileGeneratorApiKey);
  const [busy, setBusy] = useState<"test" | "sync" | null>(null);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; message: string } | null>(null);

  useEffect(() => {
    setApiKey(settings.profileGeneratorApiKey);
  }, [settings.profileGeneratorApiKey]);

  async function saveApiKey() {
    const nextValue = apiKey.trim();
    if (nextValue !== settings.profileGeneratorApiKey) {
      await updateSettings({ profileGeneratorApiKey: nextValue });
    }
    return nextValue;
  }

  async function runProfileOrders(action: "test" | "sync") {
    if (busy) return;
    setBusy(action);
    setStatus(null);
    try {
      const savedKey = await saveApiKey();
      if (!savedKey) {
        setStatus({ tone: "error", message: "Enter an API key first." });
        return;
      }
      const result = action === "test" ? await api.testProfileOrders() : await api.syncProfileOrders();
      if (action === "sync") await refresh();
      setStatus({ tone: "ok", message: result.message });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not reach the orders API.",
      });
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <LoadingState label="Loading settings..." />;
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure appearance, mileage, and the Profile Generator API key."
      />

      <Card className="mb-6 max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ThemeSettings />
          <p className="text-sm text-muted-foreground">
            Choose light, dark, or match your device with System.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6 max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Profile Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="profileGeneratorApiKey">Orders API key</Label>
          <Input
            id="profileGeneratorApiKey"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            onBlur={() => {
              void saveApiKey();
            }}
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" disabled={busy !== null} onClick={() => void runProfileOrders("sync")}>
              {busy === "sync" ? "Syncing..." : "Sync Now"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => void runProfileOrders("test")}
            >
              {busy === "test" ? "Testing..." : "Test"}
            </Button>
          </div>
          {status ? (
            <p className={`text-sm ${status.tone === "error" ? "text-destructive" : "text-muted-foreground"}`}>
              {status.message}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Test checks Profile Generator. Sync Now imports orders as Online Purchases - API.
              The same order is updated, and canceled or deleted orders are removed.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Mileage rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mileageRate">IRS rate per mile</Label>
            <Input
              id="mileageRate"
              type="number"
              min="0"
              step="0.01"
              defaultValue={settings.mileageRate}
              onBlur={(event) => {
                const nextValue = Number(event.target.value);
                if (!Number.isNaN(nextValue) && nextValue !== settings.mileageRate) {
                  void updateSettings({ mileageRate: nextValue });
                }
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Current rate: {formatCurrency(settings.mileageRate)} per mile
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => void updateSettings({ mileageRate: 0.67 })}
          >
            Reset to $0.67
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
