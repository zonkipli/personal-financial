import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Tag } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const tags = await query<Tag[]>(
      `SELECT id, user_id as userId, name, color, created_at as createdAt
       FROM tags
       WHERE user_id = ?
       ORDER BY name ASC`,
      [userId]
    )

    return NextResponse.json(tags)
  } catch (error: unknown) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, color } = body

    if (!userId || !name) {
      return NextResponse.json(
        { error: "userId and name are required" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    await query(
      `INSERT INTO tags (id, user_id, name, color)
       VALUES (?, ?, ?, ?)`,
      [id, userId, name, color || '#8b5cf6']
    )

    const [tag] = await query<Tag[]>(
      `SELECT id, user_id as userId, name, color, created_at as createdAt
       FROM tags
       WHERE id = ?`,
      [id]
    )

    return NextResponse.json(tag, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating tag:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
