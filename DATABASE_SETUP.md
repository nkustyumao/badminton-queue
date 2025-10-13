# 資料庫設定說明

## 環境變數設定

請在專案根目錄建立 `.env.local` 檔案，並填入以下內容：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=你的資料庫使用者名稱
DB_PASSWORD=你的資料庫密碼
DB_NAME=badminton_db
```

## 資料庫結構

### member 資料表

```sql
CREATE TABLE member (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '會員名字',
  identity VARCHAR(50) NOT NULL COMMENT '身份（會員、教練等）',
  level INT NOT NULL COMMENT '程度等級 (1-10)',
  gender VARCHAR(10) NOT NULL COMMENT '性別（男、女）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### courts 資料表

```sql
CREATE TABLE courts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  status ENUM('waiting', 'game', 'queue') DEFAULT 'waiting' COMMENT '場地狀態',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### court_members 資料表（關聯表）

```sql
CREATE TABLE court_members (
  court_id INT NOT NULL,
  member_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (court_id, member_id),
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
);
```

### settings 資料表

```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(50) UNIQUE NOT NULL COMMENT '設定鍵名',
  setting_value VARCHAR(255) NOT NULL COMMENT '設定值',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 範例資料

```sql
INSERT INTO member (name, identity, level, gender) VALUES
('張三', '會員', 5, '男'),
('李四', '教練', 8, '男'),
('王五', '會員', 6, '女'),
('趙六', '會員', 4, '男'),
('陳七', '會員', 7, '女');

INSERT INTO settings (setting_key, setting_value) 
VALUES ('max_game_courts', '2');
```

## 資料庫更新

如果您已經有舊的資料庫，請執行 `database_update.sql` 檔案來更新資料庫結構：

```bash
mysql -u your_username -p badminton_db < database_update.sql
```

## 注意事項

- 如果資料庫連接失敗，系統會自動使用模擬資料，不會影響開發
- 確保 MySQL 服務已啟動
- 確保資料庫使用者有適當的權限

