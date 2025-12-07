import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Account } from "@/types"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [account] = await query<Account[]>(
      `SELECT
        id, user_id as userId, name, type, balance, currency, color, icon,
        is_active as isActive, created_at as createdAt
      FROM accounts
      WHERE id = ?`,
      [id]
    )

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error: unknown) {
    console.error("Error fetching account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, balance, currency, color, icon, isActive } = body

    await query(
      `UPDATE accounts
       SET name = ?, type = ?, balance = ?, currency = ?, color = ?, icon = ?, is_active = ?
       WHERE id = ?`,
      [name, type, balance, currency, color, icon, isActive, id]
    )

    const [account] = await query<Account[]>(
      `SELECT
        id, user_id as userId, name, type, balance, currency, color, icon,
        is_active as isActive, created_at as createdAt
      FROM accounts
      WHERE id = ?`,
      [id]
    )

    return NextResponse.json(account)
  } catch (error: unknown) {
    console.error("Error updating account:", error)
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

    // Soft delete: set is_active to false
    await query("UPDATE accounts SET is_active = false WHERE id = ?", [id])

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
