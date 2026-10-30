import { createHmac, timingSafeEqual } from "node:crypto"

type JwtPayload = Record<string, unknown>

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url")
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function signature(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url")
}

export function signToken(payload: JwtPayload, secret: string) {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64UrlEncode(JSON.stringify(payload))
  const data = `${header}.${body}`

  return `${data}.${signature(data, secret)}`
}

export function verifyToken<T extends JwtPayload>(
  token: string | undefined,
  secret: string
): T | null {
  if (!token) return null

  const [header, body, tokenSignature] = token.split(".")
  if (!header || !body || !tokenSignature) return null

  const expected = signature(`${header}.${body}`, secret)
  const actual = Buffer.from(tokenSignature)
  const expectedBuffer = Buffer.from(expected)

  if (
    actual.length !== expectedBuffer.length ||
    !timingSafeEqual(actual, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as T

    if (typeof payload.exp !== "number" || payload.exp <= Date.now() / 1000) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
