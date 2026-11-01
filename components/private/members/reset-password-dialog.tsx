"use client"

import { AlertCircle, Loader2 } from "lucide-react"

import { resetMemberPasswordAction } from "@/app/actions/members"
import { useMemberForm } from "@/components/private/members/use-member-form"
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
import { Input } from "@/components/ui/input"
import type { MemberRow } from "@/types/members"

export function ResetPasswordDialog({
  member,
  onClose,
}: {
  member: MemberRow | null
  onClose: () => void
}) {
  const form = useMemberForm(
    (formData) => resetMemberPasswordAction(undefined, formData),
    onClose
  )

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {member?.name}. Tell them the new password
            yourself, their old one stops working immediately.
          </DialogDescription>
        </DialogHeader>

        {member ? (
          <form action={form.submit} className="space-y-4">
            <input type="hidden" name="memberId" value={member.id} />

            <Field>
              <FieldLabel htmlFor="password">New password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                required
              />
              <FieldDescription>At least 6 characters.</FieldDescription>
            </Field>

            {form.error ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{form.error}</AlertDescription>
              </Alert>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.pending}>
                {form.pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
