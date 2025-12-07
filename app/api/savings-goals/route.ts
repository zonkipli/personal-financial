import { NextRequest, NextResponse } from "next/server";
import { supabase, generateUUID } from "@/lib/db";
import type { SavingsGoal } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: goals, error } = await supabase
      .from("savings_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching savings goals:", error);
      return NextResponse.json(
        { error: "Failed to fetch savings goals" },
        { status: 500 }
      );
    }

    // Map snake_case to camelCase and ensure numeric fields
    const formattedGoals = (goals || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      targetAmount: Number(goal.target_amount) || 0,
      currentAmount: Number(goal.current_amount) || 0,
      deadline: goal.deadline,
      description: goal.description,
      isCompleted: Boolean(goal.is_completed),
      createdAt: goal.created_at,
    }));

    return NextResponse.json(formattedGoals);
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
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("savings_goals")
      .insert({
        id,
        user_id: userId,
        name,
        target_amount: targetAmount,
        current_amount: currentAmount || 0,
        deadline: deadline || null,
        description: description || "",
        is_completed: false,
      });

    if (error) {
      console.error("Error creating savings goal:", error);
      return NextResponse.json(
        { error: "Failed to create savings goal" },
        { status: 500 }
      );
    }

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
