export type ExpenseCategory =
  | "Store Purchases"
  | "Parking"
  | "Entry Tickets"
  | "Supplies"
  | "Shipping"
  | "Other";

export interface Expense {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  category: ExpenseCategory;
  notes?: string;
}

export type MileageMode = "manual" | "route";

export interface Location {
  id: string;
  name: string;
  isHome: boolean;
}

export interface LocationSegment {
  id: string;
  locationAId: string;
  locationBId: string;
  miles: number;
}

export interface MileageTrip {
  id: string;
  date: string;
  purpose: string;
  miles: number;
  ratePerMile: number;
  mode: MileageMode;
  locationPath?: string[];
  routeSummary?: string;
  notes?: string;
}

export interface AppSettings {
  mileageRate: number;
  collectrInventoryValue: number;
  collectrUpdatedAt?: string;
}

export interface DashboardSummary {
  collectrInventoryValue: number;
  totalSpend: number;
  mileageDeduction: number;
  netPosition: number;
}

export type NewExpense = Omit<Expense, "id"> & {
  receiptId?: string;
};
export type NewMileageTrip = Omit<MileageTrip, "id" | "ratePerMile"> & {
  ratePerMile?: number;
};

export type NewLocation = Omit<Location, "id">;
export type NewLocationSegment = Omit<LocationSegment, "id">;
