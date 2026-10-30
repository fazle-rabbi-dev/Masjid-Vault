export const EXPENSE_CATEGORIES = [
  { value: "SALARY", label: "Salary" },
  { value: "UTILITY", label: "Utility" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "EVENT", label: "Event" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "OTHER", label: "Other" },
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"]

export function getCategoryLabel(value: string) {
  return (
    EXPENSE_CATEGORIES.find((item) => item.value === value)?.label ?? "Other"
  )
}
