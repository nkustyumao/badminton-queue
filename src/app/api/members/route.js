/**
 * 會員資料 API
 * GET /api/members - 取得所有會員資料
 * POST /api/members - 新增會員資料
 */

import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { broadcastUpdate, WS_EVENTS } from "@/lib/websocket";

export async function GET() {
  try {
    // 從資料庫查詢所有會員
    // 預設排序：身份（隊長 > 會員 > 臨打）
    const members = await query(`
      SELECT * FROM member 
      ORDER BY 
        CASE identity 
          WHEN '隊長' THEN 1 
          WHEN '副隊長' THEN 2 
          WHEN '會員' THEN 3 
          WHEN '臨打' THEN 4
          ELSE 4 
        END,
        name ASC
    `);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("取得會員資料錯誤:", error);

    // 如果資料庫連接失敗，返回模擬資料供開發使用
    return NextResponse.json(
      {
        success: false,
        message: "資料庫連接失敗",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, identity, level, gender } = body;

    // 驗證必填欄位
    if (!name || !identity || !level || !gender) {
      return NextResponse.json(
        {
          success: false,
          message: "請填寫所有必填欄位",
        },
        { status: 400 }
      );
    }

    // 驗證程度範圍
    if (level < 0 || level > 18) {
      return NextResponse.json(
        {
          success: false,
          message: "程度必須在 0-18 之間",
        },
        { status: 400 }
      );
    }

    // 新增會員到資料庫
    const result = await query("INSERT INTO member (name, identity, level, gender) VALUES (?, ?, ?, ?)", [
      name,
      identity,
      parseInt(level),
      gender,
    ]);

    const newMember = {
      id: result.insertId,
      name,
      identity,
      level: parseInt(level),
      gender,
    };

    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.MEMBER_CREATED, { member: newMember });

    return NextResponse.json({
      success: true,
      message: "隊員新增成功",
      data: newMember,
    });
  } catch (error) {
    console.error("新增會員錯誤:", error);

    return NextResponse.json(
      {
        success: false,
        message: "新增失敗：" + error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await query("DELETE FROM member WHERE id = ?", [id]);
    
    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.MEMBER_DELETED, { memberId: id });
    
    return NextResponse.json({ success: true, message: "隊員刪除成功" });
  } catch (error) {
    console.error("刪除會員錯誤:", error);
    return NextResponse.json({ success: false, message: "刪除失敗：" + error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, identity, level, gender } = body;

    await query("UPDATE member SET name = ?, identity = ?, level = ?, gender = ? WHERE id = ?", [
      name,
      identity,
      level,
      gender,
      id,
    ]);

    // 🔥 廣播 WebSocket 事件
    broadcastUpdate(WS_EVENTS.MEMBER_UPDATED, { 
      member: { id, name, identity, level, gender } 
    });

    return NextResponse.json({ success: true, message: "更新成功" });
  } catch (error) {
    console.error("更新會員錯誤:", error);
    return NextResponse.json({ success: false, message: "更新失敗：" + error.message }, { status: 500 });
  }
}
