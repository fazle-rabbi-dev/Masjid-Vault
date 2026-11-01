"use client"

import { useState, useTransition } from "react"
import { AlertCircle, Loader2 } from "lucide-react"

import { rejectRequestAction } from "@/app/actions/approvals"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { ApprovalItem } from "@/types/approvals"

export function RejectRequestDialog({
  request,
  onClose,
}: {
  request: ApprovalItem | null
  onClose: () => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await rejectRequestAction(undefined, formData)

      if (result && "error" in result) {
        setError(result.error)
        return
      }

      onClose()
    })
  }

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject request</DialogTitle>
          <DialogDescription>
            {request ? `${request.memberName}'s request will be kept in history, but the record will not change.` : null}
          </DialogDescription>
        </DialogHeader>

        {request ? (
          <form action={submit} className="space-y-4">
            <input type="hidden" name="requestId" value={request.id} />

            <Field>
              <FieldLabel htmlFor="reviewNote">Reason (optional)</FieldLabel>
              <Textarea
                id="reviewNote"
                name="reviewNote"
                rows={3}
                maxLength={300}
                placeholder="Tell the member why this was rejected..."
              />
              <FieldDescription>
                The member cannot see this yet, it is saved for your records.
              </FieldDescription>
            </Field>

            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject request"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
