import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Account } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const accounts = await query<Account[]>(
      `SELECT
        id, user_id as userId, name, type, balance, currency, color, icon,
        is_active as isActive, created_at as createdAt
      FROM accounts
      WHERE user_id = ? AND is_active = true
      ORDER BY created_at DESC`,
      [userId]
    )

    // Calculate total balance in IDR
    const totalBalance = accounts.reduce((sum, account) => {
      if (account.currency === 'IDR') {
        return sum + Number(account.balance)
      }
      return sum
    }, 0)

    return NextResponse.json({
      accounts,
      totalBalance
    })
  } catch (error: unknown) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, name, type, balance, currency, color, icon } = body

    if (!userId || !name || !type) {
      return NextResponse.json(
        { error: "userId, name, and type are required" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    await query(
      `INSERT INTO accounts (id, user_id, name, type, balance, currency, color, icon)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        name,
        type,
        balance || 0,
        currency || 'IDR',
        color || '#10b981',
        icon || 'Wallet'
      ]
    )

    const [account] = await query<Account[]>(
      `SELECT
        id, user_id as userId, name, type, balance, currency, color, icon,
        is_active as isActive, created_at as createdAt
      FROM accounts
      WHERE id = ?`,
      [id]
    )

    return NextResponse.json(account, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
