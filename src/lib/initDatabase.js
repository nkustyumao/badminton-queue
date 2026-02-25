/**
 * 資料庫自動初始化腳本（PostgreSQL / Supabase）
 * 應用程式啟動時自動創建資料表（如果不存在）
 */

const { query } = require("./db.js");

async function initDatabase() {
  try {
    console.log("🔍 檢查資料庫結構...");

    // 1. 創建 member 表
    await query(`
      CREATE TABLE IF NOT EXISTS member (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        identity VARCHAR(50) NOT NULL,
        level INT NOT NULL,
        gender VARCHAR(10) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 2. 創建 courts 表
    await query(`
      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'game', 'queue')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 3. 創建 court_members 表
    await query(`
      CREATE TABLE IF NOT EXISTS court_members (
        court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
        member_id INT NOT NULL REFERENCES member(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (court_id, member_id)
      )
    `);

    // 4. 創建 settings 表
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 5. 插入預設設定（如果不存在）
    const existingSettings = await query("SELECT * FROM settings WHERE setting_key = 'max_game_courts'");

    if (existingSettings.length === 0) {
      await query("INSERT INTO settings (setting_key, setting_value) VALUES ('max_game_courts', '2')");
    }

    console.log("🎉 資料庫初始化完成！");
    return true;
  } catch (error) {
    console.error("❌ 資料庫初始化失敗:", error);
    return false;
  }
}

module.exports = { initDatabase };
