import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Investment } from "@/types"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { currentPrice, quantity, notes } = body

    await query(
      `UPDATE investments
       SET current_price = ?, quantity = ?, notes = ?
       WHERE id = ?`,
      [currentPrice, quantity, notes, id]
    )

    const [investment] = await query<Investment[]>(
      `SELECT
        id, user_id as userId, name, type, symbol, quantity,
        buy_price as buyPrice, current_price as currentPrice,
        currency, purchase_date as purchaseDate, notes,
        created_at as createdAt
      FROM investments
      WHERE id = ?`,
      [id]
    )

    return NextResponse.json(investment)
  } catch (error: unknown) {
    console.error("Error updating investment:", error)
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

    await query("DELETE FROM investments WHERE id = ?", [id])

    return NextResponse.json({ message: "Investment deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting investment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
