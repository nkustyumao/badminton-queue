/**
 * 實時同步配置
 * 用於控制多裝置間的數據同步行為
 */

export const realtimeConfig = {
  // ⚡ WebSocket 模式：停用輪詢，使用 WebSocket 實時推送
  // 如果要切換回輪詢模式，請將 refetchInterval 改為數字（如 3000）
  refetchInterval: false,

  // 當視窗重新獲得焦點時是否自動更新
  refetchOnWindowFocus: true,

  // 當網路重新連接時是否自動更新
  refetchOnReconnect: true,

  // 資料保持新鮮的時間（毫秒）
  // 0 表示每次都檢查更新
  staleTime: 0,

  // 快取保留時間（毫秒）
  gcTime: 1000 * 60 * 10, // 10 分鐘
};

/**
 * 根據不同場景的預設配置
 */
export const presetConfigs = {
  // 高實時性 - 適合比賽進行時
  highRealtime: {
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  },

  // 標準 - 適合一般使用
  standard: {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  },

  // 省電模式 - 減少請求頻率
  lowPower: {
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 5000,
  },

  // 停用自動更新 - 僅手動更新
  manual: {
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    staleTime: Infinity,
  },
};

