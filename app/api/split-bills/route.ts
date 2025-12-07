import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { SplitBill, SplitBillParticipant } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const bills = await query<SplitBill[]>(
      `SELECT
        id, user_id as userId, transaction_id as transactionId,
        title, total_amount as totalAmount, created_at as createdAt
      FROM split_bills
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [userId]
    )

    // Get participants for each bill
    const billsWithParticipants = await Promise.all(
      bills.map(async (bill) => {
        const participants = await query<SplitBillParticipant[]>(
          `SELECT
            id, split_bill_id as splitBillId, name, amount,
            is_paid as isPaid, paid_date as paidDate
          FROM split_bill_participants
          WHERE split_bill_id = ?`,
          [bill.id]
        )
        return { ...bill, participants }
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

    await query(
      `INSERT INTO split_bills (id, user_id, transaction_id, title, total_amount)
       VALUES (?, ?, ?, ?, ?)`,
      [billId, userId, transactionId || null, title, totalAmount]
    )

    // Insert participants
    for (const participant of participants) {
      const participantId = crypto.randomUUID()
      await query(
        `INSERT INTO split_bill_participants (id, split_bill_id, name, amount)
         VALUES (?, ?, ?, ?)`,
        [participantId, billId, participant.name, participant.amount]
      )
    }

    const [bill] = await query<SplitBill[]>(
      `SELECT
        id, user_id as userId, transaction_id as transactionId,
        title, total_amount as totalAmount, created_at as createdAt
      FROM split_bills
      WHERE id = ?`,
      [billId]
    )

    const billParticipants = await query<SplitBillParticipant[]>(
      `SELECT
        id, split_bill_id as splitBillId, name, amount,
        is_paid as isPaid, paid_date as paidDate
      FROM split_bill_participants
      WHERE split_bill_id = ?`,
      [billId]
    )

    return NextResponse.json({ ...bill, participants: billParticipants }, { status: 201 })
  } catch (error: unknown) {
    console.error("Error creating split bill:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
