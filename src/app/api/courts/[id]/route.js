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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    if (!status || !['waiting', 'game', 'queue'].includes(status)) {
      return NextResponse.json(
        { error: "無效的場地狀態" },
        { status: 400 }
      );
    }
    
    await query(
      "UPDATE courts SET status = ? WHERE id = ?",
      [status, id]
    );
    
    const updatedCourt = await query("SELECT * FROM courts WHERE id = ?", [id]);
    
    if (updatedCourt.length === 0) {
      return NextResponse.json(
        { error: "場地不存在" },
        { status: 404 }
      );
    }
    
    const members = await query(
      `SELECT m.* FROM member m
       INNER JOIN court_members cm ON m.id = cm.member_id
       WHERE cm.court_id = ?
       ORDER BY cm.created_at`,
      [id]
    );
    
    return NextResponse.json({ ...updatedCourt[0], members });
  } catch (error) {
    console.error("更新場地失敗:", error);
    return NextResponse.json(
      { error: "更新場地失敗" },
      { status: 500 }
    );
  }
}

