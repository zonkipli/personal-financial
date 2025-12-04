import { type NextRequest, NextResponse } from "next/server"
import { query, verifyPassword } from "@/lib/db"

interface UserRow {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: Date
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email dan password harus diisi" }, { status: 400 })
    }

    // Find user
    const users = await query<UserRow[]>(
      "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?",
      [email],
    )

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Email atau password salah" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Email atau password salah" }, { status: 401 })
    }

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
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server. Pastikan database MySQL sudah di-setup dengan benar.",
      },
      { status: 500 },
    )
  }
}
