"use server"

import { redirect } from "next/navigation"

import type { Role } from "@/constants/auth"
import { clearSession, createSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { env } from "@/lib/env"
import { verifyPassword } from "@/lib/password"

export type LoginState = { error: string } | undefined

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!username || !password) {
    return { error: "Username and password are required." }
  }

  // Admin credentials come from environment variables.
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    await createSession({ id: "admin", name: "Admin", role: "ADMIN" })
    redirect("/dashboard")
  }

  const member = await prisma.member.findUnique({ where: { username } })

  if (
    !member ||
    member.status !== "ACTIVE" ||
    !verifyPassword(password, member.passwordHash)
  ) {
    return { error: "Invalid username or password." }
  }

  await createSession({
    id: member.id,
    name: member.name,
    role: member.permission as Role,
  })
  redirect("/dashboard")
}

export async function logoutAction() {
  await clearSession()
  redirect("/")
}
