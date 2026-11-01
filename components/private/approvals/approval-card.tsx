import {
  entityLabels,
  operationLabels,
  statusLabels,
  type ApprovalOperation,
} from "@/constants/approvals"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format"
import type { ApprovalItem } from "@/types/approvals"
import { cn } from "@/lib/utils"

const operationTone: Record<ApprovalOperation, string> = {
  CREATE: "text-success",
  UPDATE: "text-foreground",
  DELETE: "text-destructive",
}

export function ApprovalCard({
  item,
  actions,
}: {
  item: ApprovalItem
  actions?: React.ReactNode
}) {
  const isPending = item.status === "PENDING"

  return (
    <article className="animate-in space-y-3 rounded-xl bg-card p-4 fade-in-0 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex-center flex-wrap gap-1.5">
            <Badge variant="outline">{entityLabels[item.entity]}</Badge>
            <Badge variant="secondary" className={operationTone[item.operation]}>
              {operationLabels[item.operation]}
            </Badge>
            {!isPending ? (
              <Badge variant={item.status === "APPROVED" ? "default" : "destructive"}>
                {statusLabels[item.status]}
              </Badge>
            ) : null}
          </div>

          <p className="heading-5">{item.target}</p>
          <p className="text-xs text-muted-foreground">
            {item.memberName} ·{" "}
            {formatDateTime(
              new Date(isPending ? item.requestedAt : (item.reviewedAt ?? item.requestedAt))
            )}
          </p>
        </div>

        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>

      {item.changes.length > 0 ? (
        <dl className="divide-y divide-foreground/10 rounded-lg bg-muted/40 px-3">
          {item.changes.map((change) => (
            <div
              key={change.label}
              className="flex flex-wrap items-baseline justify-between gap-2 py-1.5"
            >
              <dt className="text-xs text-muted-foreground">{change.label}</dt>
              <dd className="text-sm">
                {change.previous ? (
                  <span className="text-muted-foreground line-through">
                    {change.previous}
                  </span>
                ) : null}
                {change.previous && change.proposed ? (
                  <span className="px-1.5 text-muted-foreground">-&gt;</span>
                ) : null}
                {change.proposed ? (
                  <span className="font-medium">{change.proposed}</span>
                ) : (
                  <span className={cn("font-medium", change.previous ? "text-destructive" : "")}>
                    {change.previous ? "removed" : "-"}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {item.requestNote ? (
        <p className="rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">
          Member note: {item.requestNote}
        </p>
      ) : null}

      {item.reviewNote ? (
        <p className="text-xs text-muted-foreground">Review note: {item.reviewNote}</p>
      ) : null}
    </article>
  )
}
