"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet, CreditCard, Smartphone, Banknote, ArrowLeftRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AccountForm } from "@/components/accounts/account-form"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountTransferDialog } from "@/components/accounts/account-transfer-dialog"
import type { Account } from "@/types"

export default function AccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const loadAccounts = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/accounts?userId=${user.id}`)
      const data = await res.json()
      setAccounts(data.accounts || [])
      setTotalBalance(data.totalBalance || 0)
    } catch (error) {
      console.error("Error loading accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [user])

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <CreditCard className="h-5 w-5" />
      case 'e-wallet': return <Smartphone className="h-5 w-5" />
      case 'credit-card': return <CreditCard className="h-5 w-5" />
      default: return <Wallet className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Akun & Dompet</h1>
          <p className="text-muted-foreground">Kelola rekening bank, e-wallet, dan uang cash</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer Antar Akun</DialogTitle>
              </DialogHeader>
              <AccountTransferDialog
                accounts={accounts}
                onSuccess={() => {
                  setIsTransferOpen(false)
                  loadAccounts()
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Akun Baru</DialogTitle>
              </DialogHeader>
              <AccountForm
                onSuccess={() => {
                  setIsAddOpen(false)
                  loadAccounts()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Banknote className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Saldo (IDR)</p>
            <h2 className="text-3xl font-bold">
              Rp {totalBalance.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Belum ada akun</h3>
          <p className="text-muted-foreground mb-4">
            Tambahkan akun pertama Anda untuk mulai tracking keuangan
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Akun Pertama
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              icon={getAccountIcon(account.type)}
              onUpdate={loadAccounts}
            />
          ))}
        </div>
      )}
    </div>
  )
}
