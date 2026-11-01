"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth"
import { applyApprovalRequest } from "@/lib/approvals"
import { prisma } from "@/lib/db"
import { parseReviewNote } from "@/validations/approval"

export type ReviewState = { error: string } | { success: true } | undefined

// Approving touches real money records, so the admin is the only reviewer.
async function adminSession() {
  const session = await requireSession()
  return session.role === "ADMIN" ? session : null
}

const entityPaths: Record<string, string[]> = {
  CONTRIBUTION: ["/register", "/history", "/reports"],
  EXPENSE: ["/expenses", "/history", "/reports"],
  PERSON: ["/people", "/register"],
}

function revalidate(entity: string) {
  revalidatePath("/approvals")
  revalidatePath("/dashboard")

  for (const path of entityPaths[entity] ?? []) {
    revalidatePath(path)
  }
}

export async function approveRequestAction(requestId: string): Promise<ReviewState> {
  const session = await adminSession()
  if (!session) {
    return { error: "Only the admin can approve requests." }
  }

  if (!requestId) return { error: "Missing request." }

  const request = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
  })

  if (!request || request.status !== "PENDING") {
    return { error: "This request was already reviewed." }
  }

  // Claim the request first so a double click cannot apply the change twice.
  const claimed = await prisma.approvalRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: { status: "APPROVED", reviewedBy: session.id, reviewedAt: new Date() },
  })

  if (claimed.count === 0) {
    return { error: "This request was already reviewed." }
  }

  const applied = await applyApprovalRequest(request)

  if ("error" in applied) {
    // Hand the request back to the queue so the admin can still reject it.
    await prisma.approvalRequest.updateMany({
      where: { id: requestId, status: "APPROVED" },
      data: { status: "PENDING", reviewedBy: null, reviewedAt: null },
    })

    return { error: applied.error }
  }

  revalidate(request.entity)
  return { success: true }
}

export async function rejectRequestAction(
  _previousState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await adminSession()
  if (!session) {
    return { error: "Only the admin can reject requests." }
  }

  const requestId = String(formData.get("requestId") ?? "")
  if (!requestId) return { error: "Missing request." }

  const note = parseReviewNote(formData)
  if ("error" in note) return { error: note.error }

  const rejected = await prisma.approvalRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: {
      status: "REJECTED",
      reviewNote: note.value,
      reviewedBy: session.id,
      reviewedAt: new Date(),
    },
  })

  if (rejected.count === 0) {
    return { error: "This request was already reviewed." }
  }

  const request = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
    select: { entity: true },
  })

  revalidate(request?.entity ?? "")
  return { success: true }
}
