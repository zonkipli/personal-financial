import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Reminder } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const upcoming = searchParams.get("upcoming") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let query = supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_completed", false)

    if (upcoming) {
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      query = query.lte("reminder_date", sevenDaysFromNow.toISOString().split('T')[0])
    }

    const { data, error } = await query.order("reminder_date", { ascending: true })

    if (error) {
      throw error
    }

    // Map snake_case to camelCase
    const reminders: Reminder[] = (data || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      description: r.description,
      amount: r.amount,
      dueDate: r.due_date,
      reminderDate: r.reminder_date,
      type: r.type,
      relatedId: r.related_id,
      isCompleted: r.is_completed,
      createdAt: r.created_at,
    }))

    return NextResponse.json(reminders)
  } catch (error: unknown) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId, title, description, amount, dueDate,
      reminderDate, type, relatedId
    } = body

    if (!userId || !title || !dueDate || !reminderDate || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    const { data, error } = await supabase
      .from("reminders")
      .insert({
        id,
        user_id: userId,
        title,
        description: description || '',
        amount: amount || 0,
        due_date: dueDate,
        reminder_date: reminderDate,
        type,
        related_id: relatedId || null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Map snake_case to camelCase
    const reminder: Reminder = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      amount: data.amount,
      dueDate: data.due_date,
      reminderDate: data.reminder_date,
      type: data.type,
      relatedId: data.related_id,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
    }

    return NextResponse.json(reminder, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating reminder:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
