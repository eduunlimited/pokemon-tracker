import type {
  AppSettings,
  DashboardSummary,
  Expense,
  MileageTrip,
} from "@/lib/types";

export function calculateMileageDeduction(trip: MileageTrip): number {
  return trip.miles * trip.ratePerMile;
}

export function calculateTotalMileageDeduction(trips: MileageTrip[]): number {
  return trips.reduce((sum, trip) => sum + calculateMileageDeduction(trip), 0);
}

export function calculateTotalMiles(trips: MileageTrip[]): number {
  return trips.reduce((sum, trip) => sum + trip.miles, 0);
}

export interface MileagePeriodSummary {
  miles: number;
  deduction: number;
  tripCount: number;
}

export function summarizeMileageTrips(trips: MileageTrip[]): MileagePeriodSummary {
  return {
    miles: calculateTotalMiles(trips),
    deduction: calculateTotalMileageDeduction(trips),
    tripCount: trips.length,
  };
}

export function getTripMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function getTripYear(date: string): number {
  return Number(date.slice(0, 4));
}

export function getTripMonth(date: string): number {
  return Number(date.slice(5, 7));
}

export function filterTripsByMonth(
  trips: MileageTrip[],
  year: number,
  month: number,
): MileageTrip[] {
  return trips.filter(
    (trip) => getTripYear(trip.date) === year && getTripMonth(trip.date) === month,
  );
}

export function filterTripsYearToDate(
  trips: MileageTrip[],
  year: number,
  throughMonth: number,
): MileageTrip[] {
  return trips.filter((trip) => {
    const tripYear = getTripYear(trip.date);
    const tripMonth = getTripMonth(trip.date);
    return tripYear === year && tripMonth >= 1 && tripMonth <= throughMonth;
  });
}

export interface MileageMonthOption {
  year: number;
  month: number;
  value: string;
  label: string;
}

export function getMileageMonthOptions(trips: MileageTrip[]): MileageMonthOption[] {
  const now = new Date();
  const keys = new Set<string>([
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  ]);

  for (const trip of trips) {
    keys.add(getTripMonthKey(trip.date));
  }

  return [...keys]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => {
      const [year, month] = value.split("-").map(Number);
      return {
        year,
        month,
        value,
        label: new Intl.DateTimeFormat("en-US", {
          month: "long",
          year: "numeric",
        }).format(new Date(year, month - 1, 1)),
      };
    });
}

export function getCurrentMonthPeriod(): { year: number; month: number; value: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return {
    year,
    month,
    value: `${year}-${String(month).padStart(2, "0")}`,
  };
}

export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function calculateDashboardSummary(
  expenses: Expense[],
  trips: MileageTrip[],
  settings: AppSettings,
): DashboardSummary {
  const totalSpend = calculateTotalExpenses(expenses);
  const mileageDeduction = calculateTotalMileageDeduction(trips);
  const collectrInventoryValue = settings.collectrInventoryValue;
  const netPosition = collectrInventoryValue - (totalSpend + mileageDeduction);
  const { year, month } = getCurrentMonthPeriod();
  const milesYtd = calculateTotalMiles(
    filterTripsYearToDate(trips, year, month),
  );

  return {
    collectrInventoryValue,
    totalSpend,
    mileageDeduction,
    milesYtd,
    netPosition,
  };
}
