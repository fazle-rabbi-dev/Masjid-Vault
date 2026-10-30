import type { Metadata } from "next"
import { Landmark } from "lucide-react"

import { LoginForm } from "@/components/public/login/login-form"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sign in | Masjid Vault",
  description: "Sign in to manage your mosque fund.",
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-muted/30 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 -right-24 size-96 rounded-full bg-success/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex-center size-12 justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Landmark className="size-6" />
          </div>
          <h1 className="heading-2 mt-4">Masjid Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mosque fund management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="heading-4">Welcome back</CardTitle>
            <CardDescription>
              Sign in to continue to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Private access - authorized members only
        </p>
      </div>
    </main>
  )
}
