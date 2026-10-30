"use client"

import { useActionState, useState } from "react"
import { AlertCircle, Loader2, Plus } from "lucide-react"

import { createExpenseAction } from "@/app/actions/expenses"
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
import { EXPENSE_CATEGORIES } from "@/constants/expenses"
import { toDateInputValue } from "@/lib/format"

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(
    createExpenseAction,
    undefined
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={buttonVariants()}>
        <Plus className="size-4" />
        Add expense
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>
            Record money spent from the mosque fund.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Imam salary, electricity bill..."
              maxLength={100}
              required
            />
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={toDateInputValue(new Date())}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <NativeSelect
              id="category"
              name="category"
              className="w-full"
              defaultValue="OTHER"
              required
            >
              {EXPENSE_CATEGORIES.map((item) => (
                <NativeSelectOption key={item.value} value={item.value}>
                  {item.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              name="note"
              rows={2}
              maxLength={500}
              placeholder="Details about this expense..."
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
                "Save expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
