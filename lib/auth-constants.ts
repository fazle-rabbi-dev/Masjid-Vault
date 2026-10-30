import { env } from "@/lib/env"

export const ACCESS_COOKIE = "access_token"
export const REFRESH_COOKIE = "refresh_token"

export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 35 // 35 days

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}
