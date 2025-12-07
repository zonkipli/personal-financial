import { type NextRequest, NextResponse } from "next/server"
import { query, generateUUID, formatDateForMySQL } from "@/lib/db"

interface DebtRow {
  id: string
  user_id: string
  type: "receivable" | "payable"
  person_name: string
  amount: number
  description: string
  due_date: Date | string | null
  is_paid: boolean | number
  paid_date: Date | string | null
  created_at: Date | string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const debts = await query<DebtRow[]>(
      "SELECT id, user_id, type, person_name, amount, description, due_date, is_paid, paid_date, created_at FROM debts WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    )

    return NextResponse.json({
      success: true,
      debts: debts.map((d) => ({
        id: d.id,
        userId: d.user_id,
        type: d.type,
        personName: d.person_name,
        amount: Number(d.amount),
        description: d.description,
        dueDate: d.due_date
          ? typeof d.due_date === "string"
            ? d.due_date.split("T")[0]
            : new Date(d.due_date).toISOString().split("T")[0]
          : null,
        isPaid: Boolean(d.is_paid),
        paidDate: d.paid_date
          ? typeof d.paid_date === "string"
            ? d.paid_date.split("T")[0]
            : new Date(d.paid_date).toISOString().split("T")[0]
          : null,
        createdAt: typeof d.created_at === "string" ? d.created_at : new Date(d.created_at).toISOString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Get debts error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { type, personName, amount, description, dueDate } = await request.json()

    const debtId = generateUUID()
    await query(
      "INSERT INTO debts (id, user_id, type, person_name, amount, description, due_date, is_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [debtId, userId, type, personName, amount, description || "", dueDate || null, false],
    )

    return NextResponse.json({
      success: true,
      debt: {
        id: debtId,
        userId,
        type,
        personName,
        amount,
        description: description || "",
        dueDate: dueDate || null,
        isPaid: false,
        paidDate: null,
        createdAt: formatDateForMySQL(),
      },
    })
  } catch (error) {
    console.error("[v0] Create debt error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
