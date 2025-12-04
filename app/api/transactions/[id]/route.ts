import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { categoryId, type, amount, description, date } = await request.json()

    await query(
      "UPDATE transactions SET category_id = ?, type = ?, amount = ?, description = ?, date = ? WHERE id = ? AND user_id = ?",
      [categoryId, type, amount, description, date, id, userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update transaction error:", error)
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
    await query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [id, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
