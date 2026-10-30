export type ExpenseInput = {
  title: string
  amount: number
  date: Date
  category: string
  note: string | null
}

export type ExpenseUpdateInput = {
  title: string
  amount: number
  date: Date
  category: string
  note: string | null
}

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function parseAmount(value: FormDataEntryValue | null) {
  const amount = Number(String(value ?? ""))

  if (!Number.isInteger(amount) || amount <= 0) return null

  return amount
}

function parseNote(value: FormDataEntryValue | null) {
  const note = String(value ?? "").trim()

  if (note.length > 500) return undefined

  return note || null
}

export function parseExpenseForm(
  formData: FormData
): { data: ExpenseInput } | { error: string } {
  const title = String(formData.get("title") ?? "").trim()
  if (!title) return { error: "Enter an expense title." }
  if (title.length > 100) return { error: "Title must be 100 characters or fewer." }

  const amount = parseAmount(formData.get("amount"))
  if (amount === null) {
    return { error: "Enter an amount greater than zero." }
  }

  const date = parseDateInput(String(formData.get("date") ?? ""))
  if (!date) return { error: "Enter a valid expense date." }

  const category = String(formData.get("category") ?? "").trim()
  if (!category) return { error: "Select a category." }

  const note = parseNote(formData.get("note"))
  if (note === undefined) {
    return { error: "Note must be 500 characters or fewer." }
  }

  return { data: { title, amount, date, category, note } }
}

export function parseExpenseUpdate(
  formData: FormData
): { data: ExpenseUpdateInput } | { error: string } {
  return parseExpenseForm(formData)
}
