import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Investment } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: investmentsData, error } = await supabase
      .from('investments')
      .select('id, user_id, name, type, symbol, quantity, buy_price, current_price, currency, purchase_date, notes, created_at')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false })

    if (error) throw error

    // Map database fields to camelCase
    const investments = (investmentsData || []).map(inv => ({
      id: inv.id,
      userId: inv.user_id,
      name: inv.name,
      type: inv.type,
      symbol: inv.symbol,
      quantity: inv.quantity,
      buyPrice: inv.buy_price,
      currentPrice: inv.current_price,
      currency: inv.currency,
      purchaseDate: inv.purchase_date,
      notes: inv.notes,
      createdAt: inv.created_at
    }))

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

    const { error: insertError } = await supabase
      .from('investments')
      .insert({
        id,
        user_id: userId,
        name,
        type,
        symbol: symbol || '',
        quantity: quantity || 0,
        buy_price: buyPrice,
        current_price: currentPrice,
        currency: currency || 'IDR',
        purchase_date: purchaseDate,
        notes: notes || ''
      })

    if (insertError) throw insertError

    const { data: investment, error: selectError } = await supabase
      .from('investments')
      .select('id, user_id, name, type, symbol, quantity, buy_price, current_price, currency, purchase_date, notes, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!investment) {
      throw new Error("Failed to retrieve created investment")
    }

    // Map database fields to camelCase
    const formattedInvestment = {
      id: investment.id,
      userId: investment.user_id,
      name: investment.name,
      type: investment.type,
      symbol: investment.symbol,
      quantity: investment.quantity,
      buyPrice: investment.buy_price,
      currentPrice: investment.current_price,
      currency: investment.currency,
      purchaseDate: investment.purchase_date,
      notes: investment.notes,
      createdAt: investment.created_at
    }

    return NextResponse.json(formattedInvestment, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating investment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
