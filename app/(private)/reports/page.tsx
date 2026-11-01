import type { Metadata } from "next"

import { ReportFilters } from "@/components/private/reports/report-filters"
import { ReportPreview } from "@/components/private/reports/report-preview"
import { requireSession } from "@/lib/auth"
import { formatMonth } from "@/lib/format"
import { getReportData } from "@/lib/reports"
import { getCurrentCollectionMonth } from "@/lib/settings"

export const metadata: Metadata = {
  title: "Reports | Masjid Vault",
  description: "Download monthly financial reports.",
}

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  await requireSession()
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

  const data = await getReportData(year, month)
  const monthLabel = formatMonth(year, month)

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <section className="space-y-1">
        <h1 className="heading-2">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Select a year and month, then download the monthly financial report.
        </p>
      </section>

      <div className="no-print">
        <ReportFilters
          years={data.years}
          year={year}
          month={month}
          current={current}
        />
      </div>

      <ReportPreview data={data} />

      <p className="text-center text-xs text-muted-foreground no-print">
        Preview: {monthLabel} report. Use Download PDF to print or save as PDF.
      </p>
    </main>
  )
}
