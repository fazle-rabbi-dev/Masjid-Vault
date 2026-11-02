"use client"

import { usePathname } from "next/navigation"
import { ChevronDown, Landmark, LogOut } from "lucide-react"

import { logoutAction } from "@/app/actions/auth"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { roleLabels, type Session } from "@/constants/auth"
import { navItems } from "@/constants/navigation"

export function AppHeader({ session }: { session: Session }) {
  const pathname = usePathname()
  const roleLabel = roleLabels[session.role]
  const showRole = roleLabel !== session.name
  const pageTitle =
    navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.title ?? "Masjid Vault"

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <p className="truncate text-sm font-medium">{pageTitle}</p>

      <div className="ml-auto flex-center gap-1">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({
              variant: "ghost",
              className: "h-9 gap-2 px-2",
            })}
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <Landmark className="size-3.5" />
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left leading-tight sm:block">
              <p className="max-w-32 truncate text-sm font-medium">
                {session.name}
              </p>
              {showRole ? (
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              ) : null}
            </div>
            <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <p className="truncate">{session.name}</p>
                {showRole ? (
                  <p className="text-xs font-normal text-muted-foreground">
                    {roleLabel}
                  </p>
                ) : null}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <DropdownMenuItem
                  nativeButton
                  render={<button type="submit" />}
                  className="w-full cursor-pointer"
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </form>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
