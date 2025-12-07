import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { AccountTransfer } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const transfers = await query<AccountTransfer[]>(
      `SELECT
        id, user_id as userId, from_account_id as fromAccountId,
        to_account_id as toAccountId, amount, description, date,
        created_at as createdAt
      FROM account_transfers
      WHERE user_id = ?
      ORDER BY date DESC, created_at DESC`,
      [userId]
    )

    return NextResponse.json(transfers)
  } catch (error: unknown) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, fromAccountId, toAccountId, amount, description, date } = body

    if (!userId || !fromAccountId || !toAccountId || !amount) {
      return NextResponse.json(
        { error: "userId, fromAccountId, toAccountId, and amount are required" },
        { status: 400 }
      )
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: "Cannot transfer to the same account" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()
    const transferDate = date || new Date().toISOString().split('T')[0]

    // Start transaction
    await query("START TRANSACTION")

    try {
      // Insert transfer record
      await query(
        `INSERT INTO account_transfers (id, user_id, from_account_id, to_account_id, amount, description, date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, fromAccountId, toAccountId, amount, description || '', transferDate]
      )

      // Update balances
      await query(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        [amount, fromAccountId]
      )

      await query(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [amount, toAccountId]
      )

      await query("COMMIT")

      const [transfer] = await query<AccountTransfer[]>(
        `SELECT
          id, user_id as userId, from_account_id as fromAccountId,
          to_account_id as toAccountId, amount, description, date,
          created_at as createdAt
        FROM account_transfers
        WHERE id = ?`,
        [id]
      )

      return NextResponse.json(transfer, { status: 201 })
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }
  } catch (error: unknown) {
    console.error("Error creating transfer:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
