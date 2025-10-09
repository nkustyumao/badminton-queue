/**
 * 會員資料 API - 單一會員操作
 * PUT /api/members/[id] - 更新會員資料
 * DELETE /api/members/[id] - 刪除會員
 */

import { query } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * 更新會員資料
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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
    if (level < 0 || level > 20) {
      return NextResponse.json(
        {
          success: false,
          message: "程度必須在 0-20 之間",
        },
        { status: 400 }
      );
    }

    // 更新會員資料
    await query(
      "UPDATE member SET name = ?, identity = ?, level = ?, gender = ? WHERE id = ?",
      [name, identity, parseInt(level), gender, id]
    );

    return NextResponse.json({
      success: true,
      message: "更新成功",
      data: {
        id: parseInt(id),
        name,
        identity,
        level: parseInt(level),
        gender,
      },
    });
  } catch (error) {
    console.error("更新會員錯誤:", error);

    return NextResponse.json(
      {
        success: false,
        message: "更新失敗：" + error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 刪除會員
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // 檢查會員是否存在
    const members = await query("SELECT * FROM member WHERE id = ?", [id]);

    if (members.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "找不到該會員",
        },
        { status: 404 }
      );
    }

    // 刪除會員
    await query("DELETE FROM member WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "刪除成功",
    });
  } catch (error) {
    console.error("刪除會員錯誤:", error);

    return NextResponse.json(
      {
        success: false,
        message: "刪除失敗：" + error.message,
      },
      { status: 500 }
    );
  }
}

