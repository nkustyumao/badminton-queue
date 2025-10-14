# 🏸 羽球排隊系統 (Badminton Queue System)

一個現代化的羽毛球場地排隊管理系統，讓您輕鬆管理球員排隊、配對和比賽進行。採用 Next.js 15 與 React 19 構建，提供流暢的使用者體驗。

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
```

詳細說明請參考 [ARCHITECTURE.md](./ARCHITECTURE.md)


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

