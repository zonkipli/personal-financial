"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Bell } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReminderForm } from "@/components/reminders/reminder-form"
import { ReminderCard } from "@/components/reminders/reminder-card"
import type { Reminder } from "@/types"

export default function RemindersPage() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const loadReminders = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/reminders?userId=${user.id}`)
      const data = await res.json()
      setReminders(data || [])
    } catch (error) {
      console.error("Error loading reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReminders()
  }, [user])

  const upcomingReminders = reminders.filter(r => {
    const reminderDate = new Date(r.reminderDate)
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return reminderDate <= weekFromNow
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengingat & Reminder</h1>
          <p className="text-muted-foreground">Jangan lupa bayar tagihan & jatuh tempo penting</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Reminder Baru</DialogTitle>
            </DialogHeader>
            <ReminderForm
              onSuccess={() => {
                setIsAddOpen(false)
                loadReminders()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {upcomingReminders.length > 0 && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                {upcomingReminders.length} Reminder Mendatang
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ada reminder yang jatuh tempo dalam 7 hari ke depan
              </p>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : reminders.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Belum ada reminder</h3>
          <p className="text-muted-foreground mb-4">
            Buat reminder untuk tagihan, deadline, atau event penting lainnya
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Reminder Pertama
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onUpdate={loadReminders}
            />
          ))}
        </div>
      )}
    </div>
  )
}
