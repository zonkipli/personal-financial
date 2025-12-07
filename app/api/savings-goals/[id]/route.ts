import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

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

    // Build dynamic update object based on provided fields
    const updates: Record<string, any> = {};

    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.targetAmount !== undefined) {
      updates.target_amount = body.targetAmount;
    }
    if (body.currentAmount !== undefined) {
      updates.current_amount = body.currentAmount;
    }
    if (body.deadline !== undefined) {
      updates.deadline = body.deadline || null;
    }
    if (body.description !== undefined) {
      updates.description = body.description || "";
    }
    if (body.isCompleted !== undefined) {
      updates.is_completed = body.isCompleted;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("savings_goals")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating savings goal:", error);
      return NextResponse.json(
        { error: "Failed to update savings goal" },
        { status: 500 }
      );
    }

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

    const { error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id", params.id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting savings goal:", error);
      return NextResponse.json(
        { error: "Failed to delete savings goal" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    return NextResponse.json(
      { error: "Failed to delete savings goal" },
      { status: 500 }
    );
  }
}
