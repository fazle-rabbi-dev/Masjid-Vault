import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { MembersList } from "@/components/private/members/members-list"
import { memberPermissions, type MemberPermission } from "@/constants/auth"
import { requireSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { MemberRow } from "@/types/members"

export const metadata: Metadata = {
  title: "Members | Masjid Vault",
  description: "Manage member accounts and permissions.",
}

export default async function MembersPage() {
  const session = await requireSession()

  // Members can never see or touch this page.
  if (session.role !== "ADMIN") redirect("/dashboard")

  const rows = await prisma.member.findMany({ orderBy: { createdAt: "desc" } })

  // Only send safe fields to the client, never passwordHash.
  const members: MemberRow[] = rows.map((member) => ({
    id: member.id,
    name: member.name,
    username: member.username,
    permission: memberPermissions.includes(
      member.permission as MemberPermission
    )
      ? (member.permission as MemberPermission)
      : "READ_ONLY",
    status: member.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    createdAt: member.createdAt,
  }))

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="space-y-1">
        <h1 className="heading-2">Members</h1>
        <p className="text-sm text-muted-foreground">
          Create accounts and control what each member can access.
        </p>
      </section>
      <MembersList members={members} />
    </main>
  )
}
