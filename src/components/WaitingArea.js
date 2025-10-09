/**
 * 等待區組件
 * 顯示等待中的隊伍
 */

'use client';

import { Clock } from 'lucide-react';

export default function WaitingArea() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* 區塊標題 */}
      <div className="bg-orange-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">等待區</h3>
            <p className="text-orange-100 text-xs">準備上場</p>
          </div>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full">
          <span className="text-sm font-bold">0 組</span>
        </div>
      </div>
      
      {/* 內容區域 */}
      <div className="flex-1 p-6 flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <Clock className="w-20 h-20 mx-auto mb-4 text-orange-500 opacity-50" />
          <p className="text-gray-600 font-medium">等待下一場</p>
          <p className="text-gray-400 text-sm mt-2">這裡將顯示等待比賽的隊伍</p>
        </div>
      </div>
    </div>
  );
}

