import { type NextRequest, NextResponse } from "next/server"
import { supabase, generateUUID } from "@/lib/db"

interface DebtRow {
  id: string
  user_id: string
  type: "receivable" | "payable"
  person_name: string
  amount: number
  description: string
  due_date: string | null
  is_paid: boolean
  paid_date: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: debts, error } = await supabase
      .from("debts")
      .select("id, user_id, type, person_name, amount, description, due_date, is_paid, paid_date, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Get debts error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      debts: (debts || []).map((d) => ({
        id: d.id,
        userId: d.user_id,
        type: d.type,
        personName: d.person_name,
        amount: Number(d.amount),
        description: d.description,
        dueDate: d.due_date ? d.due_date.split("T")[0] : null,
        isPaid: Boolean(d.is_paid),
        paidDate: d.paid_date ? d.paid_date.split("T")[0] : null,
        createdAt: d.created_at,
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
    const now = new Date().toISOString()

    const { error } = await supabase
      .from("debts")
      .insert({
        id: debtId,
        user_id: userId,
        type,
        person_name: personName,
        amount,
        description: description || "",
        due_date: dueDate || null,
        is_paid: false,
      })

    if (error) {
      console.error("[v0] Create debt error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

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
        createdAt: now,
      },
    })
  } catch (error) {
    console.error("[v0] Create debt error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
