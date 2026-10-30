import Link from "next/link"
import { HandCoins, Receipt, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const actions = [
  { title: "Add expense", icon: Receipt },
  { title: "Manage people", icon: Users },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Frequently used tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-start gap-2"
          )}
        >
          <HandCoins className="size-4" />
          Open collection register
        </Link>

        {actions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="w-full justify-start gap-2"
            disabled
          >
            <action.icon className="size-4" />
            {action.title}
            <Badge variant="secondary" className="ml-auto">
              Soon
            </Badge>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
