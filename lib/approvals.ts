import {
  type ApprovalEntity,
  type ApprovalOperation,
  type ApprovalStatus,
} from "@/constants/approvals"
import { getCategoryLabel } from "@/constants/expenses"
import { prisma } from "@/lib/db"
import { formatCurrency, formatDate, formatMonth } from "@/lib/format"
import type { ApprovalChange, ApprovalItem } from "@/types/approvals"

type JsonObject = Record<string, unknown>

type RequestRecord = {
  id: string
  operation: string
  entity: string
  entityId: string | null
  payload: unknown
  previous: unknown
  status: string
  requestNote: string | null
  reviewNote: string | null
  requestedAt: Date
  reviewedAt: Date | null
}

type RequestRow = RequestRecord & { member: { name: string } }

// ---------------------------------------------------------------------------
// Reading and formatting requests
// ---------------------------------------------------------------------------

export async function getApprovalData() {
  const [pending, history] = await Promise.all([
    prisma.approvalRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { requestedAt: "asc" },
      include: { member: { select: { name: true } } },
    }),
    prisma.approvalRequest.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 50,
      include: { member: { select: { name: true } } },
    }),
  ])

  const names = await getPersonNames([...pending, ...history])

  return {
    pending: pending.map((request) => toItem(request, names)),
    history: history.map((request) => toItem(request, names)),
  }
}

const objectIdPattern = /^[a-f0-9]{24}$/i

// Contribution requests only store a personId, so names are resolved in bulk.
async function getPersonNames(requests: RequestRecord[]) {
  const ids = new Set<string>()

  for (const request of requests) {
    for (const value of [request.payload, request.previous]) {
      const personId = asString(asObject(value).personId)
      if (personId && objectIdPattern.test(personId)) ids.add(personId)
    }
  }

  if (ids.size === 0) return new Map<string, string>()

  const people = await prisma.person.findMany({
    where: { id: { in: [...ids] } },
    select: { id: true, name: true },
  })

  return new Map(people.map((person) => [person.id, person.name]))
}

function toItem(request: RequestRow, names: Map<string, string>): ApprovalItem {
  const payload = asObject(request.payload)
  const previous = asObject(request.previous)
  const entity = request.entity as ApprovalEntity

  return {
    id: request.id,
    memberName: request.member.name,
    entity,
    operation: request.operation as ApprovalOperation,
    status: request.status as ApprovalStatus,
    target: getTarget(entity, payload, previous, names),
    changes: getChanges(entity, payload, previous, names),
    requestNote: request.requestNote,
    reviewNote: request.reviewNote,
    requestedAt: request.requestedAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
  }
}

function getTarget(
  entity: ApprovalEntity,
  payload: JsonObject,
  previous: JsonObject,
  names: Map<string, string>
) {
  if (entity === "CONTRIBUTION") {
    const source = Object.keys(payload).length > 0 ? payload : previous
    const personId = asString(source.personId)
    const name = personId ? (names.get(personId) ?? "Unknown contributor") : "Unknown contributor"
    const month = monthLabel(source)

    return month ? `${name} - ${month}` : name
  }

  if (entity === "EXPENSE") {
    return asString(payload.title) ?? asString(previous.title) ?? "Untitled expense"
  }

  return asString(payload.name) ?? asString(previous.name) ?? "Unnamed contributor"
}

type Field = {
  key: string
  label: string
  format: (value: unknown, record: JsonObject) => string | null
}

function getChanges(
  entity: ApprovalEntity,
  payload: JsonObject,
  previous: JsonObject,
  names: Map<string, string>
): ApprovalChange[] {
  const fields = getFields(entity, names)

  return fields.flatMap((field) => {
    const hasProposed = field.key in payload
    const hasPrevious = field.key in previous
    if (!hasProposed && !hasPrevious) return []

    const proposed = hasProposed ? field.format(payload[field.key], payload) : null
    const before = hasPrevious ? field.format(previous[field.key], previous) : null

    // Skip fields the update left untouched.
    if (hasProposed && hasPrevious && proposed === before) return []

    return [{ label: field.label, previous: before, proposed }]
  })
}

