import type { Metadata } from "next"
import {
  CalendarDays,
  CheckCheck,
  HandCoins,
  Receipt,
  Wallet,
} from "lucide-react"

import { CollectionProgress } from "@/components/private/dashboard/collection-progress"
import { QuickActions } from "@/components/private/dashboard/quick-actions"
import { RecentContributions } from "@/components/private/dashboard/recent-contributions"
import { RecentExpenses } from "@/components/private/dashboard/recent-expenses"
import { StatCard } from "@/components/private/dashboard/stat-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { requireSession } from "@/lib/auth"
import { getDashboardData } from "@/lib/dashboard"
import { formatCurrency, formatMonth } from "@/lib/format"

export const metadata: Metadata = {
  title: "Dashboard | Masjid Vault",
  description: "Financial overview of the mosque fund.",
}

export default async function DashboardPage() {
  const session = await requireSession()
  const data = await getDashboardData(session.role)
  const monthLabel = formatMonth(data.month.year, data.month.month)

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Assalamu alaikum, {session.name}
          </p>
          <h1 className="heading-2">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            An overview of the mosque fund for {monthLabel}.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1.5 py-1">
          <CalendarDays className="size-3.5" />
          {monthLabel}
        </Badge>
      </section>

      <section
        aria-label="Financial overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Available balance"
          value={formatCurrency(data.totals.balance)}
          hint="Collected minus expenses"
          icon={Wallet}
          tone={data.totals.balance < 0 ? "destructive" : "success"}
        />
        <StatCard
          label="Total collected"
          value={formatCurrency(data.totals.collected)}
          hint={`${data.people.active} active contributors`}
          icon={HandCoins}
          tone="success"
        />
        <StatCard
          label="Total expenses"
          value={formatCurrency(data.totals.expenses)}
          hint="All recorded spending"
          icon={Receipt}
          tone="destructive"
        />
        <StatCard
          label="This month"
          value={formatCurrency(data.totals.monthCollection)}
          hint={`Expenses: ${formatCurrency(data.totals.monthExpenses)}`}
          icon={CalendarDays}
        />
      </section>

      {session.role === "ADMIN" && data.pendingApprovals > 0 ? (
        <Alert>
          <CheckCheck className="size-4" />
          <AlertTitle>
            {data.pendingApprovals} pending{" "}
            {data.pendingApprovals === 1 ? "request" : "requests"}
          </AlertTitle>
          <AlertDescription>
            Member submitted changes waiting for your review. The approvals page
            is coming in a later step.
          </AlertDescription>
        </Alert>
      ) : null}

      <section
        aria-label="Collection details"
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <CollectionProgress
            monthLabel={monthLabel}
            collected={data.progress.collected}
            expected={data.progress.expected}
            percent={data.progress.percent}
            paid={data.people.paid}
            active={data.people.active}
          />
        </div>
        <QuickActions />

        <div className="lg:col-span-2">
          <RecentContributions rows={data.recentContributions} />
        </div>
        <RecentExpenses rows={data.recentExpenses} />
      </section>
    </main>
  )
}
