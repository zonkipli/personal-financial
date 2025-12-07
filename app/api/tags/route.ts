import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Tag } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: tagsData, error } = await supabase
      .from('tags')
      .select('id, user_id, name, color, created_at')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error

    // Map database fields to camelCase
    const tags = (tagsData || []).map(tag => ({
      id: tag.id,
      userId: tag.user_id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at
    }))

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

    const { error: insertError } = await supabase
      .from('tags')
      .insert({
        id,
        user_id: userId,
        name,
        color: color || '#8b5cf6'
      })

    if (insertError) throw insertError

    const { data: tag, error: selectError } = await supabase
      .from('tags')
      .select('id, user_id, name, color, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!tag) {
      throw new Error("Failed to retrieve created tag")
    }

    // Map database fields to camelCase
    const formattedTag = {
      id: tag.id,
      userId: tag.user_id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.created_at
    }

    return NextResponse.json(formattedTag, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating tag:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
