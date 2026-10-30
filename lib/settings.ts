import { prisma } from "@/lib/db"

export async function getCurrentCollectionMonth() {
  const settings = await prisma.appSettings.findUnique({
    where: { id: "global" },
  })
  const now = new Date()

  return {
    year: settings?.currentCollectionYear ?? now.getFullYear(),
    month: settings?.currentCollectionMonth ?? now.getMonth() + 1,
  }
}
