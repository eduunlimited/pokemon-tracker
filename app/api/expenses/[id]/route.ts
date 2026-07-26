import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapExpense, parseDateInput } from "@/lib/mappers";
import type { NewExpense } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as NewExpense;

  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: parseDateInput(body.date),
        vendor: body.vendor,
        amount: body.amount,
        category: body.category,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(mapExpense(expense));
  } catch {
    return NextResponse.json({ message: "Expense not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.expense.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
