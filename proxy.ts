import { NextResponse, type NextRequest } from "next/server"

import type { SessionPayload } from "@/constants/auth"
import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_COOKIE,
  cookieOptions,
} from "@/lib/auth-constants"
import { env } from "@/lib/env"
import { signToken, verifyToken } from "@/lib/jwt"

function getAccessPayload(request: NextRequest) {
  const access = verifyToken<SessionPayload>(
    request.cookies.get(ACCESS_COOKIE)?.value,
    env.JWT_ACCESS_SECRET
  )
  if (access?.type === "access") return access

  return null
}

function getRefreshPayload(request: NextRequest) {
  const refresh = verifyToken<SessionPayload>(
    request.cookies.get(REFRESH_COOKIE)?.value,
    env.JWT_REFRESH_SECRET
  )
  if (refresh?.type === "refresh") return refresh

  return null
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === "/"

  const access = getAccessPayload(request)
  const session = access ?? getRefreshPayload(request)

  // Not logged in: only the login page is reachable.
  if (!session) {
    if (isLoginPage) return NextResponse.next()

    return NextResponse.redirect(new URL("/", request.url))
  }

  // Logged in users should not see the login page.
  if (isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Access token expired but refresh token is valid: issue a fresh access token.
  if (!access) {
    const now = Math.floor(Date.now() / 1000)
    const accessToken = signToken(
      {
        sub: session.sub,
        name: session.name,
        role: session.role,
        type: "access",
        iat: now,
        exp: now + ACCESS_TOKEN_MAX_AGE,
      },
      env.JWT_ACCESS_SECRET
    )

    const response = NextResponse.next()
    response.cookies.set(ACCESS_COOKIE, accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    })

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
