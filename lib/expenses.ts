import { prisma } from "@/lib/db"
import { getCurrentCollectionMonth } from "@/lib/settings"
import type { ExpenseData, ExpenseRow, ExpenseSummary } from "@/types/expenses"

export async function getExpenseData(
  year: number,
  month: number
): Promise<ExpenseData> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year + 1, 0, 1)

  const [
    rows,
    monthAggregate,
    yearAggregate,
    allTimeAggregate,
    expenseDates,
    current,
  ] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: monthStart, lt: monthEnd } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.expense.aggregate({
      where: { date: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { date: { gte: yearStart, lt: yearEnd } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.findMany({ select: { date: true } }),
    getCurrentCollectionMonth(),
  ])

  const mappedRows: ExpenseRow[] = rows.map((expense) => ({
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    date: expense.date.toISOString(),
    category: expense.category,
    note: expense.note,
  }))

  const years = Array.from(
    new Set([
      current.year,
      year,
      ...expenseDates.map((item) => item.date.getFullYear()),
    ])
  ).sort((a, b) => b - a)

  const summary: ExpenseSummary = {
    monthTotal: monthAggregate._sum.amount ?? 0,
    yearTotal: yearAggregate._sum.amount ?? 0,
    allTimeTotal: allTimeAggregate._sum.amount ?? 0,
    count: monthAggregate._count,
  }

  return { year, month, years, current, rows: mappedRows, summary }
}
