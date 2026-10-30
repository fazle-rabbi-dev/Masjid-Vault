"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/db"
import { requireSession } from "@/lib/auth"

export async function createPerson(formData: FormData) {
  await requireSession()
  const name = String(formData.get("name") ?? "").trim()
  const monthlyAmount = Number(formData.get("monthlyAmount") ?? 0)
  const note = String(formData.get("note") ?? "").trim() || null
  if (!name) return
  await prisma.person.create({ data: { name, monthlyAmount, note } })
  revalidatePath("/people")
}

export async function updatePerson(id: string, formData: FormData) {
  await requireSession()
  const name = String(formData.get("name") ?? "").trim()
  const monthlyAmount = Number(formData.get("monthlyAmount") ?? 0)
  const note = String(formData.get("note") ?? "").trim() || null
  const active = formData.get("active") === "on"
  await prisma.person.update({
    where: { id },
    data: { name, monthlyAmount, note, active },
  })
  revalidatePath("/people")
}

export async function togglePerson(id: string, active: boolean) {
  await requireSession()
  await prisma.person.update({ where: { id }, data: { active } })
  revalidatePath("/people")
}

export async function deletePerson(id: string) {
  await requireSession()
  await prisma.person.delete({ where: { id } })
  revalidatePath("/people")
}
