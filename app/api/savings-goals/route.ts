import { NextRequest, NextResponse } from "next/server";
import { query, generateUUID, formatDateForMySQL } from "@/lib/db";
import type { SavingsGoal } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await query<SavingsGoal[]>(
      "SELECT * FROM savings_goals WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    return NextResponse.json(goals);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings goals" },
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
    const { name, targetAmount, currentAmount, deadline, description } = body;

    if (!name || targetAmount === undefined) {
      return NextResponse.json(
        { error: "Name and target amount are required" },
        { status: 400 }
      );
    }

    const id = generateUUID();
    const now = formatDateForMySQL();

    await query(
      `INSERT INTO savings_goals
       (id, user_id, name, target_amount, current_amount, deadline, description, is_completed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, false, ?)`,
      [
        id,
        userId,
        name,
        targetAmount,
        currentAmount || 0,
        deadline || null,
        description || "",
        now,
      ]
    );

    const newGoal: SavingsGoal = {
      id,
      userId,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadline || null,
      description: description || "",
      isCompleted: false,
      createdAt: now,
    };

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error("Error creating savings goal:", error);
    return NextResponse.json(
      { error: "Failed to create savings goal" },
      { status: 500 }
    );
  }
}
