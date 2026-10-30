"use client"

import { useActionState, useState } from "react"
import {
  AlertCircle,
  Eye,
  HandCoins,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"

import {
  deleteContributionAction,
  updateContributionAction,
} from "@/app/actions/contributions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDate, toDateInputValue } from "@/lib/format"
import type { PaymentStatus, RegisterPerson } from "@/types/register"

const statusLabels: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
  INACTIVE: "Inactive",
}

const statusClasses: Record<PaymentStatus, string> = {
  PAID: "border-success/30 bg-success/10 text-success",
  PARTIAL: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  UNPAID: "border-destructive/30 bg-destructive/10 text-destructive",
  INACTIVE: "border-border text-muted-foreground",
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant="outline" className={statusClasses[status]}>
      {statusLabels[status]}
    </Badge>
  )
}

type RegisterTableProps = {
  monthLabel: string
  rows: RegisterPerson[]
  canWrite: boolean
  needsApproval: boolean
}

export function RegisterTable({
  monthLabel,
  rows,
  canWrite,
  needsApproval,
}: RegisterTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(
    updateContributionAction,
    undefined
  )

  const selected = rows.find((row) => row.id === selectedId) ?? null
  const editingPayment =
    selected?.payments.find((payment) => payment.id === editingId) ?? null

  function closeDetails() {
    setSelectedId(null)
    setEditingId(null)
    setDeletingId(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{monthLabel} register</CardTitle>
        <CardDescription>
          Payments assigned to this collection month. Unpaid rows are not counted
          in the collected total.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        {rows.length === 0 ? (
          <Empty className="mx-4 border-0 p-6">
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No contributors yet</EmptyTitle>
              <EmptyDescription>
                Add contributors from the People page before recording payments.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Contributor</TableHead>
                <TableHead className="text-right">Promised</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Payments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4">
                    <p className="font-medium">{row.name}</p>
                    {!row.active ? (
                      <p className="text-xs text-muted-foreground">Inactive</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.monthlyAmount > 0
                      ? formatCurrency(row.monthlyAmount)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {row.paid > 0 ? formatCurrency(row.paid) : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {row.payments.length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedId(row.id)
                          setEditingId(null)
                          setDeletingId(null)
                        }}
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">
                          {row.payments.length}
                        </span>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
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
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {monthLabel} - {formatCurrency(selected?.paid ?? 0)} received
            </DialogDescription>
          </DialogHeader>

          {selected && selected.payments.length > 0 ? (
            <ul className="divide-y">
              {selected.payments.map((payment) => (
                <li key={payment.id} className="space-y-2 py-3 first:pt-0">
                  {editingId === payment.id && editingPayment ? (
                    <form action={formAction} className="space-y-3">
                      <input
                        type="hidden"
                        name="contributionId"
                        value={payment.id}
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`amount-${payment.id}`}>
                            Amount (BDT)
                          </Label>
                          <Input
                            id={`amount-${payment.id}`}
                            name="amount"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            defaultValue={payment.amount}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`receivedAt-${payment.id}`}>
                            Received on
                          </Label>
                          <Input
                            id={`receivedAt-${payment.id}`}
                            name="receivedAt"
                            type="date"
                            defaultValue={toDateInputValue(
                              new Date(payment.receivedAt)
                            )}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`note-${payment.id}`}>
                          Note (optional)
                        </Label>
                        <Textarea
                          id={`note-${payment.id}`}
                          name="note"
                          rows={2}
                          maxLength={500}
                          defaultValue={payment.note ?? ""}
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
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Received {formatDate(new Date(payment.receivedAt))}
                          </p>
                          {payment.note ? (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {payment.note}
                            </p>
                          ) : null}
                        </div>

                        {canWrite ? (
                          <div className="flex shrink-0 gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Edit payment"
                              onClick={() => {
                                setEditingId(payment.id)
                                setDeletingId(null)
                              }}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Delete payment"
                              onClick={() => {
                                setDeletingId(payment.id)
                                setEditingId(null)
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        ) : null}
                      </div>

                      {deletingId === payment.id ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                          <p className="text-xs">
                            {needsApproval
                              ? "Submit a delete request? The admin must approve it before the record is removed."
                              : "Delete this payment? This cannot be undone."}
                          </p>
                          <div className="mt-2 flex gap-2">
                            <form action={deleteContributionAction}>
                              <input
                                type="hidden"
                                name="contributionId"
                                value={payment.id}
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
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty className="border-0 p-4">
              <EmptyMedia variant="icon">
                <HandCoins />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No payments</EmptyTitle>
                <EmptyDescription>
                  This contributor has no payment in this month.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {needsApproval ? (
            <p className="text-xs text-muted-foreground">
              Editing or deleting a payment submits a request for admin approval.
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
