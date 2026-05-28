import type { AppSettings, Expense, MileageTrip } from "@/lib/types";
import { DEFAULT_MILEAGE_RATE } from "@/lib/constants";

export const initialSettings: AppSettings = {
  mileageRate: DEFAULT_MILEAGE_RATE,
  collectrInventoryValue: 2450,
};

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    date: "2026-05-20",
    vendor: "Ultra Pro",
    amount: 42.5,
    category: "Supplies",
    notes: "Sleeves and top loaders",
  },
  {
    id: "exp-2",
    date: "2026-05-18",
    vendor: "USPS",
    amount: 18.75,
    category: "Shipping",
  },
  {
    id: "exp-3",
    date: "2026-05-12",
    vendor: "Dallas Card Show",
    amount: 75,
    category: "Entry Tickets",
    notes: "Vendor table fee",
  },
  {
    id: "exp-4",
    date: "2026-05-12",
    vendor: "Downtown Garage",
    amount: 12,
    category: "Parking",
  },
  {
    id: "exp-5",
    date: "2026-05-10",
    vendor: "Local Game Store",
    amount: 89.99,
    category: "Store Purchases",
    notes: "Booster box",
  },
];

export const initialTrips: MileageTrip[] = [
  {
    id: "trip-1",
    date: "2026-05-18",
    purpose: "Dallas Card Show",
    miles: 86,
    ratePerMile: DEFAULT_MILEAGE_RATE,
    mode: "route",
    routeSummary: "Home → Dallas Card Show → Home",
    notes: "Round trip",
  },
  {
    id: "trip-2",
    date: "2026-05-05",
    purpose: "Store inventory search",
    miles: 24,
    ratePerMile: DEFAULT_MILEAGE_RATE,
    mode: "manual",
  },
];
