/**
 * React Query Provider 組件
 * 將 QueryClient 提供給整個應用程式
 */

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }) {
  // 在組件內部創建 QueryClient，避免 SSR 問題
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 預設設定：資料在視窗獲得焦點時不自動重新獲取
            refetchOnWindowFocus: false,
            // 預設設定：資料在重新連線時不自動重新獲取
            refetchOnReconnect: false,
            // 預設設定：失敗時重試次數
            retry: 1,
            // 預設設定：資料過期時間（5 分鐘）
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開發環境下顯示 React Query Devtools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

