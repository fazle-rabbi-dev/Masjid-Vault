import { Receipt, TrendingUp, Wallet, CalendarDays } from "lucide-react"

import { StatCard } from "@/components/private/dashboard/stat-card"
import { formatCurrency } from "@/lib/format"
import type { ExpenseSummary } from "@/types/expenses"

type ExpenseSummaryProps = {
  summary: ExpenseSummary
  monthLabel: string
}

export function ExpenseSummary({ summary, monthLabel }: ExpenseSummaryProps) {
  return (
    <section
      aria-label="Expense summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="This month"
        value={formatCurrency(summary.monthTotal)}
        hint={monthLabel}
        icon={CalendarDays}
        tone="destructive"
      />
      <StatCard
        label="This year"
        value={formatCurrency(summary.yearTotal)}
        hint="All recorded spending this year"
        icon={TrendingUp}
        tone="destructive"
      />
      <StatCard
        label="Total expenses"
        value={formatCurrency(summary.allTimeTotal)}
        hint="All recorded spending"
        icon={Receipt}
        tone="destructive"
      />
      <StatCard
        label="Entries this month"
        value={String(summary.count)}
        hint="Number of expense records"
        icon={Wallet}
      />
    </section>
  )
}
