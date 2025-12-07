import { type NextRequest, NextResponse } from "next/server"
import { supabase, generateUUID } from "@/lib/db"

interface TransactionRow {
  id: string
  user_id: string
  category_id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: Date | string
  created_at: Date | string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("id, user_id, category_id, type, amount, description, date, created_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Get transactions error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactions: (transactions || []).map((t: TransactionRow) => ({
        id: t.id,
        userId: t.user_id,
        categoryId: t.category_id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        date: typeof t.date === "string" ? t.date.split("T")[0] : new Date(t.date).toISOString().split("T")[0],
        createdAt: typeof t.created_at === "string" ? t.created_at : new Date(t.created_at).toISOString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { categoryId, type, amount, description, date } = await request.json()

    const transactionId = generateUUID()
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        id: transactionId,
        user_id: userId,
        category_id: categoryId,
        type,
        amount,
        description: description || "",
        date,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Create transaction error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: data.id,
        userId: data.user_id,
        categoryId: data.category_id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        createdAt: data.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Create transaction error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
