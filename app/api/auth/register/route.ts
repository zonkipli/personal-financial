import { type NextRequest, NextResponse } from "next/server"
import { supabase, generateUUID, hashPassword } from "@/lib/db"

interface UserRow {
  id: string
  email: string
  name: string
  created_at: string
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
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUsers) {
      return NextResponse.json({ success: false, error: "Email sudah terdaftar" }, { status: 400 })
    }

    // Create user
    const userId = generateUUID()
    const passwordHash = await hashPassword(password)

    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        password_hash: passwordHash
      })

    if (userError) {
      throw userError
    }

    // Create default categories
    const categoriesToInsert = defaultCategories.map(cat => ({
      id: generateUUID(),
      user_id: userId,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon
    }))

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)

    if (categoriesError) {
      console.error('Error creating categories:', categoriesError)
    }

    // Fetch created user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at || new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Register error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server.",
      },
      { status: 500 },
    )
  }
}
