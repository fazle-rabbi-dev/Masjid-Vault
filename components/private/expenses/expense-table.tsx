"use client"

import { useActionState, useState } from "react"
import {
  AlertCircle,
  Eye,
  Loader2,
  Pencil,
  Receipt,
  Trash2,
} from "lucide-react"

import {
  deleteExpenseAction,
  updateExpenseAction,
} from "@/app/actions/expenses"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { EXPENSE_CATEGORIES, getCategoryLabel } from "@/constants/expenses"
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format"
import type { ExpenseRow } from "@/types/expenses"

type ExpenseTableProps = {
  monthLabel: string
  rows: ExpenseRow[]
  canWrite: boolean
  needsApproval: boolean
}

export function ExpenseTable({
  monthLabel,
  rows,
  canWrite,
  needsApproval,
}: ExpenseTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(
    updateExpenseAction,
    undefined
  )

  const selected = rows.find((row) => row.id === selectedId) ?? null
  const editingExpense =
    rows.find((row) => row.id === editingId) ?? null

  function closeDetails() {
    setSelectedId(null)
    setEditingId(null)
    setDeletingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{monthLabel} expenses</CardTitle>
        <CardDescription>
          Money spent from the mosque fund during this month.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {rows.length === 0 ? (
          <Empty className="mx-4 border-0 p-6">
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription>
                Recorded expenses for this month will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4">
                    <p className="font-medium">{row.title}</p>
                    {row.note ? (
                      <p className="max-w-xs truncate text-xs text-muted-foreground">
                        {row.note}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getCategoryLabel(row.category)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(new Date(row.date))}
                  </TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    -{formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {canWrite ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit expense"
                          onClick={() => {
                            setSelectedId(row.id)
                            setEditingId(row.id)
                            setDeletingId(null)
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Delete expense"
                          onClick={() => {
                            setSelectedId(row.id)
                            setDeletingId(row.id)
                            setEditingId(null)
                          }}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="View expense"
                        onClick={() => {
                          setSelectedId(row.id)
                          setEditingId(null)
                          setDeletingId(null)
                        }}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) closeDetails()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              {selected
                ? `${getCategoryLabel(selected.category)} - ${formatCurrency(
                    selected.amount
                  )}`
                : null}
            </DialogDescription>
          </DialogHeader>

          {selected && editingExpense ? (
            <form action={formAction} className="space-y-3">
              <input
                type="hidden"
                name="expenseId"
                value={editingExpense.id}
              />

              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingExpense.title}
                  maxLength={100}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount (BDT)</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    defaultValue={editingExpense.amount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    defaultValue={toDateInputValue(
                      new Date(editingExpense.date)
                    )}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <NativeSelect
                  id="edit-category"
                  name="category"
                  className="w-full"
                  defaultValue={editingExpense.category}
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
                <Label htmlFor="edit-note">Note (optional)</Label>
                <Textarea
                  id="edit-note"
                  name="note"
                  rows={2}
                  maxLength={500}
                  defaultValue={editingExpense.note ?? ""}
                />
              </div>

              {state?.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : selected ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold text-destructive">
                    -{formatCurrency(selected.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(new Date(selected.date))} -{" "}
                    {getCategoryLabel(selected.category)}
                  </p>
                </div>
              </div>

              {selected.note ? (
                <p className="rounded-lg bg-muted p-3 text-sm">
                  {selected.note}
                </p>
              ) : null}

              {deletingId === selected.id ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <p className="text-xs">
                    {needsApproval
                      ? "Submit a delete request? The admin must approve it before the record is removed."
                      : "Delete this expense? This cannot be undone."}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <form action={deleteExpenseAction}>
                      <input
                        type="hidden"
                        name="expenseId"
                        value={selected.id}
                      />
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                      >
                        Confirm delete
                      </Button>
                    </form>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {needsApproval ? (
            <p className="text-xs text-muted-foreground">
              Editing or deleting an expense submits a request for admin
              approval.
            </p>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={closeDetails}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
