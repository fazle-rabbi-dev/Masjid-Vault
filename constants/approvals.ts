export const approvalEntities = ["CONTRIBUTION", "EXPENSE", "PERSON"] as const
export type ApprovalEntity = (typeof approvalEntities)[number]

export const approvalOperations = ["CREATE", "UPDATE", "DELETE"] as const
export type ApprovalOperation = (typeof approvalOperations)[number]

export const approvalStatuses = ["PENDING", "APPROVED", "REJECTED"] as const
export type ApprovalStatus = (typeof approvalStatuses)[number]

export const entityLabels: Record<ApprovalEntity, string> = {
  CONTRIBUTION: "Contribution",
  EXPENSE: "Expense",
  PERSON: "Contributor",
}

export const operationLabels: Record<ApprovalOperation, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
}

export const statusLabels: Record<ApprovalStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
}
