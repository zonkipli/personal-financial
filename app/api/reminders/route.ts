import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Reminder } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const upcoming = searchParams.get("upcoming") === "true"

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let sql = `
      SELECT
        id, user_id as userId, title, description, amount,
        due_date as dueDate, reminder_date as reminderDate,
        type, related_id as relatedId, is_completed as isCompleted,
        created_at as createdAt
      FROM reminders
      WHERE user_id = ? AND is_completed = false
    `

    if (upcoming) {
      sql += ` AND reminder_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    }

    sql += ` ORDER BY reminder_date ASC`

    const reminders = await query<Reminder[]>(sql, [userId])

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

    await query(
      `INSERT INTO reminders
       (id, user_id, title, description, amount, due_date, reminder_date, type, related_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, title, description || '', amount || 0,
        dueDate, reminderDate, type, relatedId || null
      ]
    )

    const [reminder] = await query<Reminder[]>(
      `SELECT
        id, user_id as userId, title, description, amount,
        due_date as dueDate, reminder_date as reminderDate,
        type, related_id as relatedId, is_completed as isCompleted,
        created_at as createdAt
      FROM reminders
      WHERE id = ?`,
      [id]
    )

    return NextResponse.json(reminder, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating reminder:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
