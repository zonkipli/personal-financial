import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('split_bills')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: "Split bill deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting split bill:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
