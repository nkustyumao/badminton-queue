# 實時同步配置說明

## 📁 檔案說明

### `realtimeConfig.js`
集中管理所有實時同步相關的配置。

## 🔧 配置選項

### `refetchInterval`
- **類型**: `number | false`
- **預設值**: `3000` (3秒)
- **說明**: 自動輪詢的間隔時間（毫秒）
- **範例**:
  ```javascript
  refetchInterval: 3000  // 每 3 秒更新一次
  refetchInterval: 5000  // 每 5 秒更新一次
  refetchInterval: false // 停用自動更新
  ```

### `refetchOnWindowFocus`
- **類型**: `boolean`
- **預設值**: `true`
- **說明**: 當瀏覽器視窗重新獲得焦點時是否自動更新
- **範例**:
  ```javascript
  refetchOnWindowFocus: true  // 切回視窗時自動更新
  refetchOnWindowFocus: false // 不自動更新
  ```

### `refetchOnReconnect`
- **類型**: `boolean`
- **預設值**: `true`
- **說明**: 當網路重新連接時是否自動更新
- **範例**:
  ```javascript
  refetchOnReconnect: true  // 網路恢復時自動更新
  refetchOnReconnect: false // 不自動更新
  ```

### `staleTime`
- **類型**: `number`
- **預設值**: `0`
- **說明**: 資料保持新鮮的時間（毫秒），0 表示每次都檢查更新
- **範例**:
  ```javascript
  staleTime: 0              // 資料永遠視為過期
  staleTime: 5000           // 5 秒內視為新鮮
  staleTime: Infinity       // 永遠視為新鮮（不更新）
  ```

### `gcTime`
- **類型**: `number`
- **預設值**: `600000` (10分鐘)
- **說明**: 快取保留時間（毫秒）
- **範例**:
  ```javascript
  gcTime: 600000            // 10 分鐘後清除快取
  gcTime: 300000            // 5 分鐘後清除快取
  ```

## 🎯 預設配置

### highRealtime（高實時性）
適合比賽進行時使用
```javascript
{
  refetchInterval: 2000,        // 2秒更新
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 0,
}
```

### standard（標準）⭐
適合一般使用（**預設**）
```javascript
{
  refetchInterval: 5000,        // 5秒更新
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 0,
}
```

### lowPower（省電模式）
減少請求頻率
```javascript
{
  refetchInterval: 15000,       // 15秒更新
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 5000,
}
```

### manual（手動模式）
完全停用自動更新
```javascript
{
  refetchInterval: false,       // 不自動更新
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  staleTime: Infinity,
}
```

## 💡 使用方式

### 切換預設配置

編輯 `realtimeConfig.js`：

```javascript
import { presetConfigs } from './presetConfigs';

// 使用高實時性配置
export const realtimeConfig = presetConfigs.highRealtime;

// 或使用省電模式
export const realtimeConfig = presetConfigs.lowPower;
```

### 自訂配置

```javascript
export const realtimeConfig = {
  refetchInterval: 8000,        // 自訂 8 秒
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  staleTime: 0,
  gcTime: 1000 * 60 * 10,
};
```

## 📊 效能建議

| 使用者數量 | 建議間隔 | 配置 |
|-----------|---------|------|
| < 10 人 | 2-3 秒 | highRealtime |
| 10-50 人 | 5-8 秒 | standard |
| > 50 人 | 10-15 秒 | lowPower |
| 測試環境 | 手動 | manual |

## 🔄 配置生效

修改配置後，只需：
1. 儲存檔案
2. 瀏覽器會自動重新載入（Next.js 熱更新）
3. 無需重啟服務器

## 📝 注意事項

- 間隔時間越短，實時性越高，但伺服器負擔越大
- 建議根據實際使用情況調整
- 可以在瀏覽器 Network 標籤監控請求頻率

