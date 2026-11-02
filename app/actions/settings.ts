"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function updateCollectionMonth(formData: FormData) {
  const session = await requireSession()
  if (session.role !== "ADMIN") redirect("/settings")

  const year = Number(formData.get("year"))
  const month = Number(formData.get("month"))
  if (!year || !month || month < 1 || month > 12) return

  await prisma.appSettings.upsert({
    where: { id: "global" },
    update: { currentCollectionYear: year, currentCollectionMonth: month },
    create: { id: "global", currentCollectionYear: year, currentCollectionMonth: month },
  })

  revalidatePath("/settings")
  revalidatePath("/dashboard")
}
