import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapLocationSegment } from "@/lib/mappers";
import { seedLocationsIfEmpty } from "@/lib/location-seed";
import { canonicalSegmentIds } from "@/lib/mileage-routes";

export async function GET() {
  await seedLocationsIfEmpty();
  const segments = await prisma.locationSegment.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(segments.map(mapLocationSegment));
}

export async function POST(request: Request) {
  await seedLocationsIfEmpty();
  const body = (await request.json()) as {
    fromLocationId: string;
    toLocationId: string;
    miles: number;
  };

  const { locationAId, locationBId } = canonicalSegmentIds(
    body.fromLocationId,
    body.toLocationId,
  );

  const segment = await prisma.locationSegment.upsert({
    where: {
      locationAId_locationBId: {
        locationAId,
        locationBId,
      },
    },
    update: {
      miles: body.miles,
    },
    create: {
      locationAId,
      locationBId,
      miles: body.miles,
    },
  });

  return NextResponse.json(mapLocationSegment(segment), { status: 201 });
}
