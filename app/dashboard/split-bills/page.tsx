"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SplitBillForm } from "@/components/split-bills/split-bill-form"
import { SplitBillCard } from "@/components/split-bills/split-bill-card"
import type { SplitBill, SplitBillParticipant } from "@/types"

interface SplitBillWithParticipants extends SplitBill {
  participants: SplitBillParticipant[]
}

export default function SplitBillsPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState<SplitBillWithParticipants[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const loadBills = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/split-bills?userId=${user.id}`)
      const data = await res.json()
      setBills(data || [])
    } catch (error) {
      console.error("Error loading split bills:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBills()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patungan & Split Bill</h1>
          <p className="text-muted-foreground">Kelola pengeluaran bersama teman & keluarga</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Patungan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Buat Patungan Baru</DialogTitle>
            </DialogHeader>
            <SplitBillForm
              onSuccess={() => {
                setIsAddOpen(false)
                loadBills()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : bills.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Belum ada patungan</h3>
          <p className="text-muted-foreground mb-4">
            Buat patungan untuk urusan makan bareng, trip, atau tagihan bersama
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Patungan Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bills.map((bill) => (
            <SplitBillCard
              key={bill.id}
              bill={bill}
              onUpdate={loadBills}
            />
          ))}
        </div>
      )}
    </div>
  )
}
