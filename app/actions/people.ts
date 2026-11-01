"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { canWrite, requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

function snapshot(person: {
  name: string
  monthlyAmount: number
  active: boolean
  note: string | null
}) {
  return {
    name: person.name,
    monthlyAmount: person.monthlyAmount,
    active: person.active,
    note: person.note,
  }
}

// Read-only members can never change the contributor directory.
// Read + write members do not touch the record directly, their change waits
// as an ApprovalRequest until the admin approves it.
export async function createPerson(formData: FormData) {
  const session = await requireSession()
  if (!canWrite(session.role)) redirect("/people")

  const name = String(formData.get("name") ?? "").trim()
  const monthlyAmount = Number(formData.get("monthlyAmount") ?? 0)
  const note = String(formData.get("note") ?? "").trim() || null
  if (!name) return

  const data = { name, monthlyAmount, note }

  if (session.role === "ADMIN") {
    await prisma.person.create({ data })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "CREATE",
        entity: "PERSON",
        payload: data,
      },
    })
  }

  revalidatePath("/people")
  revalidatePath("/dashboard")
}

export async function updatePerson(id: string, formData: FormData) {
  const session = await requireSession()
  if (!canWrite(session.role)) redirect("/people")

  const name = String(formData.get("name") ?? "").trim()
  const monthlyAmount = Number(formData.get("monthlyAmount") ?? 0)
  const note = String(formData.get("note") ?? "").trim() || null
  const active = formData.get("active") === "on"
  if (!name) return

  const data = { name, monthlyAmount, note, active }
  const existing = await prisma.person.findUnique({ where: { id } })
  if (!existing) return

  if (session.role === "ADMIN") {
    await prisma.person.update({ where: { id }, data })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "UPDATE",
        entity: "PERSON",
        entityId: id,
        payload: data,
        previous: snapshot(existing),
      },
    })
  }

  revalidatePath("/people")
  revalidatePath("/dashboard")
}

export async function togglePerson(id: string, active: boolean) {
  const session = await requireSession()
  if (!canWrite(session.role)) redirect("/people")

  const existing = await prisma.person.findUnique({ where: { id } })
  if (!existing) return

  if (session.role === "ADMIN") {
    await prisma.person.update({ where: { id }, data: { active } })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "UPDATE",
        entity: "PERSON",
        entityId: id,
        payload: { active },
        previous: snapshot(existing),
      },
    })
  }

  revalidatePath("/people")
  revalidatePath("/dashboard")
}

export async function deletePerson(id: string) {
  const session = await requireSession()
  if (!canWrite(session.role)) redirect("/people")

  const existing = await prisma.person.findUnique({ where: { id } })
  if (!existing) return

  if (session.role === "ADMIN") {
    await prisma.person.delete({ where: { id } })
  } else {
    await prisma.approvalRequest.create({
      data: {
        memberId: session.id,
        operation: "DELETE",
        entity: "PERSON",
        entityId: id,
        previous: snapshot(existing),
      },
    })
  }

  revalidatePath("/people")
  revalidatePath("/dashboard")
}
