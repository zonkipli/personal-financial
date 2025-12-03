import { BudgetOverview } from "@/components/budget/budget-overview"

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Anggaran</h1>
        <p className="text-muted-foreground">Atur dan pantau anggaran bulanan Anda</p>
      </div>
      <BudgetOverview />
    </div>
  )
}
