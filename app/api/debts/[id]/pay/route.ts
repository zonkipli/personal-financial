import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const today = new Date().toISOString().split("T")[0]

    await query("UPDATE debts SET is_paid = 1, paid_date = ? WHERE id = ? AND user_id = ?", [today, id, userId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark debt as paid error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
