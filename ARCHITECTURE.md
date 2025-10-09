# 專案架構說明

## 📁 資料夾結構

```
src/
├── app/                      # Next.js App Router 頁面
│   ├── api/                  # API 路由
│   │   └── members/          # 會員相關 API
│   │       └── route.js      # GET /api/members, POST /api/members
│   ├── layout.js             # 全局佈局（包含 QueryProvider）
│   └── page.js               # 首頁
│
├── components/               # React 組件
│   ├── Sidebar.js            # 側邊欄（會員列表 + 新增表單）
│   ├── GameArea.js           # 比賽區組件
│   ├── WaitingArea.js        # 等待區組件
│   └── QueueArea.js          # 排隊區組件
│
├── hooks/                    # 自定義 React Hooks
│   └── useMembers.js         # TanStack Query hooks（會員相關）
│
├── services/                 # API 服務層
│   └── memberService.js      # 會員 API 請求函數
│
├── providers/                # React Context Providers
│   └── QueryProvider.js      # TanStack Query Provider
│
└── lib/                      # 工具函數庫
    └── db.js                 # 資料庫連接設定
```

## 🏗️ 分層架構

### 1. **API 路由層** (`src/app/api/`)
- **職責**：處理 HTTP 請求，與資料庫互動
- **檔案**：`route.js`
- **範例**：
  - `GET /api/members` - 獲取會員列表
  - `POST /api/members` - 新增會員

### 2. **服務層** (`src/services/`)
- **職責**：封裝所有 API 請求邏輯，提供純函數
- **檔案**：`memberService.js`
- **優點**：
  - 與 UI 邏輯分離
  - 可重複使用
  - 易於測試
  - 統一錯誤處理

```javascript
// 範例使用
import { fetchMembers, createMember } from '@/services/memberService';

const members = await fetchMembers();
const newMember = await createMember({ name: '張三', ... });
```

### 3. **Hooks 層** (`src/hooks/`)
- **職責**：使用 TanStack Query 管理伺服器狀態
- **檔案**：`useMembers.js`
- **功能**：
  - 自動快取管理
  - 背景資料重新獲取
  - 樂觀更新
  - 載入和錯誤狀態管理

```javascript
// 範例使用
import { useMembers, useCreateMember } from '@/hooks/useMembers';

// 在組件中
const { data: members, isLoading, isError } = useMembers();
const createMutation = useCreateMember();
```

### 4. **組件層** (`src/components/`)
- **職責**：UI 呈現和用戶互動
- **檔案**：`Sidebar.js`, `GameArea.js`, 等
- **特點**：
  - 只負責 UI 邏輯
  - 使用 hooks 獲取資料
  - 保持組件簡潔

### 5. **Provider 層** (`src/providers/`)
- **職責**：提供全局狀態管理
- **檔案**：`QueryProvider.js`
- **功能**：
  - 配置 TanStack Query
  - 提供開發工具（Devtools）

## 🔄 資料流向

```
用戶操作 (UI)
    ↓
組件 (Component)
    ↓
Hooks (useMembers, useCreateMember)
    ↓
服務層 (memberService.js)
    ↓
API 路由 (/api/members)
    ↓
資料庫 (MySQL)
```

## 📦 TanStack Query 使用

### Query Keys 管理
```javascript
export const memberKeys = {
  all: ['members'],
  lists: () => [...memberKeys.all, 'list'],
  detail: (id) => [...memberKeys.all, 'detail', id],
};
```

### Query Hook 範例
```javascript
export function useMembers() {
  return useQuery({
    queryKey: memberKeys.lists(),
    queryFn: fetchMembers,
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
}
```

### Mutation Hook 範例
```javascript
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      // 自動重新獲取列表
      queryClient.invalidateQueries({ 
        queryKey: memberKeys.lists() 
      });
    },
  });
}
```

## ✅ 優點

1. **關注點分離**：每層職責清晰
2. **可維護性**：易於找到和修改代碼
3. **可測試性**：每層都可以獨立測試
4. **可重用性**：服務層和 hooks 可以在多個組件中使用
5. **類型安全**：統一的 API 介面
6. **自動快取**：TanStack Query 自動管理資料快取
7. **錯誤處理**：統一的錯誤處理機制

## 🚀 未來擴展

已預留以下功能的介面：

- `updateMember(id, data)` - 更新會員資料
- `deleteMember(id)` - 刪除會員
- `useUpdateMember()` - 更新會員 Hook
- `useDeleteMember()` - 刪除會員 Hook

需要時可直接實作對應的 API 路由即可使用。

