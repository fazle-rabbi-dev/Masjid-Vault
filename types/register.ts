export type PaymentStatus = "PAID" | "PARTIAL" | "UNPAID" | "INACTIVE"

export type RegisterPayment = {
  id: string
  amount: number
  receivedAt: string
  note: string | null
}

export type RegisterPerson = {
  id: string
  name: string
  monthlyAmount: number
  active: boolean
  paid: number
  status: PaymentStatus
  payments: RegisterPayment[]
}

export type RegisterSummary = {
  collected: number
  expected: number
  paidPeople: number
  activePeople: number
  yearCollected: number
  yearExpenses: number
  yearBalance: number
}

export type RegisterData = {
  year: number
  month: number
  years: number[]
  current: { year: number; month: number }
  rows: RegisterPerson[]
  summary: RegisterSummary
}

export type PersonOption = {
  id: string
  name: string
  monthlyAmount: number
}
