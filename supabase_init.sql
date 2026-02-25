-- Supabase (PostgreSQL) 資料庫初始化腳本
-- 在 Supabase Dashboard → SQL Editor 中執行此腳本

-- 1. 創建 member 資料表
CREATE TABLE IF NOT EXISTS member (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  identity VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  gender VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 創建 courts 資料表（status 用 CHECK 約束）
CREATE TABLE IF NOT EXISTS courts (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'game', 'queue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 創建 court_members 資料表（關聯表）
CREATE TABLE IF NOT EXISTS court_members (
  court_id INT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  member_id INT NOT NULL REFERENCES member(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (court_id, member_id)
);

-- 4. 創建 settings 資料表
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 插入預設設定（存在則不覆蓋）
INSERT INTO settings (setting_key, setting_value)
VALUES ('max_game_courts', '2')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- 6. 可選：member 的 updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_updated_at ON member;
CREATE TRIGGER member_updated_at
  BEFORE UPDATE ON member
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS courts_updated_at ON courts;
CREATE TRIGGER courts_updated_at
  BEFORE UPDATE ON courts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- 完成
SELECT 'Database initialized successfully!' AS status;
