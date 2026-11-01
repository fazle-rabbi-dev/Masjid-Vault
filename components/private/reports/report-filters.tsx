"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { MONTHS } from "@/constants/register"

type ReportFiltersProps = {
  years: number[]
  year: number
  month: number
  current: { year: number; month: number }
}

export function ReportFilters({
  years,
  year,
  month,
  current,
}: ReportFiltersProps) {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)

  function go(nextYear: number, nextMonth: number) {
    router.push(`/reports?year=${nextYear}&month=${nextMonth}`, {
      scroll: false,
    })
  }

  async function handleDownload() {
    const element = document.getElementById("report-content")
    if (!element || downloading) return

    setDownloading(true)
    try {
      const html2pdf = (await import("html2pdf.js")).default
      await html2pdf()
        .set({
          margin: 10,
          filename: `masjid-fund-report-${year}-${String(month).padStart(2, "0")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            onclone: (clonedDoc: Document) => {
              clonedDoc.querySelectorAll("style, link[rel='stylesheet']").forEach((node) => node.remove())
              const style = clonedDoc.createElement("style")
              style.textContent = `
                body { margin: 0; background: #ffffff; color: #1a1a1a; font-family: system-ui, sans-serif; }
                .report-space { color: #1a1a1a; }
                .report-section { margin-top: 1.5rem; }
                .report-header { border-bottom: 1px solid #e5e5e5; padding-bottom: 1rem; text-align: center; }
                .report-title { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.025em; line-height: 1.15; color: #1a1a1a; }
                .report-subtitle { font-size: 1.125rem; font-weight: 500; color: #1a1a1a; }
                .report-heading { font-size: 1.125rem; font-weight: 500; letter-spacing: -0.025em; line-height: 1.25; color: #1a1a1a; }
                .report-muted { color: #6b6b6b; }
                .report-table { margin-top: 0.5rem; width: 100%; border-collapse: collapse; font-size: 0.875rem; }
                .report-table th, .report-table td { border: 1px solid #e5e5e5; padding: 0.5rem 0.75rem; text-align: left; }
                .report-table th { background-color: #f5f5f5; font-weight: 500; }
                .report-total-row { font-weight: 600; }
                .report-list { margin-top: 0.5rem; font-size: 0.875rem; }
                .report-list li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.25rem 0; }
                .report-footer { margin-top: 2rem; border-top: 1px solid #e5e5e5; padding-top: 1rem; text-align: center; font-size: 0.875rem; }
                .text-right { text-align: right; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .font-medium { font-weight: 500; }
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-3 { margin-bottom: 0.75rem; }
                .rounded-xl { border-radius: 0.75rem; }
                .bg-white { background-color: #ffffff; }
                .p-6 { padding: 1.5rem; }
              `
              clonedDoc.head.appendChild(style)
            },
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <NativeSelect
        value={String(year)}
        onChange={(event) => go(Number(event.target.value), month)}
        aria-label="Select year"
      >
        {years.map((item) => (
          <NativeSelectOption key={item} value={item}>
            {item}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <NativeSelect
        value={String(month)}
        onChange={(event) => go(year, Number(event.target.value))}
        aria-label="Select month"
      >
        {MONTHS.map((item) => (
          <NativeSelectOption key={item.value} value={item.value}>
            {item.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      {year === current.year && month === current.month ? null : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => go(current.year, current.month)}
        >
          Go to current month
        </Button>
      )}

      <Button onClick={handleDownload} disabled={downloading} className="ml-auto">
        {downloading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="size-4" />
            Download PDF
          </>
        )}
      </Button>
    </div>
  )
}
