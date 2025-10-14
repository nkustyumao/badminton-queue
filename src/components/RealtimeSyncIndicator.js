/**
 * 實時同步狀態指示器
 * 顯示當前的同步狀態和最後更新時間
 */

"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { realtimeConfig } from "@/config/realtimeConfig";

export default function RealtimeSyncIndicator() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [countdown, setCountdown] = useState(realtimeConfig.refetchInterval / 1000);
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

  // 倒數計時器
  useEffect(() => {
    if (!realtimeConfig.refetchInterval) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setLastUpdate(new Date());
          return realtimeConfig.refetchInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 手動刷新
  const handleManualRefresh = () => {
    queryClient.invalidateQueries();
    setLastUpdate(new Date());
    setCountdown(realtimeConfig.refetchInterval / 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[200px]">
        {/* 標題 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-semibold text-gray-700">實時同步</span>
          </div>
          <button
            onClick={handleManualRefresh}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="手動刷新"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 狀態資訊 */}
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>狀態:</span>
            <span className={isOnline ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {isOnline ? "已連線" : "離線"}
            </span>
          </div>

          {realtimeConfig.refetchInterval && (
            <div className="flex justify-between">
              <span>下次更新:</span>
              <span className="text-blue-600 font-semibold">{countdown}秒</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>間隔:</span>
            <span className="font-semibold">
              {realtimeConfig.refetchInterval ? `${realtimeConfig.refetchInterval / 1000}秒` : "手動"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>最後更新:</span>
            <span className="font-semibold">{formatTime(lastUpdate)}</span>
          </div>
        </div>

        {/* 狀態指示燈 */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline && realtimeConfig.refetchInterval ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <span className="text-xs text-gray-500">
              {isOnline && realtimeConfig.refetchInterval ? "自動同步中" : "已停用"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

