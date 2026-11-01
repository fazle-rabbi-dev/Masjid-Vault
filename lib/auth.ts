import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import type {
  MemberPermission,
  Role,
  Session,
  SessionPayload,
} from "@/constants/auth"
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  cookieOptions,
} from "@/lib/auth-constants"
import { prisma } from "@/lib/db"
import { env } from "@/lib/env"
import { signToken, verifyToken } from "@/lib/jwt"

const roles: Role[] = ["ADMIN", "READ_ONLY", "READ_WRITE"]

function createPayload(
  session: Session,
  type: SessionPayload["type"],
  maxAge: number
): SessionPayload {
  const now = Math.floor(Date.now() / 1000)

  return {
    sub: session.id,
    name: session.name,
    role: session.role,
    type,
    iat: now,
    exp: now + maxAge,
  }
}

export async function createSession(session: Session) {
  const accessToken = signToken(
    createPayload(session, "access", ACCESS_TOKEN_MAX_AGE),
    env.JWT_ACCESS_SECRET
  )
  const refreshToken = signToken(
    createPayload(session, "refresh", REFRESH_TOKEN_MAX_AGE),
    env.JWT_REFRESH_SECRET
  )

  const cookieStore = await cookies()

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })
}

// The admin lives in env vars, never in the database.
const ADMIN_ID = "admin"

function isAdminId(id: string) {
  return id === ADMIN_ID
}

// Member roles/status are re-read from the database so deactivating a member or
// changing their permission takes effect immediately, not after the token expires.
async function resolveSession(
  payload: SessionPayload | null
): Promise<Session | null> {
  if (!payload) return null

  if (isAdminId(payload.sub)) {
    return payload.role === "ADMIN"
      ? { id: ADMIN_ID, name: "Admin", role: "ADMIN" }
      : null
  }

  const member = await prisma.member.findUnique({ where: { id: payload.sub } })
  if (!member || member.status !== "ACTIVE") return null
  if (!roles.includes(member.permission as Role)) return null

  return {
    id: member.id,
    name: member.name,
    role: member.permission as MemberPermission,
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()

  const access = verifyToken<SessionPayload>(
    cookieStore.get(ACCESS_COOKIE)?.value,
    env.JWT_ACCESS_SECRET
  )
  if (access?.type === "access") return resolveSession(access)

  const refresh = verifyToken<SessionPayload>(
    cookieStore.get(REFRESH_COOKIE)?.value,
    env.JWT_REFRESH_SECRET
  )
  if (refresh?.type === "refresh") return resolveSession(refresh)

  return null
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  // Go through a route handler so stale cookies get cleared before redirecting.
  // Redirecting straight to "/" would bounce back here while the cookie lives.
  if (!session) redirect("/session/expired")

  return session
}

export async function clearSession() {
  const cookieStore = await cookies()

  cookieStore.delete(ACCESS_COOKIE)
  cookieStore.delete(REFRESH_COOKIE)
}

export function canWrite(role: Role) {
  return role === "ADMIN" || role === "READ_WRITE"
}
