"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { SaleForm } from "@/components/sale-form";
import { SaleList } from "@/components/sale-list";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/formatters";
import type { NewSale, Sale } from "@/lib/types";

export default function SalesPage() {
  const {
    sales,
    summary,
    loading,
    error,
    addSale,
    updateSale,
    deleteSale,
  } = useAppStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<
    Partial<NewSale> | undefined
  >();

  function openCreateSale() {
    setEditingSale(null);
    setFormInitialValues(undefined);
    setSheetOpen(true);
  }

  function openEditSale(sale: Sale) {
    setEditingSale(sale);
    setFormInitialValues({
      item: sale.item,
      amount: sale.amount,
      date: sale.date,
      platform: sale.platform,
      notes: sale.notes,
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingSale(null);
    setFormInitialValues(undefined);
  }

  if (loading) {
    return <LoadingState label="Loading sales..." />;
  }

  return (
    <div>
      <PageHeader
        title="Sales"
        description="Record card and product sales from eBay, TCGPlayer, and other channels."
        action={
          <Button size="lg" onClick={openCreateSale}>
            <Plus data-icon="inline-start" />
            Add Sale
          </Button>
        }
      />

      {error ? (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Sales"
          value={formatCurrency(summary.totalSales)}
        />
        <StatCard title="Entries" value={String(sales.length)} />
      </div>

      <SaleList
        sales={sales}
        onEdit={openEditSale}
        onDelete={(id) => {
          void deleteSale(id);
        }}
      />

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingSale ? "Edit sale" : "Add sale"}
            </SheetTitle>
          </SheetHeader>
          <div className="pb-6">
            <SaleForm
              key={editingSale?.id ?? "new"}
              mode={editingSale ? "edit" : "create"}
              initialValues={formInitialValues}
              onSubmit={async (sale) => {
                if (editingSale) {
                  await updateSale(editingSale.id, sale);
                } else {
                  await addSale(sale);
                }
                closeSheet();
              }}
              onCancel={closeSheet}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
