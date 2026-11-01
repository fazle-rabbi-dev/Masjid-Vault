import { prisma } from "@/lib/db"
import { getCurrentCollectionMonth } from "@/lib/settings"
import type { ReportData } from "@/types/reports"

export async function getReportData(
  year: number,
  month: number
): Promise<ReportData> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const [
    people,
    expenses,
    contributionYears,
    firstExpense,
    current,
  ] = await Promise.all([
    prisma.person.findMany({
      where: {
        OR: [
          { active: true },
          {
            contributions: {
              some: { collectionYear: year, collectionMonth: month },
            },
          },
        ],
      },
      include: {
        contributions: {
          where: { collectionYear: year, collectionMonth: month },
          orderBy: { receivedAt: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: monthStart, lt: monthEnd } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.contribution.groupBy({
      by: ["collectionYear"],
      _sum: { amount: true },
    }),
    prisma.expense.findFirst({
      orderBy: { date: "asc" },
      select: { date: true },
    }),
    getCurrentCollectionMonth(),
  ])

  const reportPeople = people.map((person) => {
    const paid = person.contributions.reduce(
      (total, contribution) => total + contribution.amount,
      0
    )

    return {
      id: person.id,
      name: person.name,
      monthlyAmount: person.monthlyAmount,
      active: person.active,
      paid,
      payments: person.contributions.map((contribution) => ({
        personName: person.name,
        amount: contribution.amount,
        receivedAt: contribution.receivedAt.toISOString(),
        note: contribution.note,
      })),
    }
  })

  const collected = reportPeople.reduce((total, person) => total + person.paid, 0)
  const activePeople = reportPeople.filter((person) => person.active)
  const expected = activePeople.reduce(
    (total, person) => total + person.monthlyAmount,
    0
  )
  const paidPeople = reportPeople.filter((person) => person.paid > 0).length
  const expenseTotal = expenses.reduce((total, item) => total + item.amount, 0)

  const receivedDates = reportPeople
    .flatMap((person) => person.payments.map((payment) => payment.receivedAt))
    .sort()

  const years = Array.from(
    new Set([
      current.year,
      year,
      ...contributionYears.map((row) => row.collectionYear),
      ...(firstExpense ? [firstExpense.date.getFullYear()] : []),
    ])
  ).sort((a, b) => b - a)

  return {
    year,
    month,
    years,
    current,
    people: reportPeople,
    expenses: expenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      amount: expense.amount,
      date: expense.date.toISOString(),
      category: expense.category,
      note: expense.note,
    })),
    collected,
    expected,
    paidPeople,
    activePeople: activePeople.length,
    expenseTotal,
    balance: collected - expenseTotal,
    firstReceivedAt: receivedDates[0] ?? null,
    lastReceivedAt: receivedDates[receivedDates.length - 1] ?? null,
  }
}
