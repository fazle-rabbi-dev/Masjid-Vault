import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import type { Role, Session, SessionPayload } from "@/constants/auth"
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
  cookieOptions,
} from "@/lib/auth-constants"
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

function toSession(payload: SessionPayload | null): Session | null {
  if (!payload || !roles.includes(payload.role)) return null

  return { id: payload.sub, name: payload.name, role: payload.role }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()

  const access = verifyToken<SessionPayload>(
    cookieStore.get(ACCESS_COOKIE)?.value,
    env.JWT_ACCESS_SECRET
  )
  if (access?.type === "access") return toSession(access)

  const refresh = verifyToken<SessionPayload>(
    cookieStore.get(REFRESH_COOKIE)?.value,
    env.JWT_REFRESH_SECRET
  )
  if (refresh?.type === "refresh") return toSession(refresh)

  return null
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) redirect("/")

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
