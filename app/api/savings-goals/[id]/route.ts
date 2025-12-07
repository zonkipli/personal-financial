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
    const { name, targetAmount, currentAmount, deadline, description, isCompleted } = body;

    await query(
      `UPDATE savings_goals
       SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, description = ?, is_completed = ?
       WHERE id = ? AND user_id = ?`,
      [
        name,
        targetAmount,
        currentAmount,
        deadline || null,
        description || "",
        isCompleted || false,
        params.id,
        userId,
      ]
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
