import { HandCoins, Receipt, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const actions = [
  { title: "Add contribution", icon: HandCoins },
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