function getFields(entity: ApprovalEntity, names: Map<string, string>): Field[] {
  if (entity === "CONTRIBUTION") {
    return [
      {
        key: "personId",
        label: "Contributor",
        format: (value) =>
          typeof value === "string" ? (names.get(value) ?? "Unknown contributor") : null,
      },
      { key: "collectionMonth", label: "Collection month", format: (_, record) => monthLabel(record) },
      { key: "amount", label: "Amount", format: money },
      { key: "receivedAt", label: "Received", format: date },
      { key: "note", label: "Note", format: text },
    ]
  }

  if (entity === "EXPENSE") {
    return [
      { key: "title", label: "Title", format: text },
      { key: "amount", label: "Amount", format: money },
      { key: "date", label: "Date", format: date },
      {
        key: "category",
        label: "Category",
        format: (value) => (typeof value === "string" ? getCategoryLabel(value) : null),
      },
      { key: "note", label: "Note", format: text },
    ]
  }

  return [
    { key: "name", label: "Name", format: text },
    { key: "monthlyAmount", label: "Monthly amount", format: money },
    {
      key: "active",
      label: "Status",
      format: (value) =>
        typeof value === "boolean" ? (value ? "Active" : "Inactive") : null,
    },
    { key: "note", label: "Note", format: text },
  ]
}

function monthLabel(record: JsonObject) {
  const year = asNumber(record.collectionYear)
  const month = asNumber(record.collectionMonth)
  if (year === null || month === null) return null

  return formatMonth(year, month)
}

function money(value: unknown) {
  return typeof value === "number" ? formatCurrency(value) : null
}

function date(value: unknown) {
  const raw = asString(value)
  if (!raw) return null

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : formatDate(parsed)
}

function text(value: unknown) {
  const raw = asString(value)?.trim()
  return raw ? raw : null
}

// ---------------------------------------------------------------------------
// Applying an approved request to the real record
// ---------------------------------------------------------------------------

export type ApplyResult = { ok: true } | { error: string }

export async function applyApprovalRequest(request: RequestRecord): Promise<ApplyResult> {
  const payload = asObject(request.payload)
  const entity = request.entity as ApprovalEntity
  const operation = request.operation as ApprovalOperation

  if (operation === "DELETE") {
    return deleteRecord(entity, request.entityId)
  }

  if (operation === "CREATE") {
    return createRecord(entity, payload)
  }

  return updateRecord(entity, request.entityId, payload)
}

async function createRecord(entity: ApprovalEntity, payload: JsonObject): Promise<ApplyResult> {
  if (entity === "CONTRIBUTION") {
    const data = contributionData(payload)
    if ("error" in data) return data
    if (!(await personExists(data.value.personId))) {
      return { error: "The contributor in this request no longer exists." }
    }

    await prisma.contribution.create({ data: data.value })
    return { ok: true }
  }

  if (entity === "EXPENSE") {
    const data = expenseData(payload)
    if ("error" in data) return data

    await prisma.expense.create({ data: data.value })
    return { ok: true }
  }

  const name = text(payload.name)
  if (!name) return { error: "This request has no contributor name." }

  await prisma.person.create({
    data: {
      name,
      monthlyAmount: asNumber(payload.monthlyAmount) ?? 0,
      note: text(payload.note),
    },
  })

  return { ok: true }
}

