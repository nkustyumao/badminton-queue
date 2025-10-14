-- Railway 資料庫初始化腳本
-- 在 Railway MySQL 中執行此腳本

-- 1. 創建 member 資料表
CREATE TABLE IF NOT EXISTS member (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '會員名字',
  identity VARCHAR(50) NOT NULL COMMENT '身份（會員、教練等）',
  level INT NOT NULL COMMENT '程度等級 (1-18)',
  gender VARCHAR(10) NOT NULL COMMENT '性別（男、女）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 創建 courts 資料表
CREATE TABLE IF NOT EXISTS courts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  status ENUM('waiting', 'game', 'queue') DEFAULT 'waiting' COMMENT '場地狀態',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. 創建 court_members 資料表（關聯表）
CREATE TABLE IF NOT EXISTS court_members (
  court_id INT NOT NULL,
  member_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (court_id, member_id),
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);

-- 4. 創建 settings 資料表
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE NOT NULL COMMENT '設定鍵名',
  setting_value VARCHAR(255) NOT NULL COMMENT '設定值',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. 插入預設設定
INSERT INTO settings (setting_key, setting_value) 
VALUES ('max_game_courts', '2')
ON DUPLICATE KEY UPDATE setting_value = '2';

-- 6. 插入範例隊員資料（可選，可以刪除）
INSERT INTO member (name, identity, level, gender) VALUES
('張三', '會員', 5, '男'),
('李四', '隊長', 8, '男'),
('王五', '會員', 6, '女'),
('趙六', '會員', 4, '男'),
('陳七', '會員', 7, '女');

-- 完成！
SELECT 'Database initialized successfully!' AS Status;

