"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Account } from "@/types"

interface AccountCardProps {
  account: Account
  icon: React.ReactNode
  onUpdate: () => void
}

export function AccountCard({ account, icon, onUpdate }: AccountCardProps) {
  const handleDelete = async () => {
    if (!confirm(`Hapus akun ${account.name}?`)) return

    try {
      await fetch(`/api/accounts/${account.id}`, {
        method: "DELETE"
      })
      onUpdate()
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${account.color}20`, color: account.color }}
        >
          {icon}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash className="h-4 w-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-semibold text-lg mb-1">{account.name}</h3>
      <Badge variant="secondary" className="mb-4">
        {account.type}
      </Badge>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Saldo</p>
        <p className="text-2xl font-bold">
          {account.currency} {Number(account.balance).toLocaleString('id-ID')}
        </p>
      </div>
    </Card>
  )
}
