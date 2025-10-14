/**
 * 資料庫連接工具
 * 使用 MySQL2 連接到資料庫
 */

const mysql = require("mysql2/promise");

// 使用環境變數配置資料庫連接
// 本地開發使用 .env.local，生產環境使用 Railway 環境變數
const pool = mysql.createPool({
  host: process.env.DB_HOST || "interchange.proxy.rlwy.net",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "XZXLclYBgDoIkldrmkRwPQwZDpQqnutr",
  database: process.env.DB_NAME || "railway",
  port: parseInt(process.env.DB_PORT || "27976"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * 執行資料庫查詢
 * @param {string} query - SQL 查詢語句
 * @param {Array} params - 查詢參數
 * @returns {Promise} 查詢結果
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("資料庫查詢錯誤:", error);
    throw error;
  }
}

module.exports = { query, pool };
module.exports.default = pool;
