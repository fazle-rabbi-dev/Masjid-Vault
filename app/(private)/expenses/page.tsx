import type { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"

import { AddExpenseDialog } from "@/components/private/expenses/add-expense-dialog"
import { ExpenseFilters } from "@/components/private/expenses/expense-filters"
import { ExpenseSummary } from "@/components/private/expenses/expense-summary"
import { ExpenseTable } from "@/components/private/expenses/expense-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { canWrite, requireSession } from "@/lib/auth"
import { formatMonth } from "@/lib/format"
import { getExpenseData } from "@/lib/expenses"
import { getCurrentCollectionMonth } from "@/lib/settings"

export const metadata: Metadata = {
  title: "Expenses | Masjid Vault",
  description: "Record and browse mosque fund expenses.",
}

const noticeMessages: Record<string, string> = {
  recorded: "Expense recorded.",
  updated: "Expense updated.",
  deleted: "Expense deleted.",
  submitted: "Request submitted for admin approval.",
}

type ExpensesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const session = await requireSession()
  const params = await searchParams
  const current = await getCurrentCollectionMonth()

  const requestedYear = Number(first(params.year))
  const requestedMonth = Number(first(params.month))

  const year =
    Number.isInteger(requestedYear) &&
    requestedYear >= 2000 &&
    requestedYear <= 2100
      ? requestedYear
      : current.year
  const month =
    Number.isInteger(requestedMonth) &&
    requestedMonth >= 1 &&
    requestedMonth <= 12
      ? requestedMonth
      : current.month

  const data = await getExpenseData(year, month)

  const monthLabel = formatMonth(year, month)
  const write = canWrite(session.role)
  const notice = noticeMessages[first(params.notice) ?? ""]

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="heading-2">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Record and browse money spent from the mosque fund.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!write ? <Badge variant="secondary">Read only</Badge> : null}
          {write ? <AddExpenseDialog /> : null}
        </div>
      </section>

      <ExpenseFilters
        years={data.years}
        year={year}
        month={month}
        current={current}
      />

      {notice ? (
        <Alert className="border-success/30 bg-success/5 text-success">
          <CheckCircle2 className="size-4" />
          <AlertDescription className="text-success">{notice}</AlertDescription>
        </Alert>
      ) : null}

      <ExpenseSummary summary={data.summary} monthLabel={monthLabel} />

      <ExpenseTable
        monthLabel={monthLabel}
        rows={data.rows}
        canWrite={write}
        needsApproval={write && session.role !== "ADMIN"}
      />
    </main>
  )
}
