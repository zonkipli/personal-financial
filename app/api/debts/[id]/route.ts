import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { type, personName, amount, description, dueDate, isPaid, paidDate } = await request.json()

    const { error } = await supabase
      .from("debts")
      .update({
        type,
        person_name: personName,
        amount,
        description,
        due_date: dueDate || null,
        is_paid: isPaid,
        paid_date: paidDate || null,
      })
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Update debt error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

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

    const { error } = await supabase
      .from("debts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Delete debt error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete debt error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
