"use client"

import { useState, useTransition } from "react"

import type { MemberState } from "@/app/actions/members"

// Runs a member action, keeps the form's error message and pending state,
// and calls onSuccess so the dialog can close itself.
export function useMemberForm(
  action: (formData: FormData) => Promise<MemberState>,
  onSuccess: () => void
) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(formData: FormData) {
    setError(null)

    startTransition(async () => {
      const result = await action(formData)

      if (result && "error" in result) {
        setError(result.error)
        return
      }

      onSuccess()
    })
  }

  return { error, pending, submit }
}
