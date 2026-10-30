"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { MONTHS, getMonthShortName } from "@/constants/register"
import { cn } from "@/lib/utils"

type ExpenseFiltersProps = {
  years: number[]
  year: number
  month: number
  current: { year: number; month: number }
}

export function ExpenseFilters({
  years,
  year,
  month,
  current,
}: ExpenseFiltersProps) {
  const router = useRouter()

  function go(nextYear: number, nextMonth = month) {
    router.push(`/expenses?year=${nextYear}&month=${nextMonth}`, {
      scroll: false,
    })
  }

  return (
    <div className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous year"
            disabled={year <= 2000}
            onClick={() => go(year - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <NativeSelect
            value={String(year)}
            onChange={(event) => go(Number(event.target.value))}
            aria-label="Select year"
          >
            {years.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next year"
            disabled={year >= current.year}
            onClick={() => go(year + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>

          {year === current.year && month === current.month ? (
            <Badge variant="secondary">Current month</Badge>
          ) : null}
        </div>

        {year !== current.year || month !== current.month ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go(current.year, current.month)}
          >
            Go to current month
          </Button>
        ) : null}
      </div>

      <nav
        aria-label="Expense month"
        className="grid grid-cols-6 gap-1 overflow-x-auto sm:flex sm:flex-nowrap sm:gap-1"
      >
        {MONTHS.map((item) => {
          const isSelected = item.value === month
          const isCurrent =
            item.value === current.month && year === current.year

          return (
            <Link
              key={item.value}
              href={`/expenses?year=${year}&month=${item.value}`}
              scroll={false}
              aria-current={isCurrent ? "date" : undefined}
              title={item.label}
              className={cn(
                buttonVariants({
                  variant: isSelected ? "default" : "ghost",
                  size: "sm",
                }),
                "w-full sm:w-auto px-1 shrink-0",
                isCurrent && !isSelected && "ring-1 ring-primary/50"
              )}
            >
              <span className="sm:hidden">{getMonthShortName(item.value)}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
