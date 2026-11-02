import Image from "next/image"

import { cn } from "@/lib/utils"

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/android-chrome-192x192.png"
      alt="Masjid Vault"
      width={192}
      height={192}
      className={cn("shrink-0 rounded-lg object-contain", className)}
    />
  )
}
