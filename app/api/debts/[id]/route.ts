import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { type, personName, amount, description, dueDate, isPaid, paidDate } = await request.json()

    await query(
      "UPDATE debts SET type = ?, person_name = ?, amount = ?, description = ?, due_date = ?, is_paid = ?, paid_date = ? WHERE id = ? AND user_id = ?",
      [type, personName, amount, description, dueDate || null, isPaid ? 1 : 0, paidDate || null, id, userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update debt error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await query("DELETE FROM debts WHERE id = ? AND user_id = ?", [id, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete debt error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
