import type { Metadata } from "next"

import { requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PeopleList } from "@/components/private/people/people-list"

export const metadata: Metadata = {
  title: "People | Masjid Vault",
  description: "Contributor directory.",
}

export default async function PeoplePage() {
  await requireSession()
  const people = await prisma.person.findMany({ orderBy: { name: "asc" } })

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="space-y-1">
        <h1 className="heading-2">People</h1>
        <p className="text-sm text-muted-foreground">
          Contributor directory.
        </p>
      </section>
      <PeopleList people={people} />
    </main>
  )
}

