"use client"

import { AlertCircle, Loader2 } from "lucide-react"

import { updateMemberAction } from "@/app/actions/members"
import { MemberPermissionSelect } from "@/components/private/members/member-permission-select"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { MemberRow } from "@/types/members"

export function EditMemberDialog({
  member,
  onClose,
}: {
  member: MemberRow | null
  onClose: () => void
}) {
  const form = useMemberForm(
    (formData) => updateMemberAction(undefined, formData),
    onClose
  )

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit member</DialogTitle>
          <DialogDescription>
            Update the account details or change what this member can do.
          </DialogDescription>
        </DialogHeader>

        {member ? (
          <form action={form.submit} className="space-y-4">
            <input type="hidden" name="memberId" value={member.id} />

            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={member.name}
                maxLength={60}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                defaultValue={member.username}
                autoCapitalize="none"
                autoComplete="off"
                maxLength={30}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="permission">Permission</FieldLabel>
              <MemberPermissionSelect defaultValue={member.permission} />
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
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
