import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { broadcastUpdate, WS_EVENTS } from "@/lib/websocket";

export async function POST(request, { params }) {
  try {
    const { id: courtId } = await params;
    const { memberIds } = await request.json();
    
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return NextResponse.json(
        { error: "請提供有效的隊員ID列表" },
        { status: 400 }
      );
    }
    
    const currentMembers = await query(
      "SELECT COUNT(*) as count FROM court_members WHERE court_id = ?",
      [courtId]
    );
    
    if (currentMembers[0].count + memberIds.length > 4) {
      return NextResponse.json(
        { error: "場地最多只能有4位隊員" },
        { status: 400 }
      );
    }
    
    for (const memberId of memberIds) {
      await query(
        "INSERT INTO court_members (court_id, member_id) VALUES (?, ?)",
        [courtId, memberId]
      );
    }
    
    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.MEMBER_ADDED_TO_COURT, { 
      courtId: parseInt(courtId), 
      memberIds 
    });
    
    return NextResponse.json({ message: "新增成功" }, { status: 201 });
  } catch (error) {
    console.error("新增隊員失敗:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "隊員已在此場地中" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "新增隊員失敗" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: courtId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    
    if (!memberId) {
      return NextResponse.json(
        { error: "請提供隊員ID" },
        { status: 400 }
      );
    }
    
    await query(
      "DELETE FROM court_members WHERE court_id = ? AND member_id = ?",
      [courtId, memberId]
    );
    
    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.MEMBER_REMOVED_FROM_COURT, { 
      courtId: parseInt(courtId), 
      memberId: parseInt(memberId) 
    });
    
    return NextResponse.json({ message: "移除成功" });
  } catch (error) {
    console.error("移除隊員失敗:", error);
    return NextResponse.json(
      { error: "移除隊員失敗" },
      { status: 500 }
    );
  }
}

