import { query, queryRaw } from "@/lib/db";
import { NextResponse } from "next/server";
import { broadcastUpdate, WS_EVENTS } from "@/lib/websocket";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    let sql = "SELECT * FROM courts";
    let params = [];
    
    if (status && ['waiting', 'game', 'queue'].includes(status)) {
      sql += " WHERE status = $1";
      params.push(status);
    }
    
    sql += " ORDER BY created_at ASC";
    
    const courts = await query(sql, params);
    
    const courtsWithMembers = await Promise.all(
      courts.map(async (court) => {
        const members = await query(
          `SELECT m.* FROM member m
           INNER JOIN court_members cm ON m.id = cm.member_id
           WHERE cm.court_id = $1
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
    
    const result = await queryRaw(
      "INSERT INTO courts (status) VALUES ($1) RETURNING *",
      [status]
    );
    const newCourt = result.rows[0];
    const courtData = { ...newCourt, members: [] };
    
    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.COURT_CREATED, { court: courtData });
    
    return NextResponse.json(courtData, { status: 201 });
  } catch (error) {
    console.error("創建場地失敗:", error);
    return NextResponse.json(
      { error: "創建場地失敗" },
      { status: 500 }
    );
  }
}

