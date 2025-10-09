import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await query("DELETE FROM courts WHERE id = ?", [id]);
    
    return NextResponse.json({ message: "刪除成功" });
  } catch (error) {
    console.error("刪除場地失敗:", error);
    return NextResponse.json(
      { error: "刪除場地失敗" },
      { status: 500 }
    );
  }
}

