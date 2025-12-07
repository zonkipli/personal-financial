import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isCompleted } = body

    await query(
      `UPDATE reminders SET is_completed = ? WHERE id = ?`,
      [isCompleted, id]
    )

    return NextResponse.json({ message: "Reminder updated successfully" })
  } catch (error: unknown) {
    console.error("Error updating reminder:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await query("DELETE FROM reminders WHERE id = ?", [id])

    return NextResponse.json({ message: "Reminder deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
