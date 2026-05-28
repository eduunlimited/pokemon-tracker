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
  await seedDatabaseIfEmpty();
  const settings = await prisma.appSetting.findUniqueOrThrow({
    where: { id: "default" },
  });
  return NextResponse.json(mapSettings(settings));
}

export async function PATCH(request: Request) {
  await seedDatabaseIfEmpty();
  const body = (await request.json()) as Partial<AppSettings>;

  const settings = await prisma.appSetting.update({
    where: { id: "default" },
    data: {
      mileageRate: body.mileageRate,
      collectrInventoryValue: body.collectrInventoryValue,
      collectrUpdatedAt:
        body.collectrInventoryValue !== undefined ? new Date() : undefined,
    },
  });

  return NextResponse.json(mapSettings(settings));
}
