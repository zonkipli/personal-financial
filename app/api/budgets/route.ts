import { type NextRequest, NextResponse } from "next/server"
import { query, generateUUID, formatDateForMySQL } from "@/lib/db"

interface BudgetRow {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  month: number
  year: number
  created_at: Date | string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const budgets = await query<BudgetRow[]>(
      "SELECT id, user_id, category_id, amount, month, year, created_at FROM budgets WHERE user_id = ?",
      [userId],
    )

    return NextResponse.json({
      success: true,
      budgets: budgets.map((b) => ({
        id: b.id,
        userId: b.user_id,
        categoryId: b.category_id,
        amount: Number(b.amount),
        month: b.month,
        year: b.year,
        createdAt: typeof b.created_at === "string" ? b.created_at : new Date(b.created_at).toISOString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Get budgets error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId, amount, month, year } = await request.json()

    // Check if budget exists for this period
    const existing = await query<BudgetRow[]>(
      "SELECT id FROM budgets WHERE user_id = ? AND (category_id = ? OR (category_id IS NULL AND ? IS NULL)) AND month = ? AND year = ?",
      [userId, categoryId, categoryId, month, year],
    )

    if (existing.length > 0) {
      // Update existing
      await query("UPDATE budgets SET amount = ? WHERE id = ?", [amount, existing[0].id])
      return NextResponse.json({
        success: true,
        budget: {
          id: existing[0].id,
          userId,
          categoryId,
          amount,
          month,
          year,
          createdAt: formatDateForMySQL(),
        },
      })
    }

    const budgetId = generateUUID()
    await query("INSERT INTO budgets (id, user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?, ?)", [
      budgetId,
      userId,
      categoryId,
      amount,
      month,
      year,
    ])

    return NextResponse.json({
      success: true,
      budget: {
        id: budgetId,
        userId,
        categoryId,
        amount,
        month,
        year,
        createdAt: formatDateForMySQL(),
      },
    })
  } catch (error) {
    console.error("[v0] Create budget error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
