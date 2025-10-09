/**
 * 排隊區組件
 * 顯示排隊中的成員
 */

'use client';

import { Users } from 'lucide-react';

export default function QueueArea() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* 區塊標題 */}
      <div className="bg-gradient-to-r from-[#3e41e2] to-[#37cacf] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">排隊區</h3>
          </div>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full">
          <span className="text-sm font-bold">0 組</span>
        </div>
      </div>
      
      {/* 內容區域 */}
      <div className="flex-1 p-6 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <Users className="w-20 h-20 mx-auto mb-4 text-blue-600 opacity-50" />
          <p className="text-gray-600 font-medium">隊伍排隊中</p>
          <p className="text-gray-400 text-sm mt-2">這裡將顯示排隊的隊伍</p>
        </div>
      </div>
    </div>
  );
}

