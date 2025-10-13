import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    let sql = "SELECT * FROM courts";
    let params = [];
    
    if (status && ['waiting', 'game', 'queue'].includes(status)) {
      sql += " WHERE status = ?";
      params.push(status);
    }
    
    sql += " ORDER BY created_at ASC";
    
    const courts = await query(sql, params);
    
    const courtsWithMembers = await Promise.all(
      courts.map(async (court) => {
        const members = await query(
          `SELECT m.* FROM member m
           INNER JOIN court_members cm ON m.id = cm.member_id
           WHERE cm.court_id = ?
           ORDER BY cm.created_at`,
          [court.id]
        );
        return { ...court, members };
      })
    );
    
    return NextResponse.json(courtsWithMembers);
  } catch (error) {
    console.error("獲取場地失敗:", error);
    return NextResponse.json(
      { error: "獲取場地失敗" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const status = body.status || 'waiting';
    
    if (!['waiting', 'game', 'queue'].includes(status)) {
      return NextResponse.json(
        { error: "無效的場地狀態" },
        { status: 400 }
      );
    }
    
    const result = await query(
      "INSERT INTO courts (status) VALUES (?)",
      [status]
    );
    const newCourt = await query("SELECT * FROM courts WHERE id = ?", [result.insertId]);
    
    return NextResponse.json({ ...newCourt[0], members: [] }, { status: 201 });
  } catch (error) {
    console.error("創建場地失敗:", error);
    return NextResponse.json(
      { error: "創建場地失敗" },
      { status: 500 }
    );
  }
}

