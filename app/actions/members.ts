"use server"

import { revalidatePath } from "next/cache"

import { requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import {
  parseMemberCreate,
  parseMemberStatus,
  parseMemberUpdate,
  parsePasswordReset,
} from "@/validations/member"

export type MemberState = { error: string } | { success: true } | undefined

// Admin is the only one allowed to touch member accounts.
async function isAdmin() {
  const session = await requireSession()
  return session.role === "ADMIN"
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  )
}

export async function createMemberAction(
  _previousState: MemberState,
  formData: FormData
): Promise<MemberState> {
  if (!(await isAdmin())) {
    return { error: "Only the admin can create member accounts." }
  }

  const parsed = parseMemberCreate(formData)
  if ("error" in parsed) return { error: parsed.error }

  const { name, username, password, permission } = parsed.data

  try {
    await prisma.member.create({
      data: {
        name,
        username,
        passwordHash: hashPassword(password),
        permission,
      },
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "That username is already taken." }
    }
    throw error
  }

  revalidatePath("/members")
  return { success: true }
}

export async function updateMemberAction(
  _previousState: MemberState,
  formData: FormData
): Promise<MemberState> {
  if (!(await isAdmin())) {
    return { error: "Only the admin can edit member accounts." }
  }

  const memberId = String(formData.get("memberId") ?? "")
  if (!memberId) return { error: "Missing member." }

  const parsed = parseMemberUpdate(formData)
  if ("error" in parsed) return { error: parsed.error }

  try {
    await prisma.member.update({
      where: { id: memberId },
      data: parsed.data,
    })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "That username is already taken." }
    }
    throw error
  }

  revalidatePath("/members")
  return { success: true }
}

export async function resetMemberPasswordAction(
  _previousState: MemberState,
  formData: FormData
): Promise<MemberState> {
  if (!(await isAdmin())) {
    return { error: "Only the admin can reset member passwords." }
  }

  const memberId = String(formData.get("memberId") ?? "")
  if (!memberId) return { error: "Missing member." }

  const parsed = parsePasswordReset(formData)
  if ("error" in parsed) return { error: parsed.error }

  await prisma.member.update({
    where: { id: memberId },
    data: { passwordHash: hashPassword(parsed.data.password) },
  })

  revalidatePath("/members")
  return { success: true }
}

export async function setMemberStatusAction(
  memberId: string,
  status: string
): Promise<MemberState> {
  if (!(await isAdmin())) {
    return { error: "Only the admin can change member status." }
  }

  const parsed = parseMemberStatus(status)
  if (!parsed) return { error: "Invalid status." }

  await prisma.member.update({
    where: { id: memberId },
    data: { status: parsed },
  })

  revalidatePath("/members")
  return { success: true }
}
