import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { categoryId, type, amount, description, date } = await request.json()

    const { error } = await supabase
      .from("transactions")
      .update({
        category_id: categoryId,
        type,
        amount,
        description,
        date,
      })
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Update transaction error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

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
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Delete transaction error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
