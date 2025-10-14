# 📦 Vercel 部署方案（輪詢模式）

## ⚠️ 重要說明

Vercel **不支援 WebSocket**，但您仍可以部署，使用**輪詢模式**作為替代方案。

---

## 🔄 什麼會改變？

### WebSocket 模式（Railway 等平台）
```
更新延遲：<100 毫秒 ⚡
30 裝置 = 30 個長連接
伺服器請求：~0 次
```

### 輪詢模式（Vercel）
```
更新延遲：0-3 秒
30 裝置 = 600 次請求/分鐘
伺服器請求：較多
```

**結論**：仍可使用，但效能較差。

---

## 🚀 Vercel 部署步驟

### 第 1 步：切換回輪詢模式

編輯 `src/config/realtimeConfig.js`：

```javascript
export const realtimeConfig = {
  // 改為輪詢模式（Vercel 不支援 WebSocket）
  refetchInterval: 3000,  // 3 秒更新一次
  
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 0,
  gcTime: 1000 * 60 * 10,
};
```

### 第 2 步：移除 WebSocket 相關代碼

#### 方法 A：註解掉（推薦）

編輯 `src/app/page.js`：

```javascript
export default function Home() {
  // 🔥 Vercel 不支援 WebSocket，暫時停用
  // useWebSocket();
  
  // ... 其他代碼
}
```

#### 方法 B：創建環境變數控制

編輯 `src/app/page.js`：

```javascript
export default function Home() {
  // 只在非 Vercel 環境啟用 WebSocket
  if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true') {
    useWebSocket();
  }
  
  // ... 其他代碼
}
```

### 第 3 步：更新 package.json

因為 Vercel 不支援自定義服務器，需要使用標準 Next.js：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

或保留兩種模式：

```json
{
  "scripts": {
    "dev": "node server.js",
    "dev:vercel": "next dev",
    "build": "next build",
    "start": "next start",
    "start:ws": "NODE_ENV=production node server.js"
  }
}
```

### 第 4 步：設定環境變數

在 Vercel 專案中設定：

```bash
# 資料庫連接（使用 Vercel Postgres 或外部 MySQL）
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database

# 停用 WebSocket
NEXT_PUBLIC_ENABLE_WEBSOCKET=false
```

### 第 5 步：部署到 Vercel

#### 使用 Vercel CLI

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel --prod
```

#### 使用 Vercel Dashboard

1. 訪問 https://vercel.com
2. 連接 GitHub 倉庫
3. Vercel 會自動檢測 Next.js 並部署
4. 設定環境變數
5. 重新部署

---

## 📊 效能對比

### Vercel（輪詢）vs Railway（WebSocket）

| 指標 | Vercel 輪詢 | Railway WebSocket |
|------|------------|-------------------|
| **延遲** | 0-3 秒 | <100 毫秒 ⚡ |
| **請求量** | 高 | 極低 |
| **費用** | 免費額度可能不夠 | $5/月 |
| **設定難度** | 簡單 | 簡單 |
| **推薦度** | ⭐⭐☆☆☆ | ⭐⭐⭐⭐⭐ |

---

## 💰 Vercel 費用考量

### 免費方案限制
- 100 GB 頻寬/月
- 100 次函數調用/天
- 10 秒最大執行時間

### 輪詢模式的影響

30 個用戶 × 每 3 秒 = **600 次 API 調用/分鐘**

**每日調用**：
```
600 調用/分鐘 × 60 分鐘 × 24 小時 = 864,000 調用/天
```

⚠️ **超出免費額度！** 需要付費方案。

### Pro 方案
- $20/月
- 1,000 GB 頻寬
- 無限調用次數

---

## 🎯 建議

### 如果堅持使用 Vercel

1. **降低輪詢頻率**
   ```javascript
   refetchInterval: 10000,  // 改為 10 秒
   ```
   
2. **只在活動時輪詢**
   ```javascript
   // 只在視窗有焦點時輪詢
   refetchInterval: document.hasFocus() ? 5000 : false,
   ```

3. **限制用戶數量**
   - 適合 <10 個同時用戶

### 更好的選擇

**強烈建議改用 Railway** 🚂
- ✅ 真正的 WebSocket（<100ms 延遲）
- ✅ 免費 $5 額度足夠
- ✅ 部署一樣簡單
- ✅ 更好的性能

📘 查看 `DEPLOY_RAILWAY.md` 了解如何部署

---

## 🔧 完整配置文件（Vercel 模式）

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DB_HOST": "@db-host",
    "DB_PORT": "@db-port",
    "DB_USER": "@db-user",
    "DB_PASSWORD": "@db-password",
    "DB_NAME": "@db-name"
  }
}
```

### `.env.production`

```bash
NEXT_PUBLIC_ENABLE_WEBSOCKET=false
```

---

## ✅ 部署檢查清單

- [ ] 切換到輪詢模式（`refetchInterval: 3000`）
- [ ] 停用 `useWebSocket()`
- [ ] 更新 `package.json` 使用標準 Next.js
- [ ] 設定環境變數
- [ ] 測試本地運行（`npm run dev:vercel`）
- [ ] 部署到 Vercel
- [ ] 驗證功能正常

---

## 🐛 常見問題

### Q: API 路由在 Vercel 上能用嗎？
A: 可以！Vercel 完全支援 Next.js API Routes。

### Q: 為什麼不推薦 Vercel？
A: 輪詢模式會產生大量請求，容易超出免費額度。

### Q: 可以混合部署嗎？
A: 可以！前端在 Vercel，API + WebSocket 在 Railway。
   查看 `DEPLOY_ALTERNATIVES.md` 了解詳情。

---

## 🎉 總結

### Vercel 方案
- ✅ 可以運行
- ⚠️ 使用輪詢（延遲較高）
- ⚠️ 可能超出免費額度
- ⚠️ 不推薦用於生產環境

### Railway 方案（推薦）⭐
- ✅ 完整 WebSocket 支援
- ✅ 更低延遲
- ✅ 更低成本
- ✅ 更好性能

**建議**：花 5 分鐘試試 Railway，體驗會好很多！

📘 `DEPLOY_RAILWAY.md` - 5 分鐘快速部署指南

