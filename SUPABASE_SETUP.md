# Supabase 資料庫設定說明

本專案已改為使用 **Supabase（PostgreSQL）** 作為資料庫。請依下列步驟設定。

---

## 一、建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 並登入。
2. 點 **New project**，選擇組織、輸入專案名稱與資料庫密碼（請妥善保存）。
3. 選擇區域（例如 `Northeast Asia (Tokyo)`）後建立專案，等待約 1–2 分鐘。

---

## 二、取得連線字串（DATABASE_URL）

1. 在專案左側選 **Project Settings**（齒輪圖示）。
2. 左側點 **Database**。
3. 捲到 **Connection string** 區塊。
4. 選擇 **URI** 分頁，複製連線字串，格式類似：
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```
5. 將 `[YOUR-PASSWORD]` 替換成你建立專案時設定的**資料庫密碼**，得到完整的 `DATABASE_URL`。

> 若使用 **Session mode** 或 **Transaction mode** 的 Pooler 連線（port 6543），可直接用於本專案。  
> 若使用 **Direct connection**（port 5432），也可以，同樣貼到 `DATABASE_URL` 即可。

---

## 三、在 Supabase 建立資料表

1. 在專案左側選 **SQL Editor**。
2. 點 **New query**，開啟新查詢。
3. 開啟專案根目錄的 **`supabase_init.sql`**，複製全部內容，貼到 SQL Editor。
4. 點 **Run**（或 Ctrl+Enter）執行。
5. 看到 `Database initialized successfully!` 即表示資料表與預設設定已建立完成。

---

## 四、在本機設定環境變數

1. 在專案根目錄建立或編輯 **`.env.local`**。
2. 加入一行（請換成你的實際連線字串）：

   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:你的密碼@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

3. 若原本有 Railway 的 `DB_HOST`、`DB_USER` 等變數，可以刪除或保留不影響；本專案現在只使用 **`DATABASE_URL`**。
4. 儲存檔案後，**重新啟動**開發伺服器（`npm run dev` 或 `node server.js`）。

---

## 五、驗證連線

1. 啟動專案後，在瀏覽器開啟：
   ```text
   http://localhost:3000/api/test-db
   ```
2. 若回傳 `"success": true` 且 `"connected": true`，代表已成功連到 Supabase。

---

## 六、部署到正式環境（Vercel / Railway 等）

在部署平台的 **Environment Variables** 中新增：

| 變數名稱       | 值                    |
|----------------|------------------------|
| `DATABASE_URL` | 你的 Supabase 連線字串 |

同樣使用上面「二、取得連線字串」中替換好密碼的完整 URI。

---

## 常見問題

- **連線逾時或失敗**  
  確認 `DATABASE_URL` 是否完整、密碼是否正確，且沒有多餘空格。  
  若使用 Pooler（port 6543），Supabase 會要求 SSL，本專案已自動加上 `ssl: { rejectUnauthorized: false }`。

- **表格不存在**  
  請再執行一次 **`supabase_init.sql`**（見「三、在 Supabase 建立資料表」）。

- **想用 Direct connection**  
  在 Database 設定頁的 Connection string 區塊可切換 **Direct connection**，複製其 URI 作為 `DATABASE_URL` 即可。

---

完成以上步驟後，應用程式就會使用 Supabase 作為資料庫。
