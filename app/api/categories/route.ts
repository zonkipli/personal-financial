import { type NextRequest, NextResponse } from "next/server"
import { supabase, generateUUID } from "@/lib/db"

interface CategoryRow {
  id: string
  user_id: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, user_id, name, type, color, icon, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Get categories error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      categories: (categories || []).map((c: CategoryRow) => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
        createdAt: c.created_at,
      })),
    })
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { name, type, color, icon } = await request.json()

    const categoryId = generateUUID()
    const { data, error } = await supabase
      .from("categories")
      .insert({
        id: categoryId,
        user_id: userId,
        name,
        type,
        color: color || "#6366f1",
        icon: icon || "CircleDollarSign",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Create category error:", error)
      return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      category: {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.type,
        color: data.color,
        icon: data.icon,
        createdAt: data.created_at,
      },
    })
  } catch (error) {
    console.error("[v0] Create category error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
