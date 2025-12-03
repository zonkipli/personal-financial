"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DebtForm } from "@/components/debts/debt-form"
import { DebtList } from "@/components/debts/debt-list"
import { DebtSummary } from "@/components/debts/debt-summary"

export default function DebtsPage() {
  const [showPaid, setShowPaid] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utang Piutang</h1>
          <p className="text-muted-foreground">Kelola daftar utang dan piutang Anda</p>
        </div>
        <DebtForm />
      </div>

      <DebtSummary />

      <div className="flex items-center space-x-2">
        <Switch id="show-paid" checked={showPaid} onCheckedChange={setShowPaid} />
        <Label htmlFor="show-paid">Tampilkan yang sudah lunas</Label>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="receivable">Piutang</TabsTrigger>
          <TabsTrigger value="payable">Utang</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DebtList filter="all" showPaid={showPaid} />
        </TabsContent>
        <TabsContent value="receivable">
          <DebtList filter="receivable" showPaid={showPaid} />
        </TabsContent>
        <TabsContent value="payable">
          <DebtList filter="payable" showPaid={showPaid} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
