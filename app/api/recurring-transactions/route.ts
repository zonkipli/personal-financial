import { NextRequest, NextResponse } from "next/server";
import { query, generateUUID, formatDateForMySQL } from "@/lib/db";
import type { RecurringTransaction } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recurring = await query<any[]>(
      "SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    // Map snake_case to camelCase and ensure numeric fields
    const formattedRecurring = recurring.map(r => ({
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
    const now = formatDateForMySQL();

    await query(
      `INSERT INTO recurring_transactions
       (id, user_id, category_id, type, amount, description, frequency, start_date, end_date, is_active, last_processed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true, NULL, ?)`,
      [
        id,
        userId,
        categoryId,
        type,
        amount,
        description || "",
        frequency,
        startDate,
        endDate || null,
        now,
      ]
    );

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
