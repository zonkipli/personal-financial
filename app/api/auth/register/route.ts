import { type NextRequest, NextResponse } from "next/server"
import { query, generateUUID, hashPassword } from "@/lib/db"

interface UserRow {
  id: string
  email: string
  name: string
  created_at: Date
}

const defaultCategories = [
  // Income
  { name: "Gaji", type: "income", color: "#22c55e", icon: "Wallet" },
  { name: "Bonus", type: "income", color: "#10b981", icon: "Gift" },
  { name: "Investasi", type: "income", color: "#14b8a6", icon: "TrendingUp" },
  { name: "Lainnya", type: "income", color: "#06b6d4", icon: "Plus" },
  // Expense
  { name: "Makanan", type: "expense", color: "#ef4444", icon: "Utensils" },
  { name: "Transportasi", type: "expense", color: "#f97316", icon: "Car" },
  { name: "Belanja", type: "expense", color: "#f59e0b", icon: "ShoppingBag" },
  { name: "Tagihan", type: "expense", color: "#eab308", icon: "Receipt" },
  { name: "Hiburan", type: "expense", color: "#84cc16", icon: "Gamepad2" },
  { name: "Kesehatan", type: "expense", color: "#ec4899", icon: "Heart" },
  { name: "Pendidikan", type: "expense", color: "#8b5cf6", icon: "GraduationCap" },
  { name: "Lainnya", type: "expense", color: "#6b7280", icon: "MoreHorizontal" },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "Semua field harus diisi" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password minimal 6 karakter" }, { status: 400 })
    }

    // Check if email exists
    const existingUsers = await query<UserRow[]>("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, error: "Email sudah terdaftar" }, { status: 400 })
    }

    // Create user
    const userId = generateUUID()
    const passwordHash = await hashPassword(password)

    await query("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)", [
      userId,
      email,
      name,
      passwordHash,
    ])

    // Create default categories
    for (const cat of defaultCategories) {
      const catId = generateUUID()
      await query("INSERT INTO categories (id, user_id, name, type, color, icon) VALUES (?, ?, ?, ?, ?, ?)", [
        catId,
        userId,
        cat.name,
        cat.type,
        cat.color,
        cat.icon,
      ])
    }

    // Fetch created user
    const users = await query<UserRow[]>("SELECT id, email, name, created_at FROM users WHERE id = ?", [userId])

    const user = users[0]

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Register error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server. Pastikan database MySQL sudah di-setup dengan benar.",
      },
      { status: 500 },
    )
  }
}
