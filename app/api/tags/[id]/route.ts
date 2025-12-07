import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await query("DELETE FROM tags WHERE id = ?", [id])

    return NextResponse.json({ message: "Tag deleted successfully" })
  } catch (error: unknown) {
    console.error("Error deleting tag:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
