/**
 * Header 組件
 * 包含漢堡選單按鈕和實時同步狀態指示器
 * 響應式設計：在所有設備上顯示
 */

"use client";

import { useState, useEffect } from "react";
import { Menu, X, Wifi, WifiOff, RefreshCw, Zap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

export default function Header({ isSidebarOpen, onToggleSidebar }) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // 確保組件已掛載
  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (typeof window !== "undefined" && window.io) {
        const socket = window.io.socket;
        if (socket) {
          setSocketConnected(socket.connected);
        }
      }
    };

    checkSocketConnection();
    const interval = setInterval(checkSocketConnection, 1000);

    // 監聽自定義事件
    const handleSocketEvent = (event) => {
      setLastUpdate(new Date());
      setLastEvent(event.detail?.type || "update");
      setTimeout(() => setLastEvent(null), 3000);
    };

    window.addEventListener("websocket-event", handleSocketEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("websocket-event", handleSocketEvent);
    };
  }, []);

  // 手動刷新
  const handleManualRefresh = () => {
    queryClient.invalidateQueries();
    setLastUpdate(new Date());
  };

  const wsStatus = socketConnected && isOnline;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左側：漢堡選單按鈕（手機版）+ 標題 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* 標題 */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-lg hidden sm:block">
              <img src="/badminton.png" alt="logo" className="w-5 h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              羽球排隊系統
            </h1>
          </div>
        </div>

        {/* 右側：實時同步狀態指示器 */}
        <div className="flex items-center gap-2">
          {/* 桌面版：完整狀態 */}
          <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <div className="flex items-center gap-2">
              {wsStatus ? <Zap className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${wsStatus ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                <span className="text-sm font-semibold text-gray-700">{wsStatus ? "即時同步" : "已斷線"}</span>
              </div>
              {lastEvent && <span className="text-xs text-blue-600 animate-pulse ml-1">• {lastEvent}</span>}
            </div>

            <div className="h-4 w-px bg-gray-300"></div>

            <span className="text-xs text-gray-500 font-medium">
              {mounted ? dayjs(lastUpdate).format("A h:mm:ss") : "--:--:--"}
            </span>

            <button
              onClick={handleManualRefresh}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              title="手動刷新"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* 手機版：精簡狀態 */}
          <div className="md:hidden flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-200">
            {wsStatus ? (
              <Zap className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-500" />
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${wsStatus ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
            <span className="text-[.8rem] text-gray-500 text-nowrap">
              {mounted ? dayjs(lastUpdate).format("A h:mm") : "--:--"}
            </span>
            <button
              onClick={handleManualRefresh}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="手動刷新"
            >
              <RefreshCw className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
