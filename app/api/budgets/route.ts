import { type NextRequest, NextResponse } from "next/server"
import { supabase, generateUUID } from "@/lib/db"

interface BudgetRow {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  month: number
  year: number
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: budgets, error } = await supabase
      .from("budgets")
      .select("id, user_id, category_id, amount, month, year, created_at")
      .eq("user_id", userId)

    if (error) {
      console.error("[v0] Get budgets error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      budgets: (budgets || []).map((b: BudgetRow) => ({
        id: b.id,
        userId: b.user_id,
        categoryId: b.category_id,
        amount: Number(b.amount),
        month: b.month,
        year: b.year,
        createdAt: b.created_at,
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
    let existingQuery = supabase
      .from("budgets")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year)

    if (categoryId) {
      existingQuery = existingQuery.eq("category_id", categoryId)
    } else {
      existingQuery = existingQuery.is("category_id", null)
    }

    const { data: existing, error: selectError } = await existingQuery.maybeSingle()

    if (selectError) {
      console.error("[v0] Check budget error:", selectError)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    if (existing) {
      // Update existing
      const { error: updateError } = await supabase
        .from("budgets")
        .update({ amount })
        .eq("id", existing.id)

      if (updateError) {
        console.error("[v0] Update budget error:", updateError)
        return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        budget: {
          id: existing.id,
          userId,
          categoryId,
          amount,
          month,
          year,
          createdAt: existing.created_at,
        },
      })
    }

    // Create new budget
    const budgetId = generateUUID()
    const { data: newBudget, error: insertError } = await supabase
      .from("budgets")
      .insert({
        id: budgetId,
        user_id: userId,
        category_id: categoryId,
        amount,
        month,
        year,
      })
      .select("created_at")
      .single()

    if (insertError) {
      console.error("[v0] Create budget error:", insertError)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      budget: {
        id: budgetId,
        userId,
        categoryId,
        amount,
        month,
        year,
        createdAt: newBudget?.created_at || new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Create budget error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
