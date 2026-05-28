import { prisma } from "@/lib/db";
import { DEFAULT_MILEAGE_RATE } from "@/lib/constants";
import { seedLocationsIfEmpty } from "@/lib/location-seed";

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

/** Ensures settings and default locations exist. Does not insert demo expenses or trips. */
export async function seedDatabaseIfEmpty() {
  await ensureDefaultSettings();
  await seedLocationsIfEmpty();
}
