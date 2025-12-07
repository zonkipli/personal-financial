import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { Account } from "@/types"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: account, error } = await supabase
      .from('accounts')
      .select('id, user_id, name, type, balance, currency, color, icon, is_active, created_at')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
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

    return NextResponse.json(formattedAccount)
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

    const { error: updateError } = await supabase
      .from('accounts')
      .update({
        name,
        type,
        balance,
        currency,
        color,
        icon,
        is_active: isActive
      })
      .eq('id', id)

    if (updateError) throw updateError

    const { data: account, error: selectError } = await supabase
      .from('accounts')
      .select('id, user_id, name, type, balance, currency, color, icon, is_active, created_at')
      .eq('id', id)
      .maybeSingle()

    if (selectError) throw selectError

    if (!account) {
      throw new Error("Failed to retrieve updated account")
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

    return NextResponse.json(formattedAccount)
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
    const { error } = await supabase
      .from('accounts')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: "Account deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
