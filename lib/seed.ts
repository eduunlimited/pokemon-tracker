import { prisma } from "@/lib/db";
import { DEFAULT_MILEAGE_RATE } from "@/lib/constants";
import { seedLocationsIfEmpty } from "@/lib/location-seed";
import { initialExpenses, initialTrips } from "@/lib/mock-data";
import { parseDateInput } from "@/lib/mappers";

export async function ensureDefaultSettings() {
  await prisma.appSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      mileageRate: Number(process.env.MILEAGE_RATE) || DEFAULT_MILEAGE_RATE,
      collectrInventoryValue: 0,
    },
  });
}

export async function seedDatabaseIfEmpty() {
  await ensureDefaultSettings();
  await seedLocationsIfEmpty();

  const expenseCount = await prisma.expense.count();
  if (expenseCount > 0) {
    return;
  }

  const settings = await prisma.appSetting.findUnique({
    where: { id: "default" },
  });
  const mileageRate = settings?.mileageRate ?? DEFAULT_MILEAGE_RATE;

  await prisma.expense.createMany({
    data: initialExpenses.map((expense) => ({
      date: parseDateInput(expense.date),
      vendor: expense.vendor,
      amount: expense.amount,
      category: expense.category,
      notes: expense.notes,
    })),
  });

  await prisma.mileageTrip.createMany({
    data: initialTrips.map((trip) => ({
      date: parseDateInput(trip.date),
      purpose: trip.purpose,
      miles: trip.miles,
      ratePerMile: trip.ratePerMile ?? mileageRate,
      mode: trip.mode,
      routeSummary: trip.routeSummary,
      notes: trip.notes,
    })),
  });
}
