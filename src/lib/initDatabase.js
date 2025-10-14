/**
 * 資料庫自動初始化腳本
 * 應用程式啟動時自動創建資料表（如果不存在）
 */

const { query } = require('./db.js');

async function initDatabase() {
  try {
    console.log('🔍 檢查資料庫結構...');

    // 1. 創建 member 表
    await query(`
      CREATE TABLE IF NOT EXISTS member (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        \`identity\` VARCHAR(50) NOT NULL,
        level INT NOT NULL,
        gender VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ member 表已就緒');

    // 2. 創建 courts 表
    await query(`
      CREATE TABLE IF NOT EXISTS courts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        status ENUM('waiting', 'game', 'queue') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ courts 表已就緒');

    // 3. 創建 court_members 表
    await query(`
      CREATE TABLE IF NOT EXISTS court_members (
        court_id INT NOT NULL,
        member_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (court_id, member_id),
        FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ court_members 表已就緒');

    // 4. 創建 settings 表
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ settings 表已就緒');

    // 5. 插入預設設定（如果不存在）
    const existingSettings = await query(
      "SELECT * FROM settings WHERE setting_key = 'max_game_courts'"
    );
    
    if (existingSettings.length === 0) {
      await query(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('max_game_courts', '2')"
      );
      console.log('✅ 預設設定已插入');
    }

    console.log('🎉 資料庫初始化完成！');
    return true; 
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    // 不要拋出錯誤，讓應用程式繼續運行
    return false;
  }
}

module.exports = { initDatabase };

