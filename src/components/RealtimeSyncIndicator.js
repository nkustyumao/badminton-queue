/**
 * WebSocket 實時同步狀態指示器
 * 顯示 WebSocket 連接狀態和最後更新時間
 * 響應式設計：桌面版顯示完整資訊，手機版顯示簡化狀態條
 */

"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Wifi, WifiOff, RefreshCw, Zap, Circle } from "lucide-react";

export default function RealtimeSyncIndicator() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  // 監聽網路狀態
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 監聽 WebSocket 事件
  useEffect(() => {
    // 檢查 WebSocket 連接狀態
    const checkSocketConnection = () => {
      if (typeof window !== 'undefined' && window.io) {
        const socket = window.io.socket;
        if (socket) {
          setSocketConnected(socket.connected);
          setSocketId(socket.id);
        }
      }
    };

    // 初始檢查
    checkSocketConnection();

    // 定期檢查（每秒）
    const interval = setInterval(checkSocketConnection, 1000);

    // 監聽自定義事件（從 useWebSocket 發出）
    const handleSocketEvent = (event) => {
      setLastUpdate(new Date());
      setLastEvent(event.detail?.type || 'update');
      
      // 3秒後清除事件提示
      setTimeout(() => setLastEvent(null), 3000);
    };

    window.addEventListener('websocket-event', handleSocketEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('websocket-event', handleSocketEvent);
    };
  }, []);

  // 手動刷新
  const handleManualRefresh = () => {
    queryClient.invalidateQueries();
    setLastUpdate(new Date());
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const wsStatus = socketConnected && isOnline;

  return (
    <>
      {/* 桌面版：右下角浮動指示器 */}
      <div className="hidden lg:block fixed bottom-4 right-4 z-50">
        <div 
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[220px] cursor-pointer hover:shadow-xl transition-all"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* 標題 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {wsStatus ? (
                <Zap className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-semibold text-gray-700">WebSocket</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleManualRefresh();
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="手動刷新"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* 狀態資訊 */}
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between items-center">
              <span>連接狀態:</span>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${wsStatus ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                <span className={wsStatus ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {wsStatus ? "已連線" : "未連線"}
                </span>
              </div>
            </div>

            {isExpanded && (
              <>
                {socketId && (
                  <div className="flex justify-between">
                    <span>Socket ID:</span>
                    <span className="font-mono text-xs">{socketId.substring(0, 8)}...</span>
                  </div>
                )}

                {lastEvent && (
                  <div className="flex justify-between">
                    <span>最新事件:</span>
                    <span className="text-blue-600 font-semibold animate-pulse">{lastEvent}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>最後更新:</span>
                  <span className="font-semibold">{formatTime(lastUpdate)}</span>
                </div>

                <div className="flex justify-between">
                  <span>網路:</span>
                  <span className={isOnline ? "text-green-600" : "text-red-600"}>
                    {isOnline ? "正常" : "離線"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* 即時同步提示 */}
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Circle className={`w-2 h-2 ${wsStatus ? "text-green-500 fill-green-500" : "text-gray-400"}`} />
              <span className="text-xs text-gray-500">
                {wsStatus ? "即時同步 (<100ms)" : "已斷線"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 手機版：底部固定狀態條 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {wsStatus ? (
              <Zap className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${wsStatus ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
              <span className="text-xs font-semibold text-gray-700">
                {wsStatus ? "即時同步" : "已斷線"}
              </span>
            </div>
            {lastEvent && (
              <span className="text-xs text-blue-600 animate-pulse">• {lastEvent}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{formatTime(lastUpdate)}</span>
            <button
              onClick={handleManualRefresh}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="手動刷新"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

