/**
 * 資料庫連接工具
 * 使用 MySQL2 連接到資料庫
 */

import mysql from "mysql2/promise";

// 建立資料庫連接池
const pool = mysql.createPool({
  host: "203.64.101.132",
  user: "root",
  password: "$2a$08$OjPb6RxHpfCSCCD/55ijyOa0BHVJYZ.4PQj6bhenLuLgmMIVkFUUW",
  database: "badminton",
  port: 3306,
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
export async function query(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("資料庫查詢錯誤:", error);
    throw error;
  }
}

export default pool;
