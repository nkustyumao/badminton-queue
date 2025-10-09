# 🏸 羽球排隊系統 (Badminton Queue System)

一個現代化的羽毛球場地排隊管理系統，讓您輕鬆管理球員排隊、配對和比賽進行。採用 Next.js 15 與 React 19 構建，提供流暢的使用者體驗。

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

## ✨ 功能特色

- 🎯 **會員管理** - 新增、查看、編輯會員資訊
- 🏆 **程度分級** - 支援 1-10 級程度分類
- 👥 **智慧配對** - 根據程度和性別進行配對建議
- 📱 **響應式設計** - 完美支援桌面和移動設備
- ⚡ **即時更新** - 使用 TanStack Query 實現自動快取和即時資料同步
- 🎨 **現代化 UI** - 採用 Tailwind CSS 4，提供美觀的介面設計
- 💾 **資料持久化** - MySQL 資料庫儲存，支援離線模擬模式

## 🛠️ 技術棧

### 前端框架
- **Next.js 15** - React 全端框架（支援 Turbopack）
- **React 19** - 最新版本 React
- **Tailwind CSS 4** - 現代化 CSS 框架

### 狀態管理
- **TanStack Query v5** - 強大的伺服器狀態管理
- **Axios** - HTTP 請求庫

### 資料庫
- **MySQL 8.0+** - 關聯式資料庫
- **mysql2** - Node.js MySQL 驅動

### UI 組件庫
- **Lucide React** - 精美的圖標庫
- **SweetAlert2** - 美觀的對話框提示

## 📁 專案結構

```
badminton-queue/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── members/       # 會員 API
│   │   │   └── test-db/       # 資料庫測試
│   │   ├── layout.js          # 全局佈局
│   │   ├── page.js            # 首頁
│   │   └── globals.css        # 全局樣式
│   │
│   ├── components/            # React 組件
│   │   ├── Sidebar.js         # 側邊欄（會員列表 + 新增表單）
│   │   ├── GameArea.js        # 比賽區組件
│   │   ├── WaitingArea.js     # 等待區組件
│   │   └── QueueArea.js       # 排隊區組件
│   │
│   ├── hooks/                 # 自定義 Hooks
│   │   └── useMembers.js      # 會員資料 Hook
│   │
│   ├── services/              # API 服務層
│   │   └── memberService.js   # 會員 API 請求
│   │
│   ├── providers/             # Context Providers
│   │   └── QueryProvider.js   # TanStack Query Provider
│   │
│   └── lib/                   # 工具函數庫
│       └── db.js              # 資料庫連接
│
├── public/                    # 靜態資源
│   └── level-table.webp       # 程度對照表
│
├── ARCHITECTURE.md            # 架構說明文件
├── DATABASE_SETUP.md          # 資料庫設定說明
└── package.json               # 專案依賴
```

## 🚀 快速開始

### 環境需求

- **Node.js** 18.17 或更高版本
- **MySQL** 8.0 或更高版本
- **npm** 或 **yarn** 或 **pnpm**

### 安裝步驟

1. **克隆專案**
```bash
git clone <repository-url>
cd badminton-queue
```

2. **安裝依賴**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **設定資料庫**

建立 MySQL 資料庫：
```sql
CREATE DATABASE badminton_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

建立會員資料表：
```sql
USE badminton_db;

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

插入測試資料（選用）：
```sql
INSERT INTO member (name, identity, level, gender) VALUES
('張三', '會員', 5, '男'),
('李四', '教練', 8, '男'),
('王五', '會員', 6, '女'),
('趙六', '會員', 4, '男'),
('陳七', '會員', 7, '女');
```

4. **環境變數設定**

在專案根目錄建立 `.env.local` 檔案：
```env
# 資料庫連接設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=你的資料庫使用者名稱
DB_PASSWORD=你的資料庫密碼
DB_NAME=badminton_db
```

5. **啟動開發伺服器**
```bash
npm run dev
```

6. **開啟瀏覽器**
```
http://localhost:3000
```

## 📖 使用說明

### 會員管理

1. **新增會員**
   - 點擊側邊欄的「新增隊員」區域
   - 填寫姓名、身份、程度、性別
   - 點擊「新增隊員」按鈕

2. **查看會員**
   - 側邊欄顯示所有會員列表
   - 使用搜尋框快速篩選會員
   - 可按程度、性別、身份分類查看

3. **程度說明**
   - 1-10 級：1 級為初學者，10 級為專業選手
   - 可參考系統內建的程度對照表

### 排隊管理

- **比賽區** - 正在進行比賽的球員
- **等待區** - 下一場準備上場的球員
- **排隊區** - 等待排隊的球員

## 🏗️ 專案架構

本專案採用分層架構設計，確保代碼的可維護性和擴展性：

```
用戶操作 (UI)
    ↓
組件層 (Components)
    ↓
Hooks 層 (React Query)
    ↓
服務層 (Services)
    ↓
API 路由層 (API Routes)
    ↓
資料庫 (MySQL)
```

### 核心設計模式

- **關注點分離** - UI、業務邏輯、資料存取各司其職
- **依賴注入** - 通過 Props 和 Context 傳遞依賴
- **快取優先** - TanStack Query 自動管理資料快取
- **樂觀更新** - 提供即時的用戶體驗反饋

詳細說明請參考 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🔧 開發指令

```bash
# 開發模式（使用 Turbopack）
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm run start
```

## 🌐 API 端點

### 會員 API

- `GET /api/members` - 獲取所有會員列表
- `POST /api/members` - 新增會員
- `PUT /api/members/[id]` - 更新會員資料（預留）
- `DELETE /api/members/[id]` - 刪除會員（預留）

### 測試 API

- `GET /api/test-db` - 測試資料庫連接狀態

## 💡 注意事項

### 資料庫連接

- 如果資料庫連接失敗，系統會自動切換到模擬資料模式
- 模擬模式下的資料僅存在記憶體中，重新整理後會重置
- 建議在開發環境設定真實資料庫連接

### 開發提示

- 專案使用 **Turbopack** 提供更快的開發體驗
- 支援 **Hot Module Replacement (HMR)** 熱模組替換
- TanStack Query Devtools 僅在開發環境啟用

## 📚 相關文件

- [架構說明](./ARCHITECTURE.md) - 詳細的專案架構文件
- [資料庫設定](./DATABASE_SETUP.md) - 資料庫設定指南
- [Next.js 文件](https://nextjs.org/docs)
- [TanStack Query 文件](https://tanstack.com/query/latest)

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 詳見 LICENSE 檔案

## 👨‍💻 作者

開發者：NGSS

## 🙏 致謝

感謝以下開源專案：

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**⭐ 如果這個專案對你有幫助，請給個 Star！**

