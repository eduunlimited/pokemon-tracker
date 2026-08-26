import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapSale, parseDateInput } from "@/lib/mappers";
import { seedDatabaseIfEmpty } from "@/lib/seed";
import type { NewSale } from "@/lib/types";

export async function GET() {
  await seedDatabaseIfEmpty();
  const sales = await prisma.sale.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(sales.map(mapSale));
}

export async function POST(request: Request) {
  await seedDatabaseIfEmpty();
  const body = (await request.json()) as NewSale;

  const sale = await prisma.sale.create({
    data: {
      date: parseDateInput(body.date),
      item: body.item,
      amount: body.amount,
      platform: body.platform,
      notes: body.notes,
    },
  });

  return NextResponse.json(mapSale(sale), { status: 201 });
}
