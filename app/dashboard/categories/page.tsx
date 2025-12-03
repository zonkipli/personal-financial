import { CategoryList } from "@/components/categories/category-list"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Kategori</h1>
        <p className="text-muted-foreground">Kelola kategori untuk mengelompokkan transaksi Anda</p>
      </div>
      <CategoryList />
    </div>
  )
}
