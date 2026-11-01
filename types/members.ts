import type { MemberPermission, MemberStatus } from "@/constants/auth"

// Shape passed from the server page to the client list. Never includes passwordHash.
export type MemberRow = {
  id: string
  name: string
  username: string
  permission: MemberPermission
  status: MemberStatus
  createdAt: Date
}
