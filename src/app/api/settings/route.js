import { query } from "@/lib/db";
import { NextResponse } from "next/server";

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
      "SELECT * FROM settings WHERE setting_key = ?",
      [setting_key]
    );
    
    if (existing.length > 0) {
      // 更新現有設定
      await query(
        "UPDATE settings SET setting_value = ? WHERE setting_key = ?",
        [setting_value, setting_key]
      );
    } else {
      // 新增設定
      await query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)",
        [setting_key, setting_value]
      );
    }
    
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

