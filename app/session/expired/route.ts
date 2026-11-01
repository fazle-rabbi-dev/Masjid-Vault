import { redirect } from "next/navigation"

import { clearSession } from "@/lib/auth"

// Reached when a cookie is still present but the session no longer resolves
// (member deactivated, removed, or role no longer valid). Clears the stale
// cookies so the visitor lands on the login page instead of looping.
export async function GET() {
  await clearSession()
  redirect("/")
}
