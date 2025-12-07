import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

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

    // Build dynamic update object based on provided fields
    const updates: Record<string, any> = {};

    if (body.categoryId !== undefined) {
      updates.category_id = body.categoryId;
    }
    if (body.type !== undefined) {
      updates.type = body.type;
    }
    if (body.amount !== undefined) {
      updates.amount = body.amount;
    }
    if (body.description !== undefined) {
      updates.description = body.description || "";
    }
    if (body.frequency !== undefined) {
      updates.frequency = body.frequency;
    }
    if (body.startDate !== undefined) {
      updates.start_date = body.startDate;
    }
    if (body.endDate !== undefined) {
      updates.end_date = body.endDate || null;
    }
    if (body.isActive !== undefined) {
      updates.is_active = body.isActive;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("recurring_transactions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

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

    const { error } = await supabase
      .from("recurring_transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete recurring transaction" },
      { status: 500 }
    );
  }
}
