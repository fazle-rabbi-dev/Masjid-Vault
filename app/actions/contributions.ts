"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { canWrite, requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  parseContributionForm,
  parseContributionUpdate,
} from "@/validations/contribution"

export type ContributionState = { error: string } | undefined

function registerUrl(year: number, month: number, notice: string) {
  return `/register?year=${year}&month=${month}&notice=${notice}`
}

function snapshot(contribution: {
  personId: string
  collectionYear: number
  collectionMonth: number
  amount: number
  receivedAt: Date
  note: string | null
}) {
  return {
    personId: contribution.personId,
    collectionYear: contribution.collectionYear,
    collectionMonth: contribution.collectionMonth,
    amount: contribution.amount,
    receivedAt: contribution.receivedAt.toISOString(),
    note: contribution.note,
  }
}

export async function createContributionAction(
  _previousState: ContributionState,
  formData: FormData
): Promise<ContributionState> {
  const session = await requireSession()

  if (!canWrite(session.role)) {
    return { error: "You do not have permission to record contributions." }
  }

  const parsed = parseContributionForm(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { data } = parsed
  const person = await prisma.person.findUnique({
    where: { id: data.personId },
    select: { id: true, active: true },
  })

  if (!person) {
    return { error: "That contributor no longer exists." }
  }

  if (!person.active) {
    return { error: "This contributor is inactive and cannot receive new payments." }
  }

  if (session.role === "ADMIN") {
    await prisma.contribution.create({ data })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "CREATE",
        entity: "CONTRIBUTION",
        payload: {
          ...data,
          receivedAt: data.receivedAt.toISOString(),
        },
      },
    })
  }

  revalidatePath("/register")
  revalidatePath("/dashboard")
  redirect(
    registerUrl(data.collectionYear, data.collectionMonth, session.role === "ADMIN" ? "recorded" : "submitted")
  )
}

export async function updateContributionAction(
  _previousState: ContributionState,
  formData: FormData
): Promise<ContributionState> {
  const session = await requireSession()

  if (!canWrite(session.role)) {
    return { error: "You do not have permission to edit contributions." }
  }

  const contributionId = String(formData.get("contributionId") ?? "")
  if (!contributionId) return { error: "Missing contribution." }

  const parsed = parseContributionUpdate(formData)
  if ("error" in parsed) return { error: parsed.error }

  const existing = await prisma.contribution.findUnique({
    where: { id: contributionId },
  })

  if (!existing) return { error: "That contribution no longer exists." }

  if (session.role === "ADMIN") {
    await prisma.contribution.update({
      where: { id: contributionId },
      data: parsed.data,
    })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "UPDATE",
        entity: "CONTRIBUTION",
        entityId: contributionId,
        payload: {
          ...parsed.data,
          receivedAt: parsed.data.receivedAt.toISOString(),
        },
        previous: snapshot(existing),
      },
    })
  }

  revalidatePath("/register")
  revalidatePath("/dashboard")
  redirect(
    registerUrl(
      existing.collectionYear,
      existing.collectionMonth,
      session.role === "ADMIN" ? "updated" : "submitted"
    )
  )
}

export async function deleteContributionAction(formData: FormData) {
  const session = await requireSession()

  if (!canWrite(session.role)) {
    redirect("/register")
  }

  const contributionId = String(formData.get("contributionId") ?? "")
  if (!contributionId) redirect("/register")

  const existing = await prisma.contribution.findUnique({
    where: { id: contributionId },
  })

  if (existing) {
    if (session.role === "ADMIN") {
      await prisma.contribution.delete({ where: { id: contributionId } })
    } else {
      await prisma.approvalRequest.create({
        data: {
          memberId: session.id,
          operation: "DELETE",
          entity: "CONTRIBUTION",
          entityId: contributionId,
          previous: snapshot(existing),
        },
      })
    }
  }

  revalidatePath("/register")
  revalidatePath("/dashboard")

  if (!existing) redirect("/register")

  redirect(
    registerUrl(
      existing.collectionYear,
      existing.collectionMonth,
      session.role === "ADMIN" ? "deleted" : "submitted"
    )
  )
}
