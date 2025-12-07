import { type NextRequest, NextResponse } from "next/server"
import { query, generateUUID, formatDateForMySQL } from "@/lib/db"

interface CategoryRow {
  id: string
  user_id: string
  name: string
  type: "income" | "expense"
  color: string
  icon: string
  created_at: Date | string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const categories = await query<CategoryRow[]>(
      "SELECT id, user_id, name, type, color, icon, created_at FROM categories WHERE user_id = ? ORDER BY created_at ASC",
      [userId],
    )

    return NextResponse.json({
      success: true,
      categories: categories.map((c) => ({
        id: c.id,
        userId: c.user_id,
        name: c.name,
        type: c.type,
        color: c.color,
        icon: c.icon,
        createdAt: typeof c.created_at === "string" ? c.created_at : new Date(c.created_at).toISOString(),
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
    await query("INSERT INTO categories (id, user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?, ?)", [
      categoryId,
      userId,
      name,
      type,
      color || "#6366f1",
      icon || "CircleDollarSign",
    ])

    return NextResponse.json({
      success: true,
      category: {
        id: categoryId,
        userId,
        name,
        type,
        color: color || "#6366f1",
        icon: icon || "CircleDollarSign",
        createdAt: formatDateForMySQL(),
      },
    })
  } catch (error) {
    console.error("[v0] Create category error:", error)
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
