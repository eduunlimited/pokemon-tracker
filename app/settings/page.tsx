"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ThemeSettings } from "@/components/theme-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.profileGeneratorApiKey);

  useEffect(() => {
    setApiKey(settings.profileGeneratorApiKey);
  }, [settings.profileGeneratorApiKey]);

  async function saveApiKey() {
    const nextValue = apiKey.trim();
    if (nextValue !== settings.profileGeneratorApiKey) {
      await updateSettings({ profileGeneratorApiKey: nextValue });
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
          <p className="text-sm text-muted-foreground">
            Profile Generator sends orders with this key. The same order updates one expense.
            Canceled or deleted orders are removed. They are saved as Online Purchases - API.
          </p>
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
