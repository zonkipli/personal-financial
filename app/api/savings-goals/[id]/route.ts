import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      updates.push("name = ?");
      values.push(body.name);
    }
    if (body.targetAmount !== undefined) {
      updates.push("target_amount = ?");
      values.push(body.targetAmount);
    }
    if (body.currentAmount !== undefined) {
      updates.push("current_amount = ?");
      values.push(body.currentAmount);
    }
    if (body.deadline !== undefined) {
      updates.push("deadline = ?");
      values.push(body.deadline || null);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description || "");
    }
    if (body.isCompleted !== undefined) {
      updates.push("is_completed = ?");
      values.push(body.isCompleted);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // Add WHERE clause values
    values.push(params.id);
    values.push(userId);

    await query(
      `UPDATE savings_goals
       SET ${updates.join(", ")}
       WHERE id = ? AND user_id = ?`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating savings goal:", error);
    return NextResponse.json(
      { error: "Failed to update savings goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await query(
      "DELETE FROM savings_goals WHERE id = ? AND user_id = ?",
      [params.id, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    return NextResponse.json(
      { error: "Failed to delete savings goal" },
      { status: 500 }
    );
  }
}
