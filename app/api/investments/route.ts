import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { Investment } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const investments = await query<Investment[]>(
      `SELECT
        id, user_id as userId, name, type, symbol, quantity,
        buy_price as buyPrice, current_price as currentPrice,
        currency, purchase_date as purchaseDate, notes,
        created_at as createdAt
      FROM investments
      WHERE user_id = ?
      ORDER BY purchase_date DESC`,
      [userId]
    )

    // Calculate totals
    const totalValue = investments.reduce((sum, inv) => {
      return sum + (Number(inv.currentPrice) * Number(inv.quantity))
    }, 0)

    const totalGainLoss = investments.reduce((sum, inv) => {
      const gain = (Number(inv.currentPrice) - Number(inv.buyPrice)) * Number(inv.quantity)
      return sum + gain
    }, 0)

    return NextResponse.json({
      investments,
      totalValue,
      totalGainLoss,
      totalGainLossPercentage: totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0
    })
  } catch (error: unknown) {
    console.error("Error fetching investments:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId, name, type, symbol, quantity, buyPrice,
      currentPrice, currency, purchaseDate, notes
    } = body

    if (!userId || !name || !type || !buyPrice || !currentPrice || !purchaseDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const id = crypto.randomUUID()

    await query(
      `INSERT INTO investments
       (id, user_id, name, type, symbol, quantity, buy_price, current_price, currency, purchase_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, name, type, symbol || '', quantity || 0,
        buyPrice, currentPrice, currency || 'IDR', purchaseDate, notes || ''
      ]
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

    return NextResponse.json(investment, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating investment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
