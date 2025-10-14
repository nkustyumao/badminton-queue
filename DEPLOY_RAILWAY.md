# 🚂 部署到 Railway（推薦）

## 為什麼選擇 Railway？

✅ 支援 WebSocket 和自定義服務器
✅ 部署超級簡單（5 分鐘）
✅ 免費方案：$5 額度/月（足夠小型應用）
✅ 自動從 GitHub 部署
✅ 提供免費的 MySQL 資料庫

---

## 🚀 部署步驟

### 第 1 步：準備 Railway 配置檔案

創建 `railway.json`：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 第 2 步：更新 `server.js`（支援動態端口）

確保 `server.js` 中有：

```javascript
const port = parseInt(process.env.PORT || '3000', 10);
```

✅ 已經有了，無需修改！

### 第 3 步：推送代碼到 GitHub

```bash
# 初始化 Git（如果還沒有）
git init
git add .
git commit -m "Add WebSocket support"

# 推送到 GitHub
git remote add origin https://github.com/你的用戶名/badminton-queue.git
git push -u origin master
```

### 第 4 步：在 Railway 部署

1. **訪問 Railway**
   - 前往 https://railway.app
   - 使用 GitHub 登入

2. **創建新專案**
   - 點擊「New Project」
   - 選擇「Deploy from GitHub repo」
   - 選擇您的 `badminton-queue` 倉庫

3. **添加 MySQL 資料庫**
   - 在專案中點擊「New」
   - 選擇「Database」→「MySQL」
   - Railway 會自動創建資料庫

4. **設定環境變數**
   - 點擊您的應用服務
   - 進入「Variables」標籤
   - 添加以下變數：

   ```bash
   NODE_ENV=production
   
   # MySQL 連接資訊（從 Railway MySQL 服務複製）
   DB_HOST=${{MySQL.MYSQL_HOST}}
   DB_PORT=${{MySQL.MYSQL_PORT}}
   DB_USER=${{MySQL.MYSQL_USER}}
   DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   DB_NAME=${{MySQL.MYSQL_DATABASE}}
   ```

5. **部署**
   - Railway 會自動檢測 `package.json` 並部署
   - 等待部署完成（約 2-3 分鐘）

6. **獲取網址**
   - 點擊「Settings」→「Generate Domain」
   - 獲得類似 `your-app.railway.app` 的網址

### 第 5 步：初始化資料庫

連接到 Railway 的 MySQL 並執行您的資料庫腳本。

---

## 🎉 完成！

訪問您的 Railway 網址，WebSocket 應該正常運作！

---

## 💰 費用說明

**免費方案**：
- $5 美元額度/月
- 約可運行 500 小時/月
- 適合小型應用（<100 用戶）

**付費方案**：
- 僅支付使用量
- 約 $5-20/月（視流量而定）

---

## 🔍 驗證部署

1. 訪問您的 Railway 網址
2. 打開 Console（F12）
3. 應該看到：
   ```
   ✅ WebSocket 已連接: abc123xyz
   ```

---

## 📝 注意事項

1. **環境變數**：確保所有資料庫連接資訊正確
2. **CORS**：如果需要跨域，在 `server.js` 中設定
3. **日誌**：在 Railway 控制台查看即時日誌

---

需要幫助？查看 Railway 官方文檔：https://docs.railway.app

