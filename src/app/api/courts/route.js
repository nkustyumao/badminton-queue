import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courts = await query("SELECT * FROM courts ORDER BY created_at DESC");
    
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

export async function POST() {
  try {
    const result = await query("INSERT INTO courts () VALUES ()");
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

