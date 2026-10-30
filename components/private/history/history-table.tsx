import { Receipt, HandCoins } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/format"
import { getMonthName } from "@/constants/register"
import type { HistoryTransaction } from "@/types/history"

type HistoryTableProps = {
  rows: HistoryTransaction[]
}

function TypeBadge({ type }: { type: HistoryTransaction["type"] }) {
  if (type === "CONTRIBUTION") {
    return (
      <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
        <HandCoins className="size-3" />
        Contribution
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
      <Receipt className="size-3" />
      Expense
    </Badge>
  )
}

export function HistoryTable({ rows }: HistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction history</CardTitle>
        <CardDescription>
          Complete record of money received and money spent.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {rows.length === 0 ? (
          <Empty className="mx-4 border-0 p-6">
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No transactions</EmptyTitle>
              <EmptyDescription>
                No contributions or expenses match the current filters.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.type}-${row.id}`}>
                  <TableCell className="pl-4">
                    <TypeBadge type={row.type} />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{row.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.type === "CONTRIBUTION"
                        ? row.collectionYear && row.collectionMonth
                          ? `${getMonthName(row.collectionMonth)} ${row.collectionYear} collection`
                          : "Contribution"
                        : row.category
                          ? row.category
                          : "Expense"}
                    </p>
                    {row.note ? (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                        {row.note}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(new Date(row.date))}
                  </TableCell>
                  <TableCell
                    className={
                      row.type === "CONTRIBUTION"
                        ? "text-right font-medium text-success"
                        : "text-right font-medium text-destructive"
                    }
                  >
                    {row.type === "CONTRIBUTION" ? "+" : "-"}
                    {formatCurrency(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
