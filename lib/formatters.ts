export { formatDate, toInputDate } from "@/lib/dates";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatMiles(miles: number): string {
  return `${miles.toFixed(1)} mi`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
