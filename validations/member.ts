import {
  memberPermissions,
  memberStatuses,
  type MemberPermission,
  type MemberStatus,
} from "@/constants/auth"

export type MemberCreateInput = {
  name: string
  username: string
  password: string
  permission: MemberPermission
}

export type MemberUpdateInput = Omit<MemberCreateInput, "password">

const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/
const PASSWORD_MIN = 6
const PASSWORD_MAX = 72

type Parsed<T> = { value: T } | { error: string }

function parseName(value: FormDataEntryValue | null): Parsed<string> {
  const name = String(value ?? "").trim()

  if (!name) return { error: "Enter the member's name." }
  if (name.length > 60) {
    return { error: "Name must be 60 characters or fewer." }
  }

  return { value: name }
}

function parseUsername(value: FormDataEntryValue | null): Parsed<string> {
  const username = String(value ?? "")
    .trim()
    .toLowerCase()

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Username must be 3-30 characters: lowercase letters, numbers, dot, dash or underscore.",
    }
  }

  return { value: username }
}

function parsePermission(
  value: FormDataEntryValue | null
): Parsed<MemberPermission> {
  const permission = String(value ?? "") as MemberPermission

  if (!memberPermissions.includes(permission)) {
    return { error: "Select a valid permission." }
  }

  return { value: permission }
}

export function parseMemberCreate(
  formData: FormData
): { data: MemberCreateInput } | { error: string } {
  const name = parseName(formData.get("name"))
  if ("error" in name) return name

  const username = parseUsername(formData.get("username"))
  if ("error" in username) return username

  const password = String(formData.get("password") ?? "")
  if (password.length < PASSWORD_MIN) {
    return { error: `Password must be at least ${PASSWORD_MIN} characters.` }
  }
  if (password.length > PASSWORD_MAX) {
    return { error: `Password must be ${PASSWORD_MAX} characters or fewer.` }
  }

  const permission = parsePermission(formData.get("permission"))
  if ("error" in permission) return permission

  return {
    data: {
      name: name.value,
      username: username.value,
      password,
      permission: permission.value,
    },
  }
}

export function parseMemberUpdate(
  formData: FormData
): { data: MemberUpdateInput } | { error: string } {
  const name = parseName(formData.get("name"))
  if ("error" in name) return name

  const username = parseUsername(formData.get("username"))
  if ("error" in username) return username

  const permission = parsePermission(formData.get("permission"))
  if ("error" in permission) return permission

  return {
    data: {
      name: name.value,
      username: username.value,
      permission: permission.value,
    },
  }
}

export function parsePasswordReset(
  formData: FormData
): { data: { password: string } } | { error: string } {
  const password = String(formData.get("password") ?? "")
  if (password.length < PASSWORD_MIN) {
    return { error: `Password must be at least ${PASSWORD_MIN} characters.` }
  }
  if (password.length > PASSWORD_MAX) {
    return { error: `Password must be ${PASSWORD_MAX} characters or fewer.` }
  }

  return { data: { password } }
}

export function parseMemberStatus(value: string): MemberStatus | null {
  return memberStatuses.includes(value as MemberStatus)
    ? (value as MemberStatus)
    : null
}
