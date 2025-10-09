/**
 * 資料庫連接測試 API
 * 用於檢查資料庫連接是否正常
 */

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  // 檢查環境變數是否存在
  const envCheck = {
    DB_HOST: process.env.DB_HOST || '未設定',
    DB_PORT: process.env.DB_PORT || '未設定',
    DB_USER: process.env.DB_USER || '未設定',
    DB_PASSWORD: process.env.DB_PASSWORD ? '已設定 (隱藏)' : '未設定',
    DB_NAME: process.env.DB_NAME || '未設定',
  };

  try {
    // 嘗試連接資料庫
    const connection = await mysql.createConnection(dbConfig);
    
    // 測試查詢
    const [rows] = await connection.execute('SELECT 1 as test');
    
    // 檢查 member 表格
    let memberCount = 0;
    let memberExists = false;
    try {
      const [members] = await connection.execute('SELECT COUNT(*) as count FROM member');
      memberCount = members[0].count;
      memberExists = true;
    } catch (err) {
      memberExists = false;
    }
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: '✅ 資料庫連接成功！',
      env: envCheck,
      database: {
        connected: true,
        memberTableExists: memberExists,
        memberCount: memberCount,
      }
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
        '1. 確認 .env.local 檔案是否存在於專案根目錄',
        '2. 確認資料庫連接資訊是否正確',
        '3. 確認 MySQL 服務是否已啟動',
        '4. 建立 .env.local 後需要重新啟動開發伺服器',
      ]
    }, { status: 500 });
  }
}

