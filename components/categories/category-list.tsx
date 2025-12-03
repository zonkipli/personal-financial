"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFinance } from "@/contexts/finance-context"
import { CategoryForm } from "./category-form"
import { MoreVertical, Edit, Trash2, TrendingUp, TrendingDown, Tags } from "lucide-react"
import type { Category } from "@/types"

export function CategoryList() {
  const { categories, transactions, deleteCategory } = useFinance()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  const getCategoryTransactionCount = (categoryId: string) => {
    return transactions.filter((t) => t.categoryId === categoryId).length
  }

  const handleDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
    }
  }

  const CategoryCard = ({ category }: { category: Category }) => {
    const transactionCount = getCategoryTransactionCount(category.id)

    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {category.type === "income" ? (
              <TrendingUp className="h-5 w-5" style={{ color: category.color }} />
            ) : (
              <TrendingDown className="h-5 w-5" style={{ color: category.color }} />
            )}
          </div>
          <div>
            <p className="font-medium">{category.name}</p>
            <p className="text-sm text-muted-foreground">{transactionCount} transaksi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="shrink-0"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setDeletingCategory(category)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Tags className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium">Belum ada kategori</p>
      <p className="text-muted-foreground">Tambahkan kategori untuk mengelompokkan transaksi</p>
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Kelola Kategori</CardTitle>
            <CategoryForm />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="expense" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Pengeluaran ({expenseCategories.length})
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Pemasukan ({incomeCategories.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="expense">
              {expenseCategories.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="income">
              {incomeCategories.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          trigger={<span className="hidden" />}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kategori "{deletingCategory?.name}" akan dihapus. Transaksi yang
              menggunakan kategori ini tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
