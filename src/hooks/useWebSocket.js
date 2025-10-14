/**
 * WebSocket 客戶端 Hook
 * 用於在客戶端監聽 WebSocket 事件並自動更新 React Query 快取
 */

"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const WS_EVENTS = {
  COURT_CREATED: 'court:created',
  COURT_UPDATED: 'court:updated',
  COURT_DELETED: 'court:deleted',
  COURTS_CLEARED: 'courts:cleared',
  MEMBER_CREATED: 'member:created',
  MEMBER_UPDATED: 'member:updated',
  MEMBER_DELETED: 'member:deleted',
  MEMBER_ADDED_TO_COURT: 'member:addedToCourt',
  MEMBER_REMOVED_FROM_COURT: 'member:removedFromCourt',
  SETTING_UPDATED: 'setting:updated',
};

export function useWebSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    // 連接 WebSocket 服務器
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketRef.current = socket;

    // 連接成功
    socket.on('connect', () => {
      console.log('✅ WebSocket 已連接:', socket.id);
    });

    // 連接錯誤
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket 連接錯誤:', error.message);
    });

    // 斷開連接
    socket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket 已斷開:', reason);
      
      // 如果是服務器主動斷開或網路錯誤，嘗試重連
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    // 重新連接
    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket 已重新連接 (嘗試次數:', attemptNumber, ')');
      // 重連後刷新所有資料
      queryClient.invalidateQueries();
    });

    // ============ 監聽場地相關事件 ============
    
    socket.on(WS_EVENTS.COURT_CREATED, () => {
      console.log('📡 收到事件: 場地已創建');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on(WS_EVENTS.COURT_UPDATED, () => {
      console.log('📡 收到事件: 場地已更新');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on(WS_EVENTS.COURT_DELETED, () => {
      console.log('📡 收到事件: 場地已刪除');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on(WS_EVENTS.COURTS_CLEARED, () => {
      console.log('📡 收到事件: 所有場地已清除');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    // ============ 監聽隊員相關事件 ============
    
    socket.on(WS_EVENTS.MEMBER_CREATED, () => {
      console.log('📡 收到事件: 隊員已創建');
      queryClient.invalidateQueries({ queryKey: ['members'] });
    });

    socket.on(WS_EVENTS.MEMBER_UPDATED, () => {
      console.log('📡 收到事件: 隊員已更新');
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on(WS_EVENTS.MEMBER_DELETED, () => {
      console.log('📡 收到事件: 隊員已刪除');
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    // ============ 監聽場地隊員關聯事件 ============
    
    socket.on(WS_EVENTS.MEMBER_ADDED_TO_COURT, () => {
      console.log('📡 收到事件: 隊員已加入場地');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    socket.on(WS_EVENTS.MEMBER_REMOVED_FROM_COURT, () => {
      console.log('📡 收到事件: 隊員已移出場地');
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    });

    // ============ 監聽設定相關事件 ============
    
    socket.on(WS_EVENTS.SETTING_UPDATED, () => {
      console.log('📡 收到事件: 設定已更新');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    });

    // 清理函數
    return () => {
      console.log('🔌 關閉 WebSocket 連接');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket.off();
      socket.disconnect();
    };
  }, [queryClient]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
}

/**
 * 獲取 WebSocket 連接狀態的 Hook
 */
export function useWebSocketStatus() {
  const { socket, isConnected } = useWebSocket();
  
  return {
    isConnected,
    socketId: socket?.id || null,
  };
}

