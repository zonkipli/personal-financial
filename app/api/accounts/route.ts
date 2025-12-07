import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Account } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('id, user_id, name, type, balance, currency, color, icon, is_active, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Map database fields to camelCase
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      userId: account.user_id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color,
      icon: account.icon,
      isActive: account.is_active,
      createdAt: account.created_at
    }))

    // Calculate total balance in IDR
    const totalBalance = formattedAccounts.reduce((sum, account) => {
      if (account.currency === 'IDR') {
        return sum + Number(account.balance)
      }
      return sum
    }, 0)

    return NextResponse.json({
      accounts: formattedAccounts,
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

    const { error: insertError } = await supabase
      .from('accounts')
      .insert({
        id,
        user_id: userId,
        name,
        type,
        balance: balance || 0,
        currency: currency || 'IDR',
        color: color || '#10b981',
        icon: icon || 'Wallet'
      })

    if (insertError) throw insertError

    const { data: account, error: selectError } = await supabase
      .from('accounts')
      .select('id, user_id, name, type, balance, currency, color, icon, is_active, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!account) {
      throw new Error("Failed to retrieve created account")
    }

    // Map database fields to camelCase
    const formattedAccount = {
      id: account.id,
      userId: account.user_id,
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
      color: account.color,
      icon: account.icon,
      isActive: account.is_active,
      createdAt: account.created_at
    }

    return NextResponse.json(formattedAccount, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
