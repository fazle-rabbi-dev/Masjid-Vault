import { AppHeader } from "@/components/private/app-header"
import { AppSidebar } from "@/components/private/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireSession } from "@/lib/auth"

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  return (
    <SidebarProvider>
      <AppSidebar role={session.role} />
      <SidebarInset>
        <AppHeader session={session} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
