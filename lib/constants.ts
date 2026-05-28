import type { ExpenseCategory } from "@/lib/types";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Store Purchases",
  "Parking",
  "Entry Tickets",
  "Supplies",
  "Shipping",
  "Other",
];

export const DEFAULT_MILEAGE_RATE = 0.67;

export const DEFAULT_TRIP_PURPOSE = "Store inventory search";

export const APP_NAME = "Pokemon Tracker";

/** Bump by 1 on every app update deploy. */
export const APP_REVISION = 1;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" as const },
  { href: "/expenses", label: "Expenses", icon: "Receipt" as const },
  { href: "/mileage", label: "Mileage", icon: "Car" as const },
  { href: "/settings", label: "Settings", icon: "Settings" as const },
] as const;
