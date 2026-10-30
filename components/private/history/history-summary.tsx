import { ArrowDownLeft, ArrowUpRight, Scale, Wallet } from "lucide-react"

import { StatCard } from "@/components/private/dashboard/stat-card"
import { formatCurrency } from "@/lib/format"
import type { HistorySummary } from "@/types/history"

type HistorySummaryProps = {
  summary: HistorySummary
}

export function HistorySummary({ summary }: HistorySummaryProps) {
  return (
    <section
      aria-label="History summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="Total collected"
        value={formatCurrency(summary.collected)}
        hint="All contributions in view"
        icon={ArrowDownLeft}
        tone="success"
      />
      <StatCard
        label="Total expenses"
        value={formatCurrency(summary.expenses)}
        hint="All expenses in view"
        icon={ArrowUpRight}
        tone="destructive"
      />
      <StatCard
        label="Net balance"
        value={formatCurrency(summary.balance)}
        hint="Collected minus expenses"
        icon={Wallet}
        tone={summary.balance < 0 ? "destructive" : "success"}
      />
      <StatCard
        label="Transactions"
        value={String(summary.count)}
        hint="Records in current view"
        icon={Scale}
      />
    </section>
  )
}
