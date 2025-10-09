/**
 * 羽球排隊系統主頁面
 * 包含側邊欄（隊員列表）和三個主要區塊（比賽區、等待區、排隊區）
 * 支援手機響應式設計
 */

"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import GameArea from "@/components/GameArea";
import WaitingArea from "@/components/WaitingArea";
import QueueArea from "@/components/QueueArea";
import { Menu, X } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";

export default function Home() {
  // 手機版側邊欄開關狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 使用 TanStack Query 獲取會員資料
  const { data: members = [], isLoading, isError, error } = useMembers();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* 手機版漢堡選單按鈕 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 手機版遮罩層 */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* 左側側邊欄 - 隊員列表 */}
      <div
        className={`
        fixed lg:relative z-40 h-full
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <Sidebar members={members} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* 右側主要內容區 */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-100">
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6">
          {/* 系統標題 */}
          <div className="text-center animate-fade-in-down">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">🏸 羽球排隊系統</h1>
          </div>

          {/* 載入狀態 */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 animate-pulse text-sm md:text-base">載入中...</p>
            </div>
          )}

          {/* 錯誤狀態 */}
          {isError && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="text-red-600 text-5xl mb-4">⚠️</div>
                <h3 className="text-red-800 font-bold text-lg mb-2">載入失敗</h3>
                <p className="text-red-600 text-sm">{error?.message || "無法獲取會員資料，請稍後再試"}</p>
              </div>
            </div>
          )}

          {/* 三個主要區塊 */}
          {!isLoading && !isError && (
            <div className="space-y-4 md:space-y-6">
              {/* 比賽區 */}
              <div className="h-64 md:h-80 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <GameArea />
              </div>

              {/* 等待區和排隊區 - 手機垂直排列，桌面並排顯示 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="h-64 md:h-80 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <WaitingArea />
                </div>
                <div className="h-64 md:h-80 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <QueueArea />
                </div>
              </div>
            </div>
          )}

          {/* 手機版底部安全區域 */}
          <div className="h-4 lg:hidden"></div>
        </div>
      </div>

      {/* 全局動畫樣式 */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float-1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(50px, 30px) scale(1.1);
          }
        }

        @keyframes float-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, -50px) scale(1.2);
          }
        }

        @keyframes float-3 {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(calc(-50% + 40px), calc(-50% - 40px)) scale(1.15);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float-1 {
          animation: float-1 15s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 20s ease-in-out infinite;
        }

        .animate-float-3 {
          animation: float-3 18s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
