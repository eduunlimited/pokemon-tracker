import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapMileageTrip } from "@/lib/mappers";
import {
  buildMileageTripWriteData,
  MileageTripValidationError,
} from "@/lib/mileage-trip-payload";
import type { NewMileageTrip } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as NewMileageTrip;

  try {
    const data = await buildMileageTripWriteData(body);
    const trip = await prisma.mileageTrip.update({
      where: { id },
      data,
    });

    return NextResponse.json(mapMileageTrip(trip));
  } catch (error) {
    if (error instanceof MileageTripValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Trip not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.mileageTrip.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
