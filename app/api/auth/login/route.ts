import { type NextRequest, NextResponse } from "next/server"
import { supabase, verifyPassword } from "@/lib/db"

interface UserRow {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email dan password harus diisi" }, { status: 400 })
    }

    // Find user
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, password_hash, created_at')
      .eq('email', email)
      .maybeSingle()

    if (error || !users) {
      return NextResponse.json({ success: false, error: "Email atau password salah" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, users.password_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Email atau password salah" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.created_at || new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server.",
      },
      { status: 500 },
    )
  }
}
