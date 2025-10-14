/**
 * WebSocket 工具函數
 * 用於在 API 路由中廣播實時更新事件
 */

/**
 * WebSocket 事件類型定義
 */
export const WS_EVENTS = {
  // 場地相關事件
  COURT_CREATED: 'court:created',
  COURT_UPDATED: 'court:updated',
  COURT_DELETED: 'court:deleted',
  COURTS_CLEARED: 'courts:cleared',
  
  // 隊員相關事件
  MEMBER_CREATED: 'member:created',
  MEMBER_UPDATED: 'member:updated',
  MEMBER_DELETED: 'member:deleted',
  
  // 場地隊員關聯事件
  MEMBER_ADDED_TO_COURT: 'member:addedToCourt',
  MEMBER_REMOVED_FROM_COURT: 'member:removedFromCourt',
  
  // 設定相關事件
  SETTING_UPDATED: 'setting:updated',
  
  // 系統事件
  DATA_REFRESH: 'data:refresh',
};

/**
 * 廣播更新事件到所有連接的客戶端
 * @param {string} eventType - 事件類型 (使用 WS_EVENTS 中定義的常量)
 * @param {Object} data - 要傳送的資料
 */
export function broadcastUpdate(eventType, data = {}) {
  try {
    // 從 global 獲取 Socket.IO 實例
    const io = global.io;
    
    if (!io) {
      console.warn('⚠️ WebSocket 未初始化，無法廣播事件:', eventType);
      return;
    }

    // 廣播事件到所有連接的客戶端
    io.emit(eventType, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`📡 WebSocket 廣播: ${eventType}`, data);
  } catch (error) {
    console.error('❌ WebSocket 廣播失敗:', error);
  }
}

/**
 * 廣播到特定房間
 * @param {string} room - 房間名稱
 * @param {string} eventType - 事件類型
 * @param {Object} data - 要傳送的資料
 */
export function broadcastToRoom(room, eventType, data = {}) {
  try {
    const io = global.io;
    
    if (!io) {
      console.warn('⚠️ WebSocket 未初始化');
      return;
    }

    io.to(room).emit(eventType, {
      timestamp: new Date().toISOString(),
      ...data,
    });

    console.log(`📡 WebSocket 廣播到房間 ${room}: ${eventType}`);
  } catch (error) {
    console.error('❌ WebSocket 廣播失敗:', error);
  }
}

/**
 * 獲取當前連接的客戶端數量
 * @returns {number} 連接數量
 */
export function getConnectedClientsCount() {
  try {
    const io = global.io;
    if (!io) return 0;
    
    return io.engine.clientsCount || 0;
  } catch (error) {
    console.error('❌ 獲取客戶端數量失敗:', error);
    return 0;
  }
}

/**
 * 檢查 WebSocket 是否已初始化
 * @returns {boolean}
 */
export function isWebSocketReady() {
  return !!global.io;
}

