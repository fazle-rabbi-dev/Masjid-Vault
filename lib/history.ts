import { prisma } from "@/lib/db"
import { getCurrentCollectionMonth } from "@/lib/settings"
import type {
  HistoryData,
  HistorySummary,
  HistoryTransaction,
} from "@/types/history"

type HistoryFilters = {
  year: number | null
  month: number | null
  type: "ALL" | "CONTRIBUTION" | "EXPENSE"
}

export async function getHistoryData(
  filters: HistoryFilters
): Promise<HistoryData> {
  const { year, month, type } = filters
  const current = await getCurrentCollectionMonth()

  const yearStart = year ? new Date(year, 0, 1) : new Date(0, 0, 1)
  const yearEnd = year ? new Date(year + 1, 0, 1) : new Date(9999, 11, 31)

  const [contributions, expenses, contributionYears, expenseDates] =
    await Promise.all([
      prisma.contribution.findMany({
        where: {
          ...(year
            ? { collectionYear: year }
            : {}),
          ...(month ? { collectionMonth: month } : {}),
        },
        orderBy: { receivedAt: "desc" },
        include: { person: { select: { name: true } } },
      }),
      prisma.expense.findMany({
        where: year
          ? { date: { gte: yearStart, lt: yearEnd } }
          : {},
        orderBy: { date: "desc" },
      }),
      prisma.contribution.groupBy({
        by: ["collectionYear"],
        _sum: { amount: true },
      }),
      prisma.expense.findMany({ select: { date: true } }),
    ])

  const contributionRows: HistoryTransaction[] = contributions.map((item) => ({
    id: item.id,
    type: "CONTRIBUTION",
    title: item.person?.name ?? "Unknown contributor",
    amount: item.amount,
    date: item.receivedAt.toISOString(),
    category: null,
    note: item.note,
    personName: item.person?.name ?? null,
    collectionYear: item.collectionYear,
    collectionMonth: item.collectionMonth,
  }))

  const expenseRows: HistoryTransaction[] = expenses.map((item) => ({
    id: item.id,
    type: "EXPENSE",
    title: item.title,
    amount: item.amount,
    date: item.date.toISOString(),
    category: item.category,
    note: item.note,
    personName: null,
    collectionYear: null,
    collectionMonth: null,
  }))

  let rows = [...contributionRows, ...expenseRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (type !== "ALL") {
    rows = rows.filter((row) => row.type === type)
  }

  const collected = contributionRows.reduce((total, row) => total + row.amount, 0)
  const expenseTotal = expenseRows.reduce((total, row) => total + row.amount, 0)

  const years = Array.from(
    new Set([
      current.year,
      ...(year ? [year] : []),
      ...contributionYears.map((item) => item.collectionYear),
      ...expenseDates.map((item) => item.date.getFullYear()),
    ])
  ).sort((a, b) => b - a)

  const summary: HistorySummary = {
    collected,
    expenses: expenseTotal,
    balance: collected - expenseTotal,
    count: rows.length,
  }

  return {
    year: year ?? current.year,
    month,
    type,
    years,
    current,
    rows,
    summary,
  }
}
