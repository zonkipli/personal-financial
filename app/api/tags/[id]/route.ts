import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Tag } from "@/types"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, color } = body

    const { error: updateError } = await supabase
      .from('tags')
      .update({
        name,
        color
      })
      .eq('id', id)

    if (updateError) throw updateError

    const { data: tag, error: selectError } = await supabase
      .from('tags')
      .select('id, user_id, name, color, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!tag) {
      throw new Error("Tag not found")
    }

    // Map database fields to camelCase
    const formattedTag = {
      id: tag.id,
      userId: tag.user_id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at
    }

    return NextResponse.json(formattedTag)
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

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: "Tag deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting tag:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
