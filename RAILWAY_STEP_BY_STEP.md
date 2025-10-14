# 🚂 Railway 部署超詳細教學

> **目標**：將您的羽毛球排隊系統部署到 Railway，啟用 WebSocket 實時同步
> **時間**：約 15-20 分鐘
> **難度**：⭐☆☆☆☆（超簡單）

---

## 📋 準備工作

### 您需要的帳號

1. ✅ **GitHub 帳號** - 用來儲存代碼
2. ✅ **Railway 帳號** - 用來部署（可用 GitHub 登入）

---

## 第一階段：準備代碼並推送到 GitHub

### 步驟 1：提交所有代碼到 Git

#### 1.1 查看當前狀態

```bash
git status
```

您應該看到很多修改和新增的文件。

#### 1.2 添加所有文件到 Git

```bash
git add .
```

**說明**：
- `git add .` = 添加當前目錄下的所有文件
- `.` = 代表當前目錄的所有內容

#### 1.3 提交代碼

```bash
git commit -m "Add WebSocket real-time sync and Railway deployment support"
```

**說明**：
- `git commit` = 提交代碼
- `-m "訊息"` = 添加提交訊息
- 這個訊息會記錄在 Git 歷史中

✅ **成功標誌**：看到類似這樣的輸出
```
[master abc1234] Add WebSocket real-time sync and Railway deployment support
 XX files changed, XXX insertions(+), XXX deletions(-)
```

### 步驟 2：推送到 GitHub

#### 2.1 檢查遠端倉庫

```bash
git remote -v
```

**可能的情況**：

**情況 A**：已經有 GitHub 倉庫
```
origin  https://github.com/你的用戶名/badminton-queue.git (fetch)
origin  https://github.com/你的用戶名/badminton-queue.git (push)
```
→ 跳到步驟 2.3

**情況 B**：沒有遠端倉庫
```
（沒有輸出）
```
→ 繼續步驟 2.2

#### 2.2 創建 GitHub 倉庫（如果還沒有）

##### 方法 A：使用 GitHub 網頁（推薦）

1. 訪問 https://github.com/new
2. 填寫資訊：
   - **Repository name**: `badminton-queue`
   - **Description**: 羽毛球排隊系統
   - **Public** 或 **Private**（隨意）
   - ❌ **不要** 勾選 "Initialize with README"
3. 點擊「Create repository」
4. 複製顯示的倉庫網址（類似 `https://github.com/你的用戶名/badminton-queue.git`）

##### 連接遠端倉庫

```bash
git remote add origin https://github.com/你的用戶名/badminton-queue.git
```

**替換**：
- 將 `你的用戶名` 改成您的 GitHub 用戶名
- 例如：`https://github.com/john123/badminton-queue.git`

#### 2.3 推送代碼

```bash
git push -u origin master
```

或如果您的分支叫 `main`：
```bash
git push -u origin main
```

**說明**：
- `git push` = 推送代碼到 GitHub
- `-u origin master` = 設定上游分支（只需要第一次）
- 之後只需要 `git push` 就可以了

**可能需要的操作**：
- 輸入 GitHub 用戶名和密碼
- 或使用 Personal Access Token（如果啟用了 2FA）

✅ **成功標誌**：
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
...
To https://github.com/你的用戶名/badminton-queue.git
 * [new branch]      master -> master
