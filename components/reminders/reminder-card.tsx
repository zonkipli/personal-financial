"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Clock, Trash } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Reminder } from "@/types"

interface ReminderCardProps {
  reminder: Reminder
  onUpdate: () => void
}

export function ReminderCard({ reminder, onUpdate }: ReminderCardProps) {
  const dueDate = new Date(reminder.dueDate)
  const reminderDate = new Date(reminder.reminderDate)
  const today = new Date()
  const isUpcoming = reminderDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const isOverdue = dueDate < today && !reminder.isCompleted

  const handleComplete = async () => {
    try {
      await fetch(`/api/reminders/${reminder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true })
      })
      onUpdate()
    } catch (error) {
      console.error("Error completing reminder:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Hapus reminder ini?")) return

    try {
      await fetch(`/api/reminders/${reminder.id}`, {
        method: "DELETE"
      })
      onUpdate()
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  return (
    <Card className={`p-4 ${isUpcoming && !reminder.isCompleted ? 'border-yellow-200 dark:border-yellow-800' : ''} ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{reminder.title}</h3>
            <Badge variant="secondary">{reminder.type}</Badge>
            {isOverdue && <Badge variant="destructive">Terlambat</Badge>}
            {isUpcoming && !reminder.isCompleted && <Badge className="bg-yellow-600">Segera</Badge>}
          </div>

          {reminder.description && (
            <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Jatuh tempo: {format(dueDate, "d MMM yyyy", { locale: id })}</span>
            </div>
            {reminder.amount > 0 && (
              <span className="font-medium">Rp {Number(reminder.amount).toLocaleString('id-ID')}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!reminder.isCompleted && (
            <Button size="sm" onClick={handleComplete}>
              <Check className="h-4 w-4 mr-1" />
              Selesai
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={handleDelete}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
