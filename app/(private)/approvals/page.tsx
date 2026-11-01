import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ApprovalsView } from "@/components/private/approvals/approvals-view"
import { requireSession } from "@/lib/auth"
import { getApprovalData } from "@/lib/approvals"

export const metadata: Metadata = {
  title: "Approvals | Masjid Vault",
  description: "Review member submitted changes before they touch official records.",
}

export default async function ApprovalsPage() {
  const session = await requireSession()

  // Approvals are admin only. Members cannot review their own requests.
  if (session.role !== "ADMIN") redirect("/dashboard")

  const data = await getApprovalData()

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="space-y-1">
        <h1 className="heading-2">Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Member changes waiting for your review. Nothing touches the records
          until you approve it.
        </p>
      </section>

      <ApprovalsView pending={data.pending} history={data.history} />
    </main>
  )
}
