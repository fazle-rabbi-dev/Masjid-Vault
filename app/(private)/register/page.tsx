import type { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"

import { AddContributionDialog } from "@/components/private/register/add-contribution-dialog"
import { RegisterFilters } from "@/components/private/register/register-filters"
import { RegisterSummary } from "@/components/private/register/register-summary"
import { RegisterTable } from "@/components/private/register/register-table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { canWrite, requireSession } from "@/lib/auth"
import { formatMonth } from "@/lib/format"
import { getPersonOptions, getRegisterData } from "@/lib/register"
import { getCurrentCollectionMonth } from "@/lib/settings"

export const metadata: Metadata = {
  title: "Collection register | Masjid Vault",
  description: "Browse and manage the mosque's monthly contribution register.",
}

const noticeMessages: Record<string, string> = {
  recorded: "Contribution recorded.",
  updated: "Contribution updated.",
  deleted: "Contribution deleted.",
  submitted: "Request submitted for admin approval.",
}

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
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

  const [data, people] = await Promise.all([
    getRegisterData(year, month),
    getPersonOptions(),
  ])

  const monthLabel = formatMonth(year, month)
  const write = canWrite(session.role)
  const notice = noticeMessages[first(params.notice) ?? ""]

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="heading-2">Collection register</h1>
          <p className="text-sm text-muted-foreground">
            Browse year-wise monthly registers and record payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!write ? <Badge variant="secondary">Read only</Badge> : null}
          {write ? (
            <AddContributionDialog people={people} year={year} month={month} />
          ) : null}
        </div>
      </section>

      <RegisterFilters
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

      <RegisterSummary summary={data.summary} monthLabel={monthLabel} />

      <RegisterTable
        monthLabel={monthLabel}
        rows={data.rows}
        canWrite={write}
        needsApproval={write && session.role !== "ADMIN"}
      />
    </main>
  )
}
