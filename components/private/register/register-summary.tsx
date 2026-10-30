import { HandCoins, Target, Users, Wallet } from "lucide-react"

import { StatCard } from "@/components/private/dashboard/stat-card"
import { formatCurrency } from "@/lib/format"
import type { RegisterSummary as Summary } from "@/types/register"

type RegisterSummaryProps = {
  summary: Summary
  monthLabel: string
}

export function RegisterSummary({ summary, monthLabel }: RegisterSummaryProps) {
  return (
    <section
      aria-label="Register summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        label="Collected this month"
        value={formatCurrency(summary.collected)}
        hint={monthLabel}
        icon={HandCoins}
        tone="success"
      />
      <StatCard
        label="Expected this month"
        value={formatCurrency(summary.expected)}
        hint="Based on promised monthly amounts"
        icon={Target}
      />
      <StatCard
        label="Contributors paid"
        value={`${summary.paidPeople} of ${summary.activePeople}`}
        hint="Active contributors with a payment"
        icon={Users}
      />
      <StatCard
        label="Year balance"
        value={formatCurrency(summary.yearBalance)}
        hint={`Collected ${formatCurrency(
          summary.yearCollected
        )} - expenses ${formatCurrency(summary.yearExpenses)}`}
        icon={Wallet}
        tone={summary.yearBalance < 0 ? "destructive" : "success"}
      />
    </section>
  )
}
