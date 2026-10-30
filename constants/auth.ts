export type Role = "ADMIN" | "READ_ONLY" | "READ_WRITE"

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  READ_ONLY: "Read only",
  READ_WRITE: "Read + write",
}

export type SessionPayload = {
  sub: string
  name: string
  role: Role
  type: "access" | "refresh"
  iat: number
  exp: number
}

export type Session = {
  id: string
  name: string
  role: Role
}
