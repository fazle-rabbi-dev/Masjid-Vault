export type ExpenseRow = {
  id: string
  title: string
  amount: number
  date: string
  category: string
  note: string | null
}

export type ExpenseSummary = {
  monthTotal: number
  yearTotal: number
  allTimeTotal: number
  count: number
}

export type ExpenseData = {
  year: number
  month: number
  years: number[]
  current: { year: number; month: number }
  rows: ExpenseRow[]
  summary: ExpenseSummary
}
