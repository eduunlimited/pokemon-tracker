import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapLocation } from "@/lib/mappers";
import type { Location } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as Partial<Location>;

  if (body.isHome) {
    await prisma.location.updateMany({
      where: { isHome: true },
      data: { isHome: false },
    });
  }

  const location = await prisma.location.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      isHome: body.isHome,
    },
  });

  return NextResponse.json(mapLocation(location));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.location.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
