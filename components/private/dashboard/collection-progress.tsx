import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/format"

type CollectionProgressProps = {
  monthLabel: string
  collected: number
  expected: number
  percent: number
  paid: number
  active: number
}

export function CollectionProgress({
  monthLabel,
  collected,
  expected,
  percent,
  paid,
  active,
}: CollectionProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly collection progress</CardTitle>
        <CardDescription>{monthLabel}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <p className="text-2xl font-semibold tracking-tight">
            {formatCurrency(collected)}
          </p>
          <p className="text-sm text-muted-foreground">
            of {formatCurrency(expected)} expected
          </p>
        </div>

        <Progress
          value={percent}
          aria-label={`${percent}% of expected collection received`}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {paid} of {active} contributors paid
          </span>
          <span className="font-medium">{percent}%</span>
        </div>
      </CardContent>
    </Card>
  )
}
