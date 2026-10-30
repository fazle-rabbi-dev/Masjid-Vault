import type { Metadata } from "next"
import { History } from "lucide-react"

import { HistoryFilters } from "@/components/private/history/history-filters"
import { HistorySummary } from "@/components/private/history/history-summary"
import { HistoryTable } from "@/components/private/history/history-table"
import { requireSession } from "@/lib/auth"
import { getHistoryData } from "@/lib/history"

export const metadata: Metadata = {
  title: "History | Masjid Vault",
  description: "Complete financial transaction history.",
}

type HistoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function HistoryPage({
  searchParams,
}: HistoryPageProps) {
  await requireSession()
  const params = await searchParams

  const requestedYear = Number(first(params.year))
  const requestedMonth = Number(first(params.month))
  const requestedType = first(params.type)

  const year =
    Number.isInteger(requestedYear) &&
    requestedYear >= 2000 &&
    requestedYear <= 2100
      ? requestedYear
      : null
  const month =
    Number.isInteger(requestedMonth) &&
    requestedMonth >= 1 &&
    requestedMonth <= 12
      ? requestedMonth
      : null
  const type =
    requestedType === "CONTRIBUTION" || requestedType === "EXPENSE"
      ? requestedType
      : "ALL"

  const data = await getHistoryData({ year, month, type })

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="space-y-1">
        <h1 className="heading-2">History</h1>
        <p className="text-sm text-muted-foreground">
          <History className="mr-1 inline size-4" />
          Complete financial transaction history.
        </p>
      </section>

      <HistoryFilters
        years={data.years}
        year={data.year}
        month={data.month}
        type={data.type}
        current={data.current}
      />

      <HistorySummary summary={data.summary} />

      <HistoryTable rows={data.rows} />
    </main>
  )
}
