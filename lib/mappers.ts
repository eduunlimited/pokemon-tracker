import { parseDateOnly, toDateOnlyString } from "@/lib/dates";
import type { Expense, ExpenseCategory, Location, LocationSegment, MileageMode, MileageTrip, Sale, SalePlatform } from "@/lib/types";
import type {
  Expense as DbExpense,
  Location as DbLocation,
  LocationSegment as DbLocationSegment,
  MileageTrip as DbMileageTrip,
  Sale as DbSale,
} from "@prisma/client";

export function mapExpense(expense: DbExpense): Expense {
  return {
    id: expense.id,
    date: toDateOnlyString(expense.date),
    vendor: expense.vendor,
    amount: expense.amount,
    category: expense.category as ExpenseCategory,
    notes: expense.notes ?? undefined,
  };
}

export function mapSale(sale: DbSale): Sale {
  return {
    id: sale.id,
    date: toDateOnlyString(sale.date),
    item: sale.item,
    amount: sale.amount,
    platform: sale.platform as SalePlatform,
    notes: sale.notes ?? undefined,
  };
}

export function mapMileageTrip(trip: DbMileageTrip): MileageTrip {
  return {
    id: trip.id,
    date: toDateOnlyString(trip.date),
    purpose: trip.purpose,
    miles: trip.miles,
    ratePerMile: trip.ratePerMile,
    mode: trip.mode as MileageMode,
    locationPath: trip.locationPath
      ? (JSON.parse(trip.locationPath) as string[])
      : undefined,
    routeSummary: trip.routeSummary ?? undefined,
    notes: trip.notes ?? undefined,
  };
}

export function mapLocation(location: DbLocation): Location {
  return {
    id: location.id,
    name: location.name,
    isHome: location.isHome,
  };
}

export function mapLocationSegment(segment: DbLocationSegment): LocationSegment {
  return {
    id: segment.id,
    locationAId: segment.locationAId,
    locationBId: segment.locationBId,
    miles: segment.miles,
  };
}

export function parseDateInput(value: string): Date {
  return parseDateOnly(value);
}
