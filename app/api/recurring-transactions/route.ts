import { NextRequest, NextResponse } from "next/server";
import { supabase, generateUUID } from "@/lib/db";
import type { RecurringTransaction } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: recurring, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Map snake_case to camelCase and ensure numeric fields
    const formattedRecurring = (recurring || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      categoryId: r.category_id,
      type: r.type,
      amount: Number(r.amount) || 0,
      description: r.description,
      frequency: r.frequency,
      startDate: r.start_date,
      endDate: r.end_date,
      isActive: Boolean(r.is_active),
      lastProcessed: r.last_processed,
      createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
    }));

    return NextResponse.json(formattedRecurring);
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      type,
      amount,
      description,
      frequency,
      startDate,
      endDate,
    } = body;

    if (!categoryId || !type || amount === undefined || !frequency || !startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = generateUUID();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("recurring_transactions")
      .insert({
        id,
        user_id: userId,
        category_id: categoryId,
        type,
        amount,
        description: description || "",
        frequency,
        start_date: startDate,
        end_date: endDate || null,
        is_active: true,
        last_processed: null,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const newRecurring: RecurringTransaction = {
      id,
      userId,
      categoryId,
      type,
      amount,
      description: description || "",
      frequency,
      startDate,
      endDate: endDate || null,
      isActive: true,
      lastProcessed: null,
      createdAt: now,
    };

    return NextResponse.json(newRecurring, { status: 201 });
  } catch (error) {
    console.error("Error creating recurring transaction:", error);
    return NextResponse.json(
      { error: "Failed to create recurring transaction" },
      { status: 500 }
    );
  }
}
