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

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (body.categoryId !== undefined) {
      updates.push("category_id = ?");
      values.push(body.categoryId);
    }
    if (body.type !== undefined) {
      updates.push("type = ?");
      values.push(body.type);
    }
    if (body.amount !== undefined) {
      updates.push("amount = ?");
      values.push(body.amount);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description || "");
    }
    if (body.frequency !== undefined) {
      updates.push("frequency = ?");
      values.push(body.frequency);
    }
    if (body.startDate !== undefined) {
      updates.push("start_date = ?");
      values.push(body.startDate);
    }
    if (body.endDate !== undefined) {
      updates.push("end_date = ?");
      values.push(body.endDate || null);
    }
    if (body.isActive !== undefined) {
      updates.push("is_active = ?");
      values.push(body.isActive);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add WHERE clause values
    values.push(id);
    values.push(userId);

    await query(
      `UPDATE recurring_transactions
       SET ${updates.join(", ")}
       WHERE id = ? AND user_id = ?`,
      values
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
