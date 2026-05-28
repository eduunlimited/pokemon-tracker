import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapLocation, mapLocationSegment, mapMileageTrip, parseDateInput } from "@/lib/mappers";
import { seedDatabaseIfEmpty } from "@/lib/seed";
import { calculateRoute } from "@/lib/mileage-routes";
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

  const settings = await prisma.appSetting.findUnique({
    where: { id: "default" },
  });

  let miles = body.miles;
  let routeSummary = body.routeSummary;

  if (body.mode === "route" && body.locationPath && body.locationPath.length >= 2) {
    const [locations, segments] = await Promise.all([
      prisma.location.findMany(),
      prisma.locationSegment.findMany(),
    ]);

    const calculation = calculateRoute(
      body.locationPath,
      locations.map(mapLocation),
      segments.map(mapLocationSegment),
    );

    if (calculation.missingLegs.length > 0) {
      const missing = calculation.missingLegs
        .map((leg) => `${leg.fromName} → ${leg.toName}`)
        .join(", ");
      return NextResponse.json(
        { message: `Missing segment distances for: ${missing}` },
        { status: 400 },
      );
    }

    miles = calculation.totalMiles ?? body.miles;
    routeSummary = calculation.routeSummary;
  }

  const trip = await prisma.mileageTrip.create({
    data: {
      date: parseDateInput(body.date),
      purpose: body.purpose,
      miles,
      ratePerMile: body.ratePerMile ?? settings?.mileageRate ?? 0.67,
      mode: body.mode ?? "manual",
      locationPath: body.locationPath ? JSON.stringify(body.locationPath) : null,
      routeSummary: routeSummary ?? null,
      notes: body.notes,
    },
  });

  return NextResponse.json(mapMileageTrip(trip), { status: 201 });
}
