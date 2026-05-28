import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapLocation } from "@/lib/mappers";
import { seedLocationsIfEmpty } from "@/lib/location-seed";
import type { NewLocation } from "@/lib/types";

export async function GET() {
  await seedLocationsIfEmpty();
  const locations = await prisma.location.findMany({
    orderBy: [{ isHome: "desc" }, { name: "asc" }],
  });
  return NextResponse.json(locations.map(mapLocation));
}

export async function POST(request: Request) {
  await seedLocationsIfEmpty();
  const body = (await request.json()) as NewLocation;

  if (body.isHome) {
    await prisma.location.updateMany({
      where: { isHome: true },
      data: { isHome: false },
    });
  }

  const location = await prisma.location.create({
    data: {
      name: body.name.trim(),
      isHome: body.isHome,
    },
  });

  return NextResponse.json(mapLocation(location), { status: 201 });
}
