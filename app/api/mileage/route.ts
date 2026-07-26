import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapMileageTrip } from "@/lib/mappers";
import {
  buildMileageTripWriteData,
  MileageTripValidationError,
} from "@/lib/mileage-trip-payload";
import { seedDatabaseIfEmpty } from "@/lib/seed";
import type { NewMileageTrip } from "@/lib/types";

export async function GET() {
  await seedDatabaseIfEmpty();
  const trips = await prisma.mileageTrip.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(trips.map(mapMileageTrip));
}

export async function POST(request: Request) {
  await seedDatabaseIfEmpty();
  const body = (await request.json()) as NewMileageTrip;

  try {
    const settings = await prisma.appSetting.findUnique({
      where: { id: "default" },
    });
    const data = await buildMileageTripWriteData(body);

    const trip = await prisma.mileageTrip.create({
      data: {
        ...data,
        ratePerMile: body.ratePerMile ?? settings?.mileageRate ?? 0.67,
      },
    });

    return NextResponse.json(mapMileageTrip(trip), { status: 201 });
  } catch (error) {
    if (error instanceof MileageTripValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    throw error;
  }
}
