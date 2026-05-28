import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapLocation, mapLocationSegment } from "@/lib/mappers";
import { seedLocationsIfEmpty } from "@/lib/location-seed";
import { calculateRoute } from "@/lib/mileage-routes";

export async function POST(request: Request) {
  await seedLocationsIfEmpty();
  const body = (await request.json()) as { locationIds: string[] };

  const [locations, segments] = await Promise.all([
    prisma.location.findMany(),
    prisma.locationSegment.findMany(),
  ]);

  const calculation = calculateRoute(
    body.locationIds,
    locations.map(mapLocation),
    segments.map(mapLocationSegment),
  );

  return NextResponse.json(calculation);
}
