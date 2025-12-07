import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, amount, dueDate, reminderDate, type, isCompleted } = body

    let error

    if (isCompleted !== undefined) {
      const result = await supabase
        .from("reminders")
        .update({ is_completed: isCompleted })
        .eq("id", id)
      error = result.error
    } else {
      const result = await supabase
        .from("reminders")
        .update({
          title,
          description,
          amount,
          due_date: dueDate,
          reminder_date: reminderDate,
          type
        })
        .eq("id", id)
      error = result.error
    }

    if (error) {
      throw error
    }

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

    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: "Reminder deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
