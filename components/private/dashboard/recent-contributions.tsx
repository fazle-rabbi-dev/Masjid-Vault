import { HandCoins } from "lucide-react"

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
import { formatCurrency, formatMonth, formatShortDate } from "@/lib/format"

type ContributionRow = {
  id: string
  amount: number
  collectionYear: number
  collectionMonth: number
  receivedAt: Date
  person: { name: string }
}

export function RecentContributions({ rows }: { rows: ContributionRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent contributions</CardTitle>
        <CardDescription>Latest payments received</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <Empty className="border-0 p-4">
            <EmptyMedia variant="icon">
              <HandCoins />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No contributions yet</EmptyTitle>
              <EmptyDescription>
                Recorded payments will appear here.
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
                  <p className="truncate text-sm font-medium">
                    {row.person.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMonth(row.collectionYear, row.collectionMonth)} -
                    received {formatShortDate(row.receivedAt)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-success">
                  +{formatCurrency(row.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
