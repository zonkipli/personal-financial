"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Trash, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { SplitBill, SplitBillParticipant } from "@/types"

interface SplitBillWithParticipants extends SplitBill {
  participants: SplitBillParticipant[]
}

interface SplitBillCardProps {
  bill: SplitBillWithParticipants
  onUpdate: () => void
}

export function SplitBillCard({ bill, onUpdate }: SplitBillCardProps) {
  const paidCount = bill.participants.filter(p => p.isPaid).length
  const totalCount = bill.participants.length

  const handleMarkPaid = async (participantId: string) => {
    try {
      await fetch(`/api/split-bills/${bill.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId })
      })
      onUpdate()
    } catch (error) {
      console.error("Error marking as paid:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus patungan "${bill.title}"?`)) return

    try {
      await fetch(`/api/split-bills/${bill.id}`, {
        method: "DELETE"
      })
      onUpdate()
    } catch (error) {
      console.error("Error deleting split bill:", error)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{bill.title}</h3>
          <p className="text-2xl font-bold">Rp {Number(bill.totalAmount).toLocaleString('id-ID')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={paidCount === totalCount ? "default" : "secondary"}>
            {paidCount}/{totalCount} Lunas
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        {bill.participants.map((participant) => (
          <div
            key={participant.id}
            className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{participant.name}</p>
              <p className="text-sm text-muted-foreground">
                Rp {Number(participant.amount).toLocaleString('id-ID')}
              </p>
            </div>
            {participant.isPaid ? (
              <Badge variant="default" className="bg-green-600">
                <Check className="h-3 w-3 mr-1" />
                Lunas
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkPaid(participant.id)}
              >
                <X className="h-3 w-3 mr-1" />
                Belum Bayar
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
