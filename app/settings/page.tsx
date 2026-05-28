"use client";

import { CollectrValueEditor } from "@/components/collectr-value-editor";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";

export default function SettingsPage() {
  const { settings, loading, updateSettings } = useAppStore();

  if (loading) {
    return <LoadingState label="Loading settings..." />;
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure Collectr value and mileage rate."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collectr portfolio value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CollectrValueEditor
              compact
              value={settings.collectrInventoryValue}
              onSave={async (nextValue) => {
                await updateSettings({ collectrInventoryValue: nextValue });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Open Collectr, copy your total portfolio value, tap the amount
              above, enter it, then press Save or Update.
            </p>
          </CardContent>
        </Card>

        <Card>
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
    </div>
  );
}
