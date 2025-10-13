import { query } from "@/lib/db";
import { NextResponse } from "next/server";

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
    
    // 3. 重置 courts 表的自動遞增 ID
    await query("ALTER TABLE courts AUTO_INCREMENT = 1");
    
    // 4. 重置 court_members 表的自動遞增 ID (如果有的話)
    // court_members 通常沒有單獨的 ID，但如果有就取消註解
    // await query("ALTER TABLE court_members AUTO_INCREMENT = 1");
    
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

