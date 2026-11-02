import type { Metadata } from "next"

import { requireSession } from "@/lib/auth"
import { getCurrentCollectionMonth } from "@/lib/settings"
import { updateCollectionMonth } from "@/app/actions/settings"

export const metadata: Metadata = {
  title: "Settings | Masjid Vault",
  description: "Account and collection settings.",
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default async function SettingsPage() {
  const session = await requireSession()
  const isAdmin = session.role === "ADMIN"
  const { year, month } = await getCurrentCollectionMonth()

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="space-y-1">
        <h1 className="heading-2">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Collection month and account settings.
        </p>
      </section>

      <section className="space-y-4 rounded-xl border p-4">
        <h2 className="heading-4">Current collection month</h2>
        <form
          action={updateCollectionMonth}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm">Year</span>
            <input
              name="year"
              type="number"
              defaultValue={year}
              disabled={!isAdmin}
              className="rounded border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Month</span>
            <select
              name="month"
              defaultValue={month}
              disabled={!isAdmin}
              className="rounded border px-3 py-2"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          {isAdmin ? (
            <button
              type="submit"
              className="rounded bg-primary px-4 py-2 text-primary-foreground"
            >
              Save
            </button>
          ) : null}
        </form>
      </section>

      <section className="space-y-2 rounded-xl border p-4">
        <h2 className="heading-4">Account</h2>
        <p className="text-sm">Signed in as {session.name}</p>
        <p className="text-sm text-muted-foreground">Role: {session.role}</p>
      </section>
    </main>
  )
}
