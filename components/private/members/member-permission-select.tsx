"use client"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  memberPermissions,
  roleLabels,
  type MemberPermission,
} from "@/constants/auth"

export function MemberPermissionSelect({
  defaultValue = "READ_ONLY",
}: {
  defaultValue?: MemberPermission
}) {
  return (
    <NativeSelect
      id="permission"
      name="permission"
      className="w-full"
      defaultValue={defaultValue}
      required
    >
      {memberPermissions.map((permission) => (
        <NativeSelectOption key={permission} value={permission}>
          {roleLabels[permission]}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
