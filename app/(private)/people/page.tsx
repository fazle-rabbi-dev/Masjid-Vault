import type { Metadata } from "next"

import { canWrite, requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { PeopleList } from "@/components/private/people/people-list"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "People | Masjid Vault",
  description: "Contributor directory.",
}

export default async function PeoplePage() {
  const session = await requireSession()
  const people = await prisma.person.findMany({ orderBy: { name: "asc" } })
  const write = canWrite(session.role)

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="heading-2">People</h1>
          <p className="text-sm text-muted-foreground">
            Contributor directory.
          </p>
        </div>

        {!write ? <Badge variant="secondary">Read only</Badge> : null}
      </section>

      <PeopleList
        people={people}
        canWrite={write}
        needsApproval={write && session.role !== "ADMIN"}
      />
    </main>
  )
}
