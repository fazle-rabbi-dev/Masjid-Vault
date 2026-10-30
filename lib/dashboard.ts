import type { Role } from "@/constants/auth"
import { prisma } from "@/lib/db"
import { getCurrentCollectionMonth } from "@/lib/settings"

export async function getDashboardData(role: Role) {
  const { year, month } = await getCurrentCollectionMonth()
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const [
    collected,
    expenses,
    monthCollection,
    monthExpenses,
    activePeople,
    totalPeople,
    expected,
    paidPeople,
    recentContributions,
    recentExpenses,
    pendingApprovals,
  ] = await Promise.all([
    prisma.contribution.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.contribution.aggregate({
      where: { collectionYear: year, collectionMonth: month },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.person.count({ where: { active: true } }),
    prisma.person.count(),
    prisma.person.aggregate({
      where: { active: true },
      _sum: { monthlyAmount: true },
    }),
    prisma.contribution.groupBy({
      by: ["personId"],
      where: { collectionYear: year, collectionMonth: month },
    }),
    prisma.contribution.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { person: { select: { name: true } } },
    }),
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 5 }),
    role === "ADMIN"
      ? prisma.approvalRequest.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
  ])

  const totalCollected = collected._sum.amount ?? 0
  const totalExpenses = expenses._sum.amount ?? 0
  const expectedThisMonth = expected._sum.monthlyAmount ?? 0
  const thisMonthCollection = monthCollection._sum.amount ?? 0

  return {
    month: { year, month },
    totals: {
      collected: totalCollected,
      expenses: totalExpenses,
      balance: totalCollected - totalExpenses,
      monthCollection: thisMonthCollection,
      monthExpenses: monthExpenses._sum.amount ?? 0,
    },
    people: {
      active: activePeople,
      total: totalPeople,
      paid: paidPeople.length,
    },
    progress: {
      expected: expectedThisMonth,
      collected: thisMonthCollection,
      percent:
        expectedThisMonth > 0
          ? Math.min(100, Math.round((thisMonthCollection / expectedThisMonth) * 100))
          : 0,
    },
    pendingApprovals,
    recentContributions,
    recentExpenses,
  }
}
