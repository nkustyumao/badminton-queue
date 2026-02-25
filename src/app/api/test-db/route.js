/**
 * 資料庫連接測試 API（Supabase / PostgreSQL）
 * 用於檢查資料庫連接是否正常
 */

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  const envCheck = {
    DATABASE_URL: process.env.DATABASE_URL ? '已設定 (隱藏)' : '未設定',
  };

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('supabase.com') ? { rejectUnauthorized: false } : false,
    });

    await pool.query('SELECT 1 as test');

    let memberCount = 0;
    let memberExists = false;
    try {
      const res = await pool.query('SELECT COUNT(*) as count FROM member');
      memberCount = parseInt(res.rows[0]?.count ?? 0, 10);
      memberExists = true;
    } catch {
      memberExists = false;
    }

    await pool.end();

    return NextResponse.json({
      success: true,
      message: '✅ 資料庫連接成功！',
      env: envCheck,
      database: {
        connected: true,
        memberTableExists: memberExists,
        memberCount,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '❌ 資料庫連接失敗',
      env: envCheck,
      error: {
        message: error.message,
        code: error.code,
      },
      suggestions: [
        '1. 確認 .env.local 是否有 DATABASE_URL',
        '2. 到 Supabase Dashboard → Project Settings → Database 複製連線字串',
        '3. 使用 Transaction 或 Session 模式的 Connection string（含密碼）',
        '4. 修改 .env.local 後需重新啟動開發伺服器',
      ],
    }, { status: 500 });
  }
}
