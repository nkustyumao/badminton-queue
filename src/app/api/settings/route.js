import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { broadcastUpdate, WS_EVENTS } from "@/lib/websocket";

export async function GET() {
  try {
    const settings = await query("SELECT * FROM settings");
    
    // 轉換為鍵值對格式
    const settingsObj = {};
    settings.forEach((setting) => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("獲取設定失敗:", error);
    return NextResponse.json(
      { error: "獲取設定失敗" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { setting_key, setting_value } = body;
    
    if (!setting_key || setting_value === undefined) {
      return NextResponse.json(
        { error: "請提供 setting_key 和 setting_value" },
        { status: 400 }
      );
    }
    
    // 檢查設定是否存在
    const existing = await query(
      "SELECT * FROM settings WHERE setting_key = $1",
      [setting_key]
    );
    
    if (existing.length > 0) {
      await query(
        "UPDATE settings SET setting_value = $1 WHERE setting_key = $2",
        [setting_value, setting_key]
      );
    } else {
      await query(
        "INSERT INTO settings (setting_key, setting_value) VALUES ($1, $2)",
        [setting_key, setting_value]
      );
    }
    
    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.SETTING_UPDATED, { 
      setting_key, 
      setting_value 
    });
    
    return NextResponse.json({ 
      message: "更新成功",
      setting_key,
      setting_value 
    });
  } catch (error) {
    console.error("更新設定失敗:", error);
    return NextResponse.json(
      { error: "更新設定失敗" },
      { status: 500 }
    );
  }
}

