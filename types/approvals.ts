import type {
  ApprovalEntity,
  ApprovalOperation,
  ApprovalStatus,
} from "@/constants/approvals"

// One row of the previous/proposed comparison shown on a request card.
export type ApprovalChange = {
  label: string
  previous: string | null
  proposed: string | null
}

// Serialized request handed from the server page to the client view.
export type ApprovalItem = {
  id: string
  memberName: string
  entity: ApprovalEntity
  operation: ApprovalOperation
  status: ApprovalStatus
  target: string
  changes: ApprovalChange[]
  requestNote: string | null
  reviewNote: string | null
  requestedAt: string
  reviewedAt: string | null
}
