import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Investment } from "@/types"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { currentPrice, quantity, notes } = body

    const { error: updateError } = await supabase
      .from('investments')
      .update({
        current_price: currentPrice,
        quantity,
        notes
      })
      .eq('id', id)

    if (updateError) throw updateError

    const { data: investment, error: selectError } = await supabase
      .from('investments')
      .select('id, user_id, name, type, symbol, quantity, buy_price, current_price, currency, purchase_date, notes, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!investment) {
      throw new Error("Investment not found")
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

    return NextResponse.json(formattedInvestment)
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

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: "Investment deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting investment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
