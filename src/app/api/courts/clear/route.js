import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { broadcastUpdate, WS_EVENTS } from "@/lib/websocket";

/**
 * 清除所有場地資料
 * DELETE 方法用於清除 courts 和 court_members 表的所有資料
 * 並重置自動遞增 ID
 */
export async function DELETE() {
  try {
    // 1. 刪除所有 court_members (必須先刪除，因為有外鍵約束)
    await query("DELETE FROM court_members");
    
    // 2. 刪除所有 courts
    await query("DELETE FROM courts");
    
    // 3. 重置 courts 的 sequence（PostgreSQL）
    await query("SELECT setval(pg_get_serial_sequence('courts', 'id'), 0)");
    
    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.COURTS_CLEARED, {});
    
    return NextResponse.json({ 
      message: "所有場地資料已清除",
      success: true 
    });
  } catch (error) {
    console.error("清除場地資料失敗:", error);
    return NextResponse.json(
      { error: "清除場地資料失敗", details: error.message },
      { status: 500 }
    );
  }
}

