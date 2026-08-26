"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Sale } from "@/lib/types";

interface SaleListProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

export function SaleList({ sales, onEdit, onDelete }: SaleListProps) {
  if (sales.length === 0) {
    return (
      <EmptyState
        title="No sales yet"
        description="Record your first sale to track revenue from cards and sealed product."
      />
    );
  }

  const sorted = [...sales].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((sale) => (
        <div key={sale.id} className="glass-panel p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{sale.item}</p>
                <Badge variant="secondary">{sale.platform}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(sale.date)}
              </p>
              {sale.notes ? (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {sale.notes}
                </p>
              ) : null}
            </div>
            <div className="flex items-start gap-1">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(sale.amount)}
              </p>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(sale)}
                aria-label={`Edit sale ${sale.item}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(sale.id)}
                aria-label={`Delete sale ${sale.item}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