```

#### 2.4 驗證推送成功

訪問您的 GitHub 倉庫：
```
https://github.com/你的用戶名/badminton-queue
```

您應該看到所有的代碼文件，包括：
- ✅ `server.js`
- ✅ `railway.json`
- ✅ `src/lib/websocket.js`
- ✅ 所有文檔（DEPLOY_RAILWAY.md 等）

---

## 第二階段：部署到 Railway

### 步驟 3：註冊 Railway

#### 3.1 訪問 Railway

打開瀏覽器，訪問：
```
https://railway.app
```

#### 3.2 註冊/登入

1. 點擊右上角「Login」
2. 選擇「Login with GitHub」（推薦）
3. 授權 Railway 訪問您的 GitHub 帳號

✅ **成功標誌**：進入 Railway Dashboard

### 步驟 4：創建新專案

#### 4.1 創建專案

1. 在 Railway Dashboard，點擊「New Project」
2. 選擇「Deploy from GitHub repo」

#### 4.2 選擇倉庫

1. 看到您的 GitHub 倉庫列表
2. 找到並點擊 `badminton-queue`

**如果看不到倉庫**：
- 點擊「Configure GitHub App」
- 授權 Railway 訪問該倉庫
- 返回並重新選擇

#### 4.3 等待初始部署

Railway 會自動：
1. ✅ 檢測到 Next.js 專案
2. ✅ 讀取 `railway.json` 配置
3. ✅ 安裝依賴（`npm install`）
4. ✅ 構建專案（`npm run build`）

**時間**：約 2-3 分鐘

⚠️ **重要**：初始部署**會失敗**，這是正常的！
因為還沒有設定資料庫連接。

### 步驟 5：添加 MySQL 資料庫

#### 5.1 添加資料庫服務

在您的 Railway 專案中：
1. 點擊「New」按鈕（在專案視圖中）
2. 選擇「Database」
3. 選擇「Add MySQL」

✅ Railway 會自動創建一個 MySQL 資料庫

#### 5.2 查看資料庫連接資訊

1. 點擊剛創建的 MySQL 服務
2. 切換到「Variables」標籤
3. 您會看到：
   ```
   MYSQL_DATABASE
   MYSQL_HOST
   MYSQL_PASSWORD
   MYSQL_PORT
   MYSQL_PRIVATE_URL
   MYSQL_PUBLIC_URL
   MYSQL_ROOT_PASSWORD
   MYSQL_URL
   MYSQL_USER
   ```

**不需要記住這些**，我們下一步會自動連接！

### 步驟 6：設定環境變數

#### 6.1 回到應用服務

點擊您的應用服務（badminton-queue）

#### 6.2 添加環境變數

1. 切換到「Variables」標籤
2. 點擊「New Variable」
3. 選擇「Add Reference」

#### 6.3 連接資料庫變數

添加以下變數（使用 Reference 方式）：

| 變數名稱 | 值（選擇 Reference） |
|---------|---------------------|
| `DB_HOST` | MySQL.MYSQL_HOST |
| `DB_PORT` | MySQL.MYSQL_PORT |
| `DB_USER` | MySQL.MYSQL_USER |
| `DB_PASSWORD` | MySQL.MYSQL_PASSWORD |
| `DB_NAME` | MySQL.MYSQL_DATABASE |

**如何添加 Reference**：
1. 點擊「New Variable」
2. 輸入變數名稱（例如 `DB_HOST`）
3. 點擊值的輸入框右側的「$」圖示
4. 選擇「MySQL」服務
5. 選擇對應的變數（例如 `MYSQL_HOST`）
6. 點擊「Add」

#### 6.4 添加其他環境變數

手動添加（Raw 方式）：

| 變數名稱 | 值 |
|---------|---|
| `NODE_ENV` | `production` |

**步驟**：
1. 點擊「New Variable」
2. 變數名稱：`NODE_ENV`
3. 值：`production`
4. 點擊「Add」

✅ **完成後應該有 6 個環境變數**：
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- NODE_ENV

### 步驟 7：初始化資料庫

#### 7.1 連接到資料庫

有幾種方式可以連接：

##### 方法 A：使用 Railway CLI（推薦）

1. 安裝 Railway CLI：
   ```bash
   # Windows (PowerShell)
   iwr https://railway.app/install.ps1 | iex
   
   # 或使用 npm
   npm install -g @railway/cli
   ```

2. 登入 Railway：
   ```bash
   railway login
   ```

3. 連接到專案：
   ```bash
   railway link
   ```
   選擇您的專案

4. 連接到 MySQL：
   ```bash
   railway connect MySQL
   ```

5. 執行您的資料庫腳本：
   ```sql
   -- 複製並貼上您的資料庫結構（從 DATABASE_SETUP.md）
   ```

##### 方法 B：使用 MySQL Workbench 或其他工具

1. 在 Railway MySQL 服務中，複製「MYSQL_PUBLIC_URL」
2. 使用 MySQL 客戶端連接
3. 執行您的資料庫腳本

##### 方法 C：使用 Railway 內建的查詢工具

1. 在 MySQL 服務中，點擊「Data」標籤
2. 點擊「Query」
3. 貼上並執行您的 SQL 腳本

#### 7.2 確認資料表已創建

執行查詢：
```sql
SHOW TABLES;
```

應該看到：
```
courts
court_members
member
settings
```

### 步驟 8：重新部署

#### 8.1 觸發重新部署

**方法 A**：在 Railway Dashboard
1. 進入您的應用服務
2. 切換到「Deployments」標籤
3. 點擊最新的部署
4. 點擊右上角的「Redeploy」

**方法 B**：推送新的提交
```bash
# 做一個小修改（例如修改 README）
git add .
git commit -m "Trigger redeploy"
git push
```

#### 8.2 監控部署

1. 在「Deployments」標籤中
2. 點擊最新的部署
3. 查看「Build Logs」和「Deploy Logs」

✅ **成功標誌**：
```
🚀 ═══════════════════════════════════════════════════
🎯 羽球排隊系統正在運行
📡 HTTP 服務器: http://0.0.0.0:XXXX
⚡ WebSocket 已啟用 (Socket.IO)
🔧 環境: 生產模式
═══════════════════════════════════════════════════
```

### 步驟 9：獲取網址並測試

#### 9.1 生成公開網址

1. 進入應用服務
2. 切換到「Settings」標籤
3. 找到「Public Networking」區域
4. 點擊「Generate Domain」

✅ Railway 會生成一個網址，類似：
```
https://badminton-queue-production-xxxx.up.railway.app
```

#### 9.2 訪問您的網站

複製網址並在瀏覽器中打開！

#### 9.3 驗證 WebSocket

1. 打開瀏覽器開發者工具（F12）
2. 切換到 Console 標籤
3. 應該看到：
   ```
   ✅ WebSocket 已連接: abc123xyz
   ```

#### 9.4 測試實時同步

1. 開啟兩個瀏覽器視窗（都訪問您的 Railway 網址）
2. 在視窗 A 新增隊員
3. 觀察視窗 B **立即同步** ⚡

🎉 **成功！WebSocket 實時同步正常運作！**

---

## 第三階段：後續管理

### 監控應用

#### 查看日誌

1. 進入應用服務
2. 切換到「Deployments」標籤
3. 點擊最新部署
4. 查看「Deploy Logs」

**有用的日誌**：
- 查看 WebSocket 連接
- 查看 API 請求
- 查看錯誤訊息

#### 查看使用量

1. 進入專案設定
2. 查看「Usage」標籤
3. 監控：
   - 運行時間
   - 記憶體使用
   - 網路流量

### 更新應用

#### 自動部署

**最簡單**：每次推送到 GitHub，Railway 會自動重新部署！

```bash
# 修改代碼
# ...

