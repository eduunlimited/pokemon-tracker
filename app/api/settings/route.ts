import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { seedDatabaseIfEmpty } from "@/lib/seed";
import type { AppSettings } from "@/lib/types";

function mapSettings(settings: {
  mileageRate: number;
  collectrInventoryValue: number;
  collectrUpdatedAt: Date | null;
}): AppSettings {
  return {
    mileageRate: settings.mileageRate,
    collectrInventoryValue: settings.collectrInventoryValue,
    collectrUpdatedAt: settings.collectrUpdatedAt?.toISOString(),
  };
}

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const settings = await prisma.appSetting.findUniqueOrThrow({
      where: { id: "default" },
    });
    return NextResponse.json(mapSettings(settings));
  } catch (error) {
    console.error("Failed to load settings:", error);
    return NextResponse.json(
      { message: "Could not load settings. Check your database connection." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  await seedDatabaseIfEmpty();
  const body = (await request.json()) as Partial<AppSettings>;

  const data: {
    mileageRate?: number;
    collectrInventoryValue?: number;
    collectrUpdatedAt?: Date;
  } = {};

  if (typeof body.mileageRate === "number" && !Number.isNaN(body.mileageRate)) {
    data.mileageRate = body.mileageRate;
  }

  if (
    typeof body.collectrInventoryValue === "number" &&
    !Number.isNaN(body.collectrInventoryValue)
  ) {
    data.collectrInventoryValue = body.collectrInventoryValue;
    data.collectrUpdatedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { message: "No valid settings were provided." },
      { status: 400 },
    );
  }

  const settings = await prisma.appSetting.update({
    where: { id: "default" },
    data,
  });

  return NextResponse.json(mapSettings(settings));
}
