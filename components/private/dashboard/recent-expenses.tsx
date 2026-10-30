import { Receipt } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatCurrency, formatShortDate } from "@/lib/format"

type ExpenseRow = {
  id: string
  title: string
  category: string
  amount: number
  date: Date
}

export function RecentExpenses({ rows }: { rows: ExpenseRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent expenses</CardTitle>
        <CardDescription>Latest money spent</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <Empty className="border-0 p-4">
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription>
                Recorded expenses will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.category} - {formatShortDate(row.date)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-destructive">
                  -{formatCurrency(row.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
