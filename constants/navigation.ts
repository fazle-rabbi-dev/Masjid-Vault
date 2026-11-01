import {
  BookOpen,
  CheckCheck,
  FileText,
  History,
  LayoutDashboard,
  Receipt,
  Settings,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  adminOnly?: boolean
  enabled: boolean
}

// Routes are enabled as each chapter is built.
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    enabled: true,
  },
  { title: "Register", href: "/register", icon: BookOpen, enabled: true },
  { title: "People", href: "/people", icon: Users, enabled: true },
  { title: "Expenses", href: "/expenses", icon: Receipt, enabled: true },
  { title: "History", href: "/history", icon: History, enabled: true },
  { title: "Reports", href: "/reports", icon: FileText, enabled: true },
  {
    title: "Members",
    href: "/members",
    icon: UserCog,
    adminOnly: true,
    enabled: true,
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: CheckCheck,
    adminOnly: true,
    enabled: true,
  },
  { title: "Settings", href: "/settings", icon: Settings, enabled: false },
]