async function updateRecord(
  entity: ApprovalEntity,
  entityId: string | null,
  payload: JsonObject
): Promise<ApplyResult> {
  if (!entityId) return { error: "This request is not linked to a record." }

  if (entity === "CONTRIBUTION") {
    if (!(await prisma.contribution.findUnique({ where: { id: entityId } }))) {
      return { error: "The contribution in this request no longer exists." }
    }

    const data = contributionData(payload)
    if ("error" in data) return data
    if (!(await personExists(data.value.personId))) {
      return { error: "The contributor in this request no longer exists." }
    }

    await prisma.contribution.update({ where: { id: entityId }, data: data.value })
    return { ok: true }
  }

  if (entity === "EXPENSE") {
    if (!(await prisma.expense.findUnique({ where: { id: entityId } }))) {
      return { error: "The expense in this request no longer exists." }
    }

    const data = expenseData(payload)
    if ("error" in data) return data

    await prisma.expense.update({ where: { id: entityId }, data: data.value })
    return { ok: true }
  }

  if (!(await prisma.person.findUnique({ where: { id: entityId } }))) {
    return { error: "The contributor in this request no longer exists." }
  }

  const name = text(payload.name)
  const monthlyAmount = asNumber(payload.monthlyAmount)
  const active = typeof payload.active === "boolean" ? payload.active : null

  await prisma.person.update({
    where: { id: entityId },
    data: {
      ...(name ? { name } : {}),
      ...(monthlyAmount !== null ? { monthlyAmount } : {}),
      ...(active !== null ? { active } : {}),
      ...("note" in payload ? { note: text(payload.note) } : {}),
    },
  })

  return { ok: true }
}

async function deleteRecord(
  entity: ApprovalEntity,
  entityId: string | null
): Promise<ApplyResult> {
  if (!entityId) return { error: "This request is not linked to a record." }

  if (entity === "CONTRIBUTION") {
    const existing = await prisma.contribution.findUnique({ where: { id: entityId } })
    if (!existing) return { error: "The contribution was already removed." }

    await prisma.contribution.delete({ where: { id: entityId } })
    return { ok: true }
  }

  if (entity === "EXPENSE") {
    const existing = await prisma.expense.findUnique({ where: { id: entityId } })
    if (!existing) return { error: "The expense was already removed." }

    await prisma.expense.delete({ where: { id: entityId } })
    return { ok: true }
  }

  const existing = await prisma.person.findUnique({ where: { id: entityId } })
  if (!existing) return { error: "The contributor was already removed." }

  await prisma.person.delete({ where: { id: entityId } })
  return { ok: true }
}

async function personExists(personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  })

  return Boolean(person)
}

type Parsed<T> = { value: T } | { error: string }

type ContributionValues = {
  personId: string
  collectionYear: number
  collectionMonth: number
  amount: number
  receivedAt: Date
  note: string | null
}

type ExpenseValues = {
  title: string
  amount: number
  date: Date
  category: string
  note: string | null
}

function contributionData(payload: JsonObject): Parsed<ContributionValues> {
  const personId = asString(payload.personId)
  const collectionYear = asNumber(payload.collectionYear)
  const collectionMonth = asNumber(payload.collectionMonth)
  const amount = asNumber(payload.amount)
  const receivedAt = asDate(payload.receivedAt)

  if (
    !personId ||
    collectionYear === null ||
    collectionMonth === null ||
    amount === null ||
    !receivedAt
  ) {
    return { error: "This request is missing contribution details." }
  }

  return {
    value: {
      personId,
      collectionYear,
      collectionMonth,
      amount,
      receivedAt,
      note: text(payload.note),
    },
  }
}

function expenseData(payload: JsonObject): Parsed<ExpenseValues> {
  const title = text(payload.title)
  const amount = asNumber(payload.amount)
  const date = asDate(payload.date)
  const category = asString(payload.category)

  if (!title || amount === null || !date || !category) {
    return { error: "This request is missing expense details." }
  }

  return {
    value: { title, amount, date, category, note: text(payload.note) },
  }
}

// ---------------------------------------------------------------------------
// Small JSON helpers - Prisma stores payload/previous as loose JSON
// ---------------------------------------------------------------------------

function asObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : {}
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asDate(value: unknown) {
  const raw = asString(value)
  if (!raw) return null

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
