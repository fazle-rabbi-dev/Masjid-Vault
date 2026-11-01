"use client"

import { useState } from "react"
import { AlertCircle, Loader2, UserPlus } from "lucide-react"

import { createMemberAction } from "@/app/actions/members"
import { MemberPermissionSelect } from "@/components/private/members/member-permission-select"
import { useMemberForm } from "@/components/private/members/use-member-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function AddMemberDialog() {
  const [open, setOpen] = useState(false)
  const form = useMemberForm(
    (formData) => createMemberAction(undefined, formData),
    () => setOpen(false)
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        <UserPlus className="size-4" />
        Add member
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add member</DialogTitle>
          <DialogDescription>
            Create a login for a mosque member. Share the username and password
            with them yourself.
          </DialogDescription>
        </DialogHeader>

        <form action={form.submit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="Full name"
              maxLength={60}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder="e.g. rahim.uddin"
              autoCapitalize="none"
              autoComplete="off"
              maxLength={30}
              required
            />
            <FieldDescription>
              Lowercase letters, numbers, dot, dash or underscore.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
              required
            />
            <FieldDescription>
              At least 6 characters. Only the admin can reset it later.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="permission">Permission</FieldLabel>
            <MemberPermissionSelect />
          </Field>

          {form.error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{form.error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.pending}>
              {form.pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
