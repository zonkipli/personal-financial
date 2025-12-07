import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Tag } from "@/types"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, color } = body

    await query(
      `UPDATE tags SET name = ?, color = ? WHERE id = ?`,
      [name, color, id]
    )

    const [tag] = await query<Tag[]>(
      `SELECT id, user_id as userId, name, color, created_at as createdAt
       FROM tags
       WHERE id = ?`,
      [id]
    )

    return NextResponse.json(tag)
  } catch (error: unknown) {
    console.error("Error updating tag:", error)
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

    await query("DELETE FROM tags WHERE id = ?", [id])

    return NextResponse.json({ message: "Tag deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting tag:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
