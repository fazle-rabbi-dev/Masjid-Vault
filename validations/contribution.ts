export type ContributionInput = {
  personId: string
  collectionYear: number
  collectionMonth: number
  amount: number
  receivedAt: Date
  note: string | null
}

export type ContributionUpdateInput = {
  amount: number
  receivedAt: Date
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

export function parseContributionForm(
  formData: FormData
): { data: ContributionInput } | { error: string } {
  const personId = String(formData.get("personId") ?? "").trim()
  if (!personId) return { error: "Select a contributor." }

  const collectionYear = Number(formData.get("collectionYear"))
  if (
    !Number.isInteger(collectionYear) ||
    collectionYear < 2000 ||
    collectionYear > 2100
  ) {
    return { error: "Select a valid collection year." }
  }

  const collectionMonth = Number(formData.get("collectionMonth"))
  if (
    !Number.isInteger(collectionMonth) ||
    collectionMonth < 1 ||
    collectionMonth > 12
  ) {
    return { error: "Select a valid collection month." }
  }

  const amount = parseAmount(formData.get("amount"))
  if (amount === null) {
    return { error: "Enter an amount greater than zero." }
  }

  const receivedAt = parseDateInput(String(formData.get("receivedAt") ?? ""))
  if (!receivedAt) return { error: "Enter a valid received date." }

  const note = parseNote(formData.get("note"))
  if (note === undefined) {
    return { error: "Note must be 500 characters or fewer." }
  }

  return {
    data: {
      personId,
      collectionYear,
      collectionMonth,
      amount,
      receivedAt,
      note,
    },
  }
}

export function parseContributionUpdate(
  formData: FormData
): { data: ContributionUpdateInput } | { error: string } {
  const amount = parseAmount(formData.get("amount"))
  if (amount === null) {
    return { error: "Enter an amount greater than zero." }
  }

  const receivedAt = parseDateInput(String(formData.get("receivedAt") ?? ""))
  if (!receivedAt) return { error: "Enter a valid received date." }

  const note = parseNote(formData.get("note"))
  if (note === undefined) {
    return { error: "Note must be 500 characters or fewer." }
  }

  return { data: { amount, receivedAt, note } }
}
