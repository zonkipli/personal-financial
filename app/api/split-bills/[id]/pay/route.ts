import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { participantId } = body

    if (!participantId) {
      return NextResponse.json(
        { error: "participantId is required" },
        { status: 400 }
      )
    }

    const paidDate = new Date().toISOString().split('T')[0]

    await query(
      `UPDATE split_bill_participants
       SET is_paid = true, paid_date = ?
       WHERE id = ?`,
      [paidDate, participantId]
    )

    return NextResponse.json({ message: "Payment recorded successfully" })
  } catch (error: unknown) {
    console.error("Error recording payment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