# 提交並推送
git add .
git commit -m "Update feature"
git push

# Railway 會自動檢測並重新部署！
```

#### 手動部署

如果需要手動觸發：
1. 進入「Deployments」標籤
2. 點擊「Redeploy」

### 管理環境變數

1. 進入「Variables」標籤
2. 可以隨時添加、修改、刪除變數
3. 修改後會自動觸發重新部署

### 查看資料庫

1. 進入 MySQL 服務
2. 切換到「Data」標籤
3. 可以查看和編輯資料

---

## 🐛 常見問題排解

### 問題 1：部署失敗

**症狀**：部署顯示「Failed」

**檢查**：
1. 查看 Build Logs
2. 查看 Deploy Logs
3. 檢查環境變數是否設定正確

**常見原因**：
- ❌ 資料庫連接失敗 → 檢查環境變數
- ❌ 依賴安裝失敗 → 檢查 package.json
- ❌ 構建失敗 → 查看錯誤訊息

### 問題 2：網站可以訪問但 WebSocket 無法連接

**症狀**：Console 顯示 `❌ WebSocket 連接錯誤`

**檢查**：
1. 查看 Deploy Logs，確認 WebSocket 已啟用
2. 檢查瀏覽器 Console 的詳細錯誤
3. 確認防火牆沒有阻擋 WebSocket

**解決方法**：
- 通常是暫時的，等待 1-2 分鐘
- 嘗試刷新頁面
- 檢查服務器日誌

### 問題 3：資料庫連接失敗

**症狀**：API 請求返回 500 錯誤

**檢查**：
1. 環境變數是否正確設定
2. 資料庫是否已初始化（有資料表）
3. 查看應用日誌

**解決方法**：
```bash
# 使用 Railway CLI 連接資料庫
railway connect MySQL

# 檢查資料表
SHOW TABLES;

# 如果沒有，執行初始化腳本
```

### 問題 4：超出免費額度

**症狀**：應用暫停或收到通知

**查看用量**：
1. 進入專案
2. 查看「Usage」標籤

**解決方法**：
- 免費：$5 額度/月（約 500 小時）
- 如果不夠，考慮升級到 Hobby 方案
- 或暫停不使用的服務

---

## 📊 成本估算

### 小型應用（<30 同時用戶）

```
運行時間：24/7（720 小時/月）
記憶體：~512MB
資料庫：MySQL（小型）

預估成本：$0-5/月（通常在免費額度內）
```

### 中型應用（30-100 同時用戶）

```
運行時間：24/7
記憶體：~1GB
資料庫：MySQL（中型）

預估成本：$5-10/月
```

---

## ✅ 部署完成檢查清單

- [ ] 代碼已推送到 GitHub
- [ ] Railway 專案已創建
- [ ] MySQL 資料庫已添加
- [ ] 環境變數已設定
- [ ] 資料庫已初始化（資料表已創建）
- [ ] 應用部署成功（無錯誤）
- [ ] 公開網址已生成
- [ ] 網站可以訪問
- [ ] WebSocket 連接成功（Console 顯示綠色勾）
- [ ] 測試實時同步正常運作
- [ ] 兩個視窗可以即時同步

---

## 🎉 恭喜！

您已成功部署羽毛球排隊系統到 Railway！

### 下一步

- 📱 分享網址給隊友測試
- 🔍 監控使用量和效能
- 🎨 根據需求繼續開發功能
- 📈 查看 Railway 使用情況

### 有用的連結

- 🚂 Railway Dashboard: https://railway.app/dashboard
- 📚 Railway 文檔: https://docs.railway.app
- 💬 Railway Discord: https://discord.gg/railway

---

**享受實時同步的流暢體驗！** ⚡🏸

