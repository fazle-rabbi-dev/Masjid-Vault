"use client"

import { useState } from "react"
import { AlertCircle, Check, CheckCheck, Loader2, X } from "lucide-react"

import { approveRequestAction } from "@/app/actions/approvals"
import { ApprovalCard } from "@/components/private/approvals/approval-card"
import { RejectRequestDialog } from "@/components/private/approvals/reject-request-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ApprovalItem } from "@/types/approvals"

export function ApprovalsView({
  pending,
  history,
}: {
  pending: ApprovalItem[]
  history: ApprovalItem[]
}) {
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<ApprovalItem | null>(null)

  async function approve(item: ApprovalItem) {
    setBusyId(item.id)
    setError(null)

    const result = await approveRequestAction(item.id)

    if (result && "error" in result) setError(result.error)
    setBusyId(null)
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pending.length > 0 ? (
              <Badge variant="secondary">{pending.length}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 ? (
            <Empty className="bg-card ring-1 ring-foreground/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCheck className="size-4" />
                </EmptyMedia>
                <EmptyTitle>Nothing to review</EmptyTitle>
                <EmptyDescription>
                  Member submitted changes will show up here for your approval.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            pending.map((item) => (
              <ApprovalCard
                key={item.id}
                item={item}
                actions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => setRejecting(item)}
                    >
                      <X className="size-3.5" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => approve(item)}
                    >
                      {busyId === item.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      Approve
                    </Button>
                  </>
                }
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          {history.length === 0 ? (
            <Empty className="bg-card ring-1 ring-foreground/10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCheck className="size-4" />
                </EmptyMedia>
                <EmptyTitle>No history yet</EmptyTitle>
                <EmptyDescription>
                  Approved and rejected requests will be listed here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            history.map((item) => <ApprovalCard key={item.id} item={item} />)
          )}
        </TabsContent>
      </Tabs>

      <RejectRequestDialog
        key={rejecting?.id ?? "reject-none"}
        request={rejecting}
        onClose={() => setRejecting(null)}
      />
    </div>
  )
}
