import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapSale, parseDateInput } from "@/lib/mappers";
import type { NewSale } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as NewSale;

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        date: parseDateInput(body.date),
        item: body.item,
        amount: body.amount,
        platform: body.platform,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(mapSale(sale));
  } catch {
    return NextResponse.json({ message: "Sale not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.sale.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
