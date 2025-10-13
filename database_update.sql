-- 羽球排隊系統 - 資料庫更新腳本
-- 執行此腳本以新增所需的資料表欄位和表格

-- 1. 在 courts 表新增 status 欄位
ALTER TABLE courts 
ADD COLUMN status ENUM('waiting', 'game', 'queue') DEFAULT 'waiting' COMMENT '場地狀態：waiting=等待區, game=比賽區, queue=排隊區';

-- 2. 建立 settings 表來存放系統設定
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE NOT NULL COMMENT '設定鍵名',
  setting_value VARCHAR(255) NOT NULL COMMENT '設定值',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. 插入預設的比賽區場地數量設定（預設為 2）
INSERT INTO settings (setting_key, setting_value) 
VALUES ('max_game_courts', '2')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- 完成！
-- 您現在可以使用新的排隊系統功能了

