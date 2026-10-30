export type HistoryTransaction = {
  id: string
  type: "CONTRIBUTION" | "EXPENSE"
  title: string
  amount: number
  date: string
  category: string | null
  note: string | null
  personName: string | null
  collectionYear: number | null
  collectionMonth: number | null
}

export type HistorySummary = {
  collected: number
  expenses: number
  balance: number
  count: number
}

export type HistoryData = {
  year: number
  month: number | null
  type: "ALL" | "CONTRIBUTION" | "EXPENSE"
  years: number[]
  current: { year: number; month: number }
  rows: HistoryTransaction[]
  summary: HistorySummary
}
