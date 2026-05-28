import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapExpense, parseDateInput } from "@/lib/mappers";
import { seedDatabaseIfEmpty } from "@/lib/seed";
import type { NewExpense } from "@/lib/types";

export async function GET() {
  await seedDatabaseIfEmpty();
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses.map(mapExpense));
}

export async function POST(request: Request) {
  await seedDatabaseIfEmpty();
  const body = (await request.json()) as NewExpense;

  const expense = await prisma.expense.create({
    data: {
      date: parseDateInput(body.date),
      vendor: body.vendor,
      amount: body.amount,
      category: body.category,
      notes: body.notes,
    },
  });

  if (body.receiptId) {
    await prisma.receipt.update({
      where: { id: body.receiptId },
      data: { expenseId: expense.id },
    });
  }

  return NextResponse.json(mapExpense(expense), { status: 201 });
}
