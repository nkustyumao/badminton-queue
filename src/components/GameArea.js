/**
 * 比賽區組件
 * 顯示正在進行的比賽
 */

"use client";

import { Trophy } from "lucide-react";

export default function GameArea() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* 區塊標題 */}
      <div className="bg-gradient-to-l from-[#c7c279] to-[#eb6315] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">比賽區</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold">LIVE</span>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 p-6 flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <Trophy className="w-20 h-20 mx-auto mb-4 text-[#eb6315] opacity-50" />
          <p className="text-gray-600 font-medium">比賽進行中</p>
          <p className="text-gray-400 text-sm mt-2">這裡將顯示正在比賽的隊伍</p>
        </div>
      </div>
    </div>
  );
}
