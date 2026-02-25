/**
 * 資料庫連接工具
 * 使用 pg 連接到 Supabase (PostgreSQL)
 */

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString || !connectionString.startsWith("postgresql://")) {
  console.warn(
    "[db] DATABASE_URL 未設定或格式錯誤，請在 .env 設定一行：\n" +
    "DATABASE_URL=postgresql://postgres.專案代碼:密碼@aws-0-區域.pooler.supabase.com:6543/postgres\n" +
    "密碼若有 $ 請改成 %24，且整行不可換行、不可有空格。"
  );
}

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("supabase.com") ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

/**
 * 執行資料庫查詢（相容 MySQL 的 ? 佔位符會由呼叫端改為 $1, $2）
 * @param {string} sql - SQL 查詢語句（使用 $1, $2, $3... 佔位符）
 * @param {Array} params - 查詢參數
 * @returns {Promise<Array>} 查詢結果陣列（與原本 MySQL 行為一致）
 */
async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("資料庫查詢錯誤:", error);
    throw error;
  }
}

/**
 * 執行查詢並回傳完整 result（含 rowCount, rows），用於 INSERT ... RETURNING 等
 */
async function queryRaw(sql, params = []) {
  try {
    return await pool.query(sql, params);
  } catch (error) {
    console.error("資料庫查詢錯誤:", error);
    throw error;
  }
}

module.exports = { query, queryRaw, pool };
module.exports.default = pool;
