"use client"

import { useState } from "react"
import { AlertCircle, Pencil, Plus, Trash2, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  createPerson,
  deletePerson,
  togglePerson,
  updatePerson,
} from "@/app/actions/people"
import { formatCurrency } from "@/lib/format"

type Person = {
  id: string
  name: string
  monthlyAmount: number
  active: boolean
  note: string | null
}

export function PeopleList({ people }: { people: Person[] }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)
  const [deleting, setDeleting] = useState<Person | null>(null)

  async function handleCreate(formData: FormData) {
    await createPerson(formData)
    setOpen(false)
  }

  async function handleUpdate(formData: FormData) {
    if (!editing) return
    await updatePerson(editing.id, formData)
    setEditing(null)
  }

  async function handleDelete() {
    if (!deleting) return
    await deletePerson(deleting.id)
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" /> Add person
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add person</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input name="name" required />
              </div>
              <div className="space-y-1">
                <Label>Monthly amount</Label>
                <Input name="monthlyAmount" type="number" defaultValue={0} />
              </div>
              <div className="space-y-1">
                <Label>Note</Label>
                <Input name="note" />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="divide-y divide-foreground/10 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        {people.map((person) => (
          <li
            key={person.id}
            className="flex items-center justify-between py-3"
          >
            <div>
              <p className="font-medium">{person.name}</p>
              <p className="text-xs text-muted-foreground">
                {person.active ? "Active" : "Inactive"} ·{" "}
                {formatCurrency(person.monthlyAmount)}/month
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(person)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => togglePerson(person.id, !person.active)}
              >
                <UserX className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDeleting(person)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit person</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form action={handleUpdate} className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input name="name" defaultValue={editing.name} required />
              </div>
              <div className="space-y-1">
                <Label>Monthly amount</Label>
                <Input
                  name="monthlyAmount"
                  type="number"
                  defaultValue={editing.monthlyAmount}
                />
              </div>
              <div className="space-y-1">
                <Label>Note</Label>
                <Input name="note" defaultValue={editing.note ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={editing.active}
                />
                Active
              </label>
              <Button type="submit">Save</Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <AlertCircle className="size-4 text-destructive" />
            <DialogTitle>Delete person</DialogTitle>
          </DialogHeader>
          {deleting ? (
            <div className="space-y-4">
              <DialogDescription>
                Are you sure you want to delete <strong>{deleting.name}</strong>
                ? This action cannot be undone.
              </DialogDescription>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeleting(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
