export type Role = "ADMIN" | "READ_ONLY" | "READ_WRITE"

// Permissions the admin can assign to member accounts. Admin itself is env-only.
export type MemberPermission = Exclude<Role, "ADMIN">

export const memberPermissions: MemberPermission[] = ["READ_ONLY", "READ_WRITE"]

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  READ_ONLY: "Read only",
  READ_WRITE: "Read + write",
}

export const memberStatuses = ["ACTIVE", "INACTIVE"] as const

export type MemberStatus = (typeof memberStatuses)[number]

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
