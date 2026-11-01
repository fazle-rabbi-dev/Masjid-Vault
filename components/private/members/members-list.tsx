"use client"

import { useState } from "react"
import { AlertCircle, KeyRound, Pencil, UserCheck, UserX } from "lucide-react"

import { setMemberStatusAction } from "@/app/actions/members"
import { AddMemberDialog } from "@/components/private/members/add-member-dialog"
import { EditMemberDialog } from "@/components/private/members/edit-member-dialog"
import { ResetPasswordDialog } from "@/components/private/members/reset-password-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { roleLabels } from "@/constants/auth"
import { formatDate } from "@/lib/format"
import type { MemberRow } from "@/types/members"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function MembersList({ members }: { members: MemberRow[] }) {
  const [editing, setEditing] = useState<MemberRow | null>(null)
  const [resetting, setResetting] = useState<MemberRow | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggleStatus(member: MemberRow) {
    setBusyId(member.id)
    setError(null)

    const nextStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    const result = await setMemberStatusAction(member.id, nextStatus)

    if (result && "error" in result) setError(result.error)
    setBusyId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </p>
        <AddMemberDialog />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {members.length === 0 ? (
        <Empty className="bg-card ring-1 ring-foreground/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCheck className="size-4" />
            </EmptyMedia>
            <EmptyTitle>No members yet</EmptyTitle>
            <EmptyDescription>
              Add a member to let them sign in and view the mosque funds.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="animate-in divide-y divide-foreground/10 rounded-xl bg-card px-4 fade-in-0 ring-1 ring-foreground/10">
          {members.map((member) => {
            const isInactive = member.status === "INACTIVE"

            return (
              <li
                key={member.id}
                className="flex-center flex-wrap justify-between gap-3 py-3"
              >
                <div className="flex-center min-w-0 gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <div className="flex-center gap-2">
                      <p className="truncate font-medium">{member.name}</p>
                      <Badge variant={isInactive ? "outline" : "secondary"}>
                        {isInactive ? "Inactive" : "Active"}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      @{member.username} · {roleLabels[member.permission]} ·
                      since {formatDate(member.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${member.name}`}
                    onClick={() => setEditing(member)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Reset password for ${member.name}`}
                    onClick={() => setResetting(member)}
                  >
                    <KeyRound className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      isInactive
                        ? `Activate ${member.name}`
                        : `Deactivate ${member.name}`
                    }
                    disabled={busyId === member.id}
                    onClick={() => toggleStatus(member)}
                  >
                    {isInactive ? (
                      <UserCheck className="size-4" />
                    ) : (
                      <UserX className="size-4" />
                    )}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <EditMemberDialog
        key={editing?.id ?? "edit-none"}
        member={editing}
        onClose={() => setEditing(null)}
      />
      <ResetPasswordDialog
        key={resetting?.id ?? "reset-none"}
        member={resetting}
        onClose={() => setResetting(null)}
      />
    </div>
  )
}
