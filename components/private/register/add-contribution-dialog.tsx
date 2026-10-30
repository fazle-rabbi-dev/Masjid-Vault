"use client"

import { useActionState, useState } from "react"
import { AlertCircle, Loader2, Plus } from "lucide-react"

import { createContributionAction } from "@/app/actions/contributions"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { MONTHS } from "@/constants/register"
import { toDateInputValue } from "@/lib/format"
import type { PersonOption } from "@/types/register"

type AddContributionDialogProps = {
  people: PersonOption[]
  year: number
  month: number
}

export function AddContributionDialog({
  people,
  year,
  month,
}: AddContributionDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    createContributionAction,
    undefined
  )

  if (people.length === 0) {
    return (
      <Button disabled title="Add a contributor first">
        <Plus className="size-4" />
        Record contribution
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        <Plus className="size-4" />
        Record contribution
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record a contribution</DialogTitle>
          <DialogDescription>
            Add a payment to the monthly register.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personId">Contributor</Label>
            <NativeSelect
              id="personId"
              name="personId"
              className="w-full"
              defaultValue=""
              required
            >
              <NativeSelectOption value="" disabled>
                Select a person
              </NativeSelectOption>
              {people.map((person) => (
                <NativeSelectOption key={person.id} value={person.id}>
                  {person.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="collectionMonth">Collection month</Label>
              <NativeSelect
                id="collectionMonth"
                name="collectionMonth"
                className="w-full"
                defaultValue={String(month)}
                required
              >
                {MONTHS.map((item) => (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collectionYear">Year</Label>
              <Input
                id="collectionYear"
                name="collectionYear"
                type="number"
                min={2000}
                max={2100}
                defaultValue={year}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (BDT)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedAt">Received on</Label>
              <Input
                id="receivedAt"
                name="receivedAt"
                type="date"
                defaultValue={toDateInputValue(new Date())}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              name="note"
              rows={2}
              maxLength={500}
              placeholder="Cash, bKash, partial payment..."
            />
          </div>

          {state?.error ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
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
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save contribution"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
