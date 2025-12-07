import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      categoryId,
      type,
      amount,
      description,
      frequency,
      startDate,
      endDate,
      isActive,
    } = body;

    await query(
      `UPDATE recurring_transactions
       SET category_id = ?, type = ?, amount = ?, description = ?, frequency = ?,
           start_date = ?, end_date = ?, is_active = ?
       WHERE id = ? AND user_id = ?`,
      [
        categoryId,
        type,
        amount,
        description || "",
        frequency,
        startDate,
        endDate || null,
        isActive ?? true,
        id,
        userId,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating recurring transaction:", error);
    return NextResponse.json(
      { error: "Failed to update recurring transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await query(
      "DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring transaction" },
      { status: 500 }
    );
  }
}
