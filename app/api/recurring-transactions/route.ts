import { NextRequest, NextResponse } from "next/server";
import { query, generateUUID, formatDateForMySQL } from "@/lib/db";
import type { RecurringTransaction } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recurring = await query<RecurringTransaction[]>(
      "SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    // Ensure numeric fields are numbers, not strings
    const formattedRecurring = recurring.map(r => ({
      ...r,
      amount: Number(r.amount) || 0,
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
