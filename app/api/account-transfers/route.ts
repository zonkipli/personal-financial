import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { AccountTransfer } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: transfersData, error } = await supabase
      .from('account_transfers')
      .select('id, user_id, from_account_id, to_account_id, amount, description, date, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    // Map database fields to camelCase
    const transfers = (transfersData || []).map(transfer => ({
      id: transfer.id,
      userId: transfer.user_id,
      fromAccountId: transfer.from_account_id,
      toAccountId: transfer.to_account_id,
      amount: transfer.amount,
      description: transfer.description,
      date: transfer.date,
      createdAt: transfer.created_at
    }))

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

    // Insert transfer record
    const { error: insertError } = await supabase
      .from('account_transfers')
      .insert({
        id,
        user_id: userId,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        description: description || '',
        date: transferDate
      })

    if (insertError) throw insertError

    // Update balance for "from" account (decrease)
    const { data: fromAccount, error: fromAccountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', fromAccountId)
      .maybeSingle()

    if (fromAccountError) throw fromAccountError

    if (!fromAccount) {
      throw new Error("From account not found")
    }

    const { error: updateFromError } = await supabase
      .from('accounts')
      .update({ balance: Number(fromAccount.balance) - Number(amount) })
      .eq('id', fromAccountId)

    if (updateFromError) throw updateFromError

    // Update balance for "to" account (increase)
    const { data: toAccount, error: toAccountError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', toAccountId)
      .maybeSingle()

    if (toAccountError) throw toAccountError

    if (!toAccount) {
      throw new Error("To account not found")
    }

    const { error: updateToError } = await supabase
      .from('accounts')
      .update({ balance: Number(toAccount.balance) + Number(amount) })
      .eq('id', toAccountId)

    if (updateToError) throw updateToError

    // Fetch the created transfer
    const { data: transfer, error: selectError } = await supabase
      .from('account_transfers')
      .select('id, user_id, from_account_id, to_account_id, amount, description, date, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!transfer) {
      throw new Error("Failed to retrieve created transfer")
    }

    // Map database fields to camelCase
    const formattedTransfer = {
      id: transfer.id,
      userId: transfer.user_id,
      fromAccountId: transfer.from_account_id,
      toAccountId: transfer.to_account_id,
      amount: transfer.amount,
      description: transfer.description,
      date: transfer.date,
      createdAt: transfer.created_at
    }

    return NextResponse.json(formattedTransfer, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating transfer:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
