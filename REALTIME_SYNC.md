# 🔄 多裝置實時同步功能說明

## 📋 目錄
1. [功能概述](#功能概述)
2. [已實現：輪詢方案](#已實現輪詢方案)
3. [調整同步設定](#調整同步設定)
4. [進階方案：WebSocket](#進階方案websocket)
5. [性能優化建議](#性能優化建議)

---

## 功能概述

當 A 裝置對網站進行操作（新增隊員、新增場地、場地加入隊員等），B 裝置會自動同步顯示最新數據，無需手動刷新頁面。

### ✅ 已實現的功能
- 自動輪詢：每 3 秒自動向服務器請求最新數據
- 窗口焦點自動更新：切換回瀏覽器標籤時自動更新
- 網路重連自動更新：網路重新連接時自動更新
- 統一配置管理：可在單一檔案中調整所有同步設定

---

## 已實現：輪詢方案

### 運作原理
使用 React Query 的 `refetchInterval` 功能，定期向服務器發送請求，獲取最新數據。

### 同步的數據類型
- ✅ 場地資料 (courts)
- ✅ 隊員資料 (members)
- ✅ 系統設定 (settings)

### 特點
- **優點**
  - 實現簡單，不需額外服務器配置
  - 穩定可靠
  - 適合中小型應用
  
- **缺點**
  - 有輕微延遲（最多 3 秒）
  - 會增加服務器請求次數

---

## 調整同步設定

### 方法 1：修改配置文件（推薦）

編輯 `src/config/realtimeConfig.js`：

```javascript
export const realtimeConfig = {
  // 修改這個值來調整輪詢間隔（毫秒）
  refetchInterval: 3000,  // 預設 3 秒
  
  // 其他設定...
};
```

### 方法 2：使用預設配置

在 `src/config/realtimeConfig.js` 中有多種預設配置：

```javascript
import { presetConfigs } from '@/config/realtimeConfig';

// 使用高實時性配置（2秒）
export const realtimeConfig = presetConfigs.highRealtime;

// 使用標準配置（5秒）
export const realtimeConfig = presetConfigs.standard;

// 使用省電模式（15秒）
export const realtimeConfig = presetConfigs.lowPower;

// 停用自動更新（僅手動）
export const realtimeConfig = presetConfigs.manual;
```

### 建議的間隔時間

| 使用場景 | 建議間隔 | 說明 |
|---------|---------|------|
| 比賽進行中 | 2-3 秒 | 高實時性需求 |
| 一般使用 | 5-10 秒 | 平衡性能與實時性 |
| 低頻更新 | 15-30 秒 | 減少服務器負擔 |
| 手動更新 | 停用 | 完全由用戶控制 |

---

## 進階方案：WebSocket

如果需要更高的實時性（零延遲），可以實現 WebSocket 方案。

### 實現步驟

#### 1. 安裝依賴

```bash
npm install ws socket.io socket.io-client
```

#### 2. 創建 WebSocket 服務器

創建 `src/lib/websocket.js`：

```javascript
import { Server } from 'socket.io';

let io;

export function initWebSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on('connection', (socket) => {
      console.log('客戶端已連接:', socket.id);

      socket.on('disconnect', () => {
        console.log('客戶端已斷開:', socket.id);
      });
    });
  }
  return io;
}

// 廣播更新事件
export function broadcastUpdate(eventType, data) {
  if (io) {
    io.emit(eventType, data);
  }
}

// 事件類型
export const WS_EVENTS = {
  COURT_CREATED: 'court:created',
  COURT_UPDATED: 'court:updated',
  COURT_DELETED: 'court:deleted',
  MEMBER_CREATED: 'member:created',
  MEMBER_UPDATED: 'member:updated',
  MEMBER_DELETED: 'member:deleted',
  MEMBER_ADDED_TO_COURT: 'member:addedToCourt',
  MEMBER_REMOVED_FROM_COURT: 'member:removedFromCourt',
};
```

#### 3. 創建客戶端 Hook

創建 `src/hooks/useWebSocket.js`：

```javascript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

export function useWebSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 連接 WebSocket 服務器
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    // 監聽場地相關事件
    socket.on('court:created', () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on('court:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on('court:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    // 監聽隊員相關事件
    socket.on('member:created', () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    });

    socket.on('member:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    });

    socket.on('member:addedToCourt', () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    // 清理連接
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
}
```

#### 4. 在 API 中觸發事件

在 API 路由中加入廣播邏輯，例如 `src/app/api/courts/route.js`：

```javascript
import { broadcastUpdate, WS_EVENTS } from '@/lib/websocket';

export async function POST(request) {
  // ... 創建場地邏輯 ...
  
  // 廣播更新
  broadcastUpdate(WS_EVENTS.COURT_CREATED, { court: newCourt });
  
  return NextResponse.json(newCourt);
}
```

#### 5. 在主組件中使用

在 `src/app/page.js` 或 `src/app/layout.js` 中：

```javascript
import { useWebSocket } from '@/hooks/useWebSocket';

export default function App() {
  // 啟用 WebSocket
  useWebSocket();
  
  // ... 其他代碼 ...
}
```

---

## 性能優化建議

### 1. 使用輪詢方案時

```javascript
// ✅ 好的做法
export const realtimeConfig = {
  refetchInterval: 5000,  // 適中的間隔
  refetchOnWindowFocus: true,  // 焦點時更新
  refetchOnReconnect: true,    // 重連時更新
};

// ❌ 避免
export const realtimeConfig = {
  refetchInterval: 500,  // 太頻繁，會增加服務器負擔
};
```

### 2. 根據使用情境調整

```javascript
// 比賽進行時使用高頻率
if (isGameInProgress) {
  realtimeConfig.refetchInterval = 2000;
} else {
  realtimeConfig.refetchInterval = 10000;
}
```

### 3. 使用 React Query DevTools 監控

在 `src/providers/QueryProvider.js` 中：

```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開發環境中顯示 DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 4. 監控網路請求

打開瀏覽器開發者工具 → Network 標籤，觀察：
- 請求頻率是否合理
- 是否有過多的重複請求
- 服務器響應時間

---

## 測試實時同步

### 測試步驟

1. **開啟兩個瀏覽器視窗**
   - 視窗 A：http://localhost:3000
   - 視窗 B：http://localhost:3000

2. **在視窗 A 進行操作**
   - 新增隊員
   - 新增場地
   - 將隊員加入場地

3. **觀察視窗 B**
   - 最多 3 秒後應該自動顯示更新
   - 無需手動刷新頁面

4. **測試視窗焦點功能**
   - 切換到其他應用程式
   - 在視窗 A 進行操作
   - 切換回視窗 B
   - 應該立即看到更新

---

## 常見問題

### Q: 為什麼有時候更新會延遲？
A: 輪詢方案會有最多 3 秒的延遲（取決於 `refetchInterval` 設定）。如需零延遲，請使用 WebSocket 方案。

### Q: 會不會增加服務器負擔？
A: 會增加一些請求量，但 3 秒的間隔是合理的。可以根據實際需求調整間隔時間。

### Q: 如何停用自動更新？
A: 在 `src/config/realtimeConfig.js` 中設定：
```javascript
export const realtimeConfig = {
  refetchInterval: false,  // 停用輪詢
};
```

### Q: 可以只在某些頁面啟用嗎？
A: 可以在特定的 Hook 中覆蓋配置：
```javascript
export function useCourts(status = null, enableRealtime = true) {
  return useQuery({
    // ...
    refetchInterval: enableRealtime ? realtimeConfig.refetchInterval : false,
  });
}
```

---

## 總結

✅ **目前實現**：輪詢方案（每 3 秒自動更新）
- 簡單、穩定、易於維護
- 適合目前的應用規模

🚀 **未來升級**：WebSocket 方案（零延遲）
- 適合需要極高實時性的場景
- 需要額外的服務器配置

根據您的需求選擇合適的方案！

