"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { canWrite, requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  parseExpenseForm,
  parseExpenseUpdate,
} from "@/validations/expense"

export type ExpenseState = { error: string } | undefined

function expensesUrl(year: number, month: number, notice: string) {
  return `/expenses?year=${year}&month=${month}&notice=${notice}`
}

function snapshot(expense: {
  title: string
  amount: number
  date: Date
  category: string
  note: string | null
}) {
  return {
    title: expense.title,
    amount: expense.amount,
    date: expense.date.toISOString(),
    category: expense.category,
    note: expense.note,
  }
}

export async function createExpenseAction(
  _previousState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const session = await requireSession()

  if (!canWrite(session.role)) {
    return { error: "You do not have permission to record expenses." }
  }

  const parsed = parseExpenseForm(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { data } = parsed

  if (session.role === "ADMIN") {
    await prisma.expense.create({ data })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "CREATE",
        entity: "EXPENSE",
        payload: { ...data, date: data.date.toISOString() },
      },
    })
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  redirect(
    expensesUrl(
      data.date.getFullYear(),
      data.date.getMonth() + 1,
      session.role === "ADMIN" ? "recorded" : "submitted"
    )
  )
}

export async function updateExpenseAction(
  _previousState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const session = await requireSession()

  if (!canWrite(session.role)) {
    return { error: "You do not have permission to edit expenses." }
  }

  const expenseId = String(formData.get("expenseId") ?? "")
  if (!expenseId) return { error: "Missing expense." }

  const parsed = parseExpenseUpdate(formData)
  if ("error" in parsed) return { error: parsed.error }

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
  })

  if (!existing) return { error: "That expense no longer exists." }

  if (session.role === "ADMIN") {
    await prisma.expense.update({
      where: { id: expenseId },
      data: parsed.data,
    })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "UPDATE",
        entity: "EXPENSE",
        entityId: expenseId,
        payload: { ...parsed.data, date: parsed.data.date.toISOString() },
        previous: snapshot(existing),
      },
    })
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  redirect(
    expensesUrl(
      existing.date.getFullYear(),
      existing.date.getMonth() + 1,
      session.role === "ADMIN" ? "updated" : "submitted"
    )
  )
}

export async function deleteExpenseAction(formData: FormData) {
  const session = await requireSession()

  if (!canWrite(session.role)) {
    redirect("/expenses")
  }

  const expenseId = String(formData.get("expenseId") ?? "")
  if (!expenseId) redirect("/expenses")

  const existing = await prisma.expense.findUnique({
    where: { id: expenseId },
  })

  if (existing) {
    if (session.role === "ADMIN") {
      await prisma.expense.delete({ where: { id: expenseId } })
    } else {
      await prisma.approvalRequest.create({
        data: {
          memberId: session.id,
          operation: "DELETE",
          entity: "EXPENSE",
          entityId: expenseId,
          previous: snapshot(existing),
        },
      })
    }
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")

  if (!existing) redirect("/expenses")

  redirect(
    expensesUrl(
      existing.date.getFullYear(),
      existing.date.getMonth() + 1,
      session.role === "ADMIN" ? "deleted" : "submitted"
    )
  )
}
