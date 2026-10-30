"use client"

import { useRouter } from "next/navigation"
import { ArrowDownWideNarrow } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { MONTHS } from "@/constants/register"

type HistoryFiltersProps = {
  years: number[]
  year: number
  month: number | null
  type: "ALL" | "CONTRIBUTION" | "EXPENSE"
  current: { year: number; month: number }
}

export function HistoryFilters({
  years,
  year,
  month,
  type,
  current,
}: HistoryFiltersProps) {
  const router = useRouter()

  function update(next: Partial<{ year: number; month: number | null; type: string }>) {
    const params = new URLSearchParams()
    const nextYear = next.year !== undefined ? next.year : year
    const nextMonth = next.month !== undefined ? next.month : month
    const nextType = next.type !== undefined ? next.type : type

    if (nextYear !== current.year || nextMonth !== null) {
      params.set("year", String(nextYear))
    }
    if (nextMonth !== null) {
      params.set("month", String(nextMonth))
    }
    if (nextType !== "ALL") {
      params.set("type", nextType)
    }

    const query = params.toString()
    router.push(`/history${query ? `?${query}` : ""}`, { scroll: false })
  }

  const typeOptions = [
    { value: "ALL", label: "All transactions" },
    { value: "CONTRIBUTION", label: "Contributions" },
    { value: "EXPENSE", label: "Expenses" },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center gap-2">
        <ArrowDownWideNarrow className="size-4 text-muted-foreground" />
        <NativeSelect
          value={String(year)}
          onChange={(event) => update({ year: Number(event.target.value) })}
          aria-label="Filter by year"
        >
          {years.map((item) => (
            <NativeSelectOption key={item} value={item}>
              {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <NativeSelect
        value={month === null ? "" : String(month)}
        onChange={(event) => {
          const value = event.target.value
          update({ month: value === "" ? null : Number(value) })
        }}
        aria-label="Filter by month"
      >
        <NativeSelectOption value="">All months</NativeSelectOption>
        {MONTHS.map((item) => (
          <NativeSelectOption key={item.value} value={item.value}>
            {item.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <NativeSelect
        value={type}
        onChange={(event) => update({ type: event.target.value })}
        aria-label="Filter by type"
      >
        {typeOptions.map((item) => (
          <NativeSelectOption key={item.value} value={item.value}>
            {item.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      {(year !== current.year || month !== null || type !== "ALL") && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            update({ year: current.year, month: null, type: "ALL" })
          }
        >
          Reset
        </Button>
      )}

      <span className="ml-auto text-xs text-muted-foreground">
        Showing combined contribution and expense history
      </span>
    </div>
  )
}
