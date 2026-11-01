export type ReportContribution = {
  personName: string
  amount: number
  receivedAt: string
  note: string | null
}

export type ReportPerson = {
  id: string
  name: string
  monthlyAmount: number
  active: boolean
  paid: number
  payments: ReportContribution[]
}

export type ReportExpense = {
  id: string
  title: string
  amount: number
  date: string
  category: string
  note: string | null
}

export type ReportData = {
  year: number
  month: number
  years: number[]
  current: { year: number; month: number }
  people: ReportPerson[]
  expenses: ReportExpense[]
  collected: number
  expected: number
  paidPeople: number
  activePeople: number
  expenseTotal: number
  balance: number
  firstReceivedAt: string | null
  lastReceivedAt: string | null
}
