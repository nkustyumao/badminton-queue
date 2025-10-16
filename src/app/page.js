/**
 * 羽球排隊系統主頁面
 * 包含側邊欄（隊員列表）和三個主要區塊（比賽區、等待區、排隊區）
 * 支援手機響應式設計
 */

"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import GameArea from "@/components/GameArea";
import WaitingArea from "@/components/WaitingArea";
import QueueArea from "@/components/QueueArea";
import MemberSelectionModal from "@/components/MemberSelectionModal";
import { useMembers } from "@/hooks/useMembers";
import { useCourts } from "@/hooks/useCourts";
import { useWebSocket } from "@/hooks/useWebSocket";
import LevelTableModel from "@/components/publicModel";
import { useModelState } from "@/store/modelState";

export default function Home() {
  // 🔥 啟用 WebSocket 實時同步
  useWebSocket();
  // 手機版側邊欄開關狀態
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 選取的隊員ID列表
  const [selectedMembers, setSelectedMembers] = useState([]);
  // 使用 TanStack Query 獲取會員資料
  const { data: members = [], isLoading, isError, error } = useMembers();
  // 使用 TanStack Query 獲取場地資料
  const { data: courts = [] } = useCourts();
  // 程度表開關狀態
  const showLevelTable = useModelState((state) => state.showLevelTableModel);

  // 已在場地中的隊員ID列表
  const courtsMembers = useMemo(() => {
    return courts.flatMap((court) => court.members.map((member) => member.id));
  }, [courts]);

  // 切換隊員選取狀態
  const handleToggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // 清除選取
  const handleClearSelection = () => {
    setSelectedMembers([]);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative pt-16">
      {/* Header - 包含漢堡選單和實時同步狀態 */}
      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* 手機版遮罩層 */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm mt-16"
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
        <Sidebar
          members={members}
          onClose={() => setIsSidebarOpen(false)}
          selectedMembers={selectedMembers}
          onToggleMember={handleToggleMember}
          courtsMembers={courtsMembers}
        />
      </div>

      {/* 右側主要內容區 */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-100">
        <div className="p-3 md:p-4 lg:p-6 max-w-[1920px] mx-auto">
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
            <>
              <div className="space-y-3 md:space-y-4 lg:space-y-6">
                {/* 比賽區 */}
                <div className=" animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <GameArea members={members} />
                </div>
                {/* 排隊區 */}
                <div className=" animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <QueueArea members={members} />
                </div>
                {/* 等待區 */}
                <div className=" animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <WaitingArea
                    members={members}
                    selectedMembers={selectedMembers}
                    onToggleMember={handleToggleMember}
                    onClearSelection={handleClearSelection}
                  />
                </div>
              </div>
            </>
          )}

          {/* 手機版底部安全區域 */}
          <div className="h-4 lg:hidden"></div>
        </div>
      </div>

      {/* 公用隊員選擇彈窗 */}
      <MemberSelectionModal members={members} />
      {/* 程度表 */}
      <LevelTableModel showLevelTableModel={showLevelTable} />

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
