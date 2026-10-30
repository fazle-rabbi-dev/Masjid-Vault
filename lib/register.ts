import { prisma } from "@/lib/db"
import { getCurrentCollectionMonth } from "@/lib/settings"
import type {
  PaymentStatus,
  RegisterData,
  RegisterPerson,
} from "@/types/register"

function getStatus(active: boolean, promised: number, paid: number): PaymentStatus {
  if (!active) return "INACTIVE"
  if (paid <= 0) return "UNPAID"
  if (promised > 0 && paid < promised) return "PARTIAL"

  return "PAID"
}

export async function getRegisterData(
  year: number,
  month: number
): Promise<RegisterData> {
  const yearStart = new Date(year, 0, 1)
  const nextYearStart = new Date(year + 1, 0, 1)

  const [
    people,
    yearCollection,
    yearExpenses,
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
    prisma.contribution.aggregate({
      where: { collectionYear: year },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: yearStart, lt: nextYearStart } },
      _sum: { amount: true },
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

  const rows: RegisterPerson[] = people.map((person) => {
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
      status: getStatus(person.active, person.monthlyAmount, paid),
      payments: person.contributions.map((contribution) => ({
        id: contribution.id,
        amount: contribution.amount,
        receivedAt: contribution.receivedAt.toISOString(),
        note: contribution.note,
      })),
    }
  })

  const activeRows = rows.filter((row) => row.active)
  const collected = rows.reduce((total, row) => total + row.paid, 0)
  const expected = activeRows.reduce(
    (total, row) => total + row.monthlyAmount,
    0
  )
  const yearCollected = yearCollection._sum.amount ?? 0
  const yearExpenseTotal = yearExpenses._sum.amount ?? 0

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
    rows,
    summary: {
      collected,
      expected,
      paidPeople: activeRows.filter((row) => row.paid > 0).length,
      activePeople: activeRows.length,
      yearCollected,
      yearExpenses: yearExpenseTotal,
      yearBalance: yearCollected - yearExpenseTotal,
    },
  }
}

export async function getPersonOptions() {
  const people = await prisma.person.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, monthlyAmount: true },
  })

  return people
}

export { getStatus }
