import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import type { SplitBill, SplitBillParticipant } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { data: billsData, error } = await supabase
      .from('split_bills')
      .select('id, user_id, transaction_id, title, total_amount, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get participants for each bill
    const billsWithParticipants = await Promise.all(
      (billsData || []).map(async (bill) => {
        const { data: participantsData, error: participantsError } = await supabase
          .from('split_bill_participants')
          .select('id, split_bill_id, name, amount, is_paid, paid_date')
          .eq('split_bill_id', bill.id)

        if (participantsError) throw participantsError

        // Map participants to camelCase
        const participants = (participantsData || []).map(p => ({
          id: p.id,
          splitBillId: p.split_bill_id,
          name: p.name,
          amount: p.amount,
          isPaid: p.is_paid,
          paidDate: p.paid_date
        }))

        // Map bill to camelCase
        return {
          id: bill.id,
          userId: bill.user_id,
          transactionId: bill.transaction_id,
          title: bill.title,
          totalAmount: bill.total_amount,
          createdAt: bill.created_at,
          participants
        }
      })
    )

    return NextResponse.json(billsWithParticipants)
  } catch (error: unknown) {
    console.error("Error fetching split bills:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, totalAmount, participants, transactionId } = body

    if (!userId || !title || !totalAmount || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const billId = crypto.randomUUID()

    const { error: insertError } = await supabase
      .from('split_bills')
      .insert({
        id: billId,
        user_id: userId,
        transaction_id: transactionId || null,
        title,
        total_amount: totalAmount
      })

    if (insertError) throw insertError

    // Insert participants
    const participantInserts = participants.map((participant: { name: string; amount: number }) => ({
      id: crypto.randomUUID(),
      split_bill_id: billId,
      name: participant.name,
      amount: participant.amount
    }))

    const { error: participantsError } = await supabase
      .from('split_bill_participants')
      .insert(participantInserts)

    if (participantsError) throw participantsError

    const { data: bill, error: selectError } = await supabase
      .from('split_bills')
      .select('id, user_id, transaction_id, title, total_amount, created_at')
      .eq('id', billId)
      .maybeSingle()

    if (selectError) throw selectError

    if (!bill) {
      throw new Error("Failed to retrieve created split bill")
    }

    const { data: billParticipantsData, error: participantsSelectError } = await supabase
      .from('split_bill_participants')
      .select('id, split_bill_id, name, amount, is_paid, paid_date')
      .eq('split_bill_id', billId)

    if (participantsSelectError) throw participantsSelectError

    // Map to camelCase
    const formattedBill = {
      id: bill.id,
      userId: bill.user_id,
      transactionId: bill.transaction_id,
      title: bill.title,
      totalAmount: bill.total_amount,
      createdAt: bill.created_at,
      participants: (billParticipantsData || []).map(p => ({
        id: p.id,
        splitBillId: p.split_bill_id,
        name: p.name,
        amount: p.amount,
        isPaid: p.is_paid,
        paidDate: p.paid_date
      }))
    }

    return NextResponse.json(formattedBill, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating split bill:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
