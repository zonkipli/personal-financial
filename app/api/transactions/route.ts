import { type NextRequest, NextResponse } from "next/server"
import { query, generateUUID, formatDateForMySQL } from "@/lib/db"

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

    const transactions = await query<TransactionRow[]>(
      "SELECT id, user_id, category_id, type, amount, description, date, created_at FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC",
      [userId],
    )

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => ({
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
    await query(
      "INSERT INTO transactions (id, user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [transactionId, userId, categoryId, type, amount, description || "", date],
    )

    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionId,
        userId,
        categoryId,
        type,
        amount,
        description: description || "",
        date,
        createdAt: formatDateForMySQL(),
      },
    })
  } catch (error) {
    console.error("[v0] Create transaction error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
