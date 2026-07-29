import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Expense } from "@/lib/types";

function expenseSearchText(expense: Expense): string {
  return [
    expense.vendor,
    expense.category,
    expense.notes ?? "",
    expense.date,
    formatDate(expense.date),
    String(expense.amount),
    formatCurrency(expense.amount),
  ]
    .join(" ")
    .toLowerCase();
}

export function filterExpenses(expenses: Expense[], query: string): Expense[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return expenses;
  }

  return expenses.filter((expense) =>
    expenseSearchText(expense).includes(normalized),
  );
}
