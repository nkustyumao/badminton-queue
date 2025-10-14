/**
 * 公用隊員選擇彈窗組件
 * 可在等待區、比賽區、排隊區等多處重複使用
 */

"use client";

import { Users } from "lucide-react";
import { TiDelete } from "react-icons/ti";
import { useMemberModalStore } from "@/store/useMemberModalStore";
import Swal from "sweetalert2";

// 根據等級獲取樣式
const getLevelStyle = (level) => {
  if (level == 18) return { color: "bg-red-300" };
  if (level >= 16) return { color: "bg-red-100" };
  if (level >= 13) return { color: "bg-purple-100" };
  if (level >= 10) return { color: "bg-blue-100" };
  if (level >= 7) return { color: "bg-yellow-100" };
  if (level >= 4) return { color: "bg-green-100" };
  if (level >= 1) return { color: "bg-orange-100" };
  return { color: "bg-gray-300" };
};

export default function MemberSelectionModal({ members = [] }) {
  const { isOpen, selectedCourt, selectedMemberIds, toggleMember, closeModal, confirmSelection } =
    useMemberModalStore();

  // 安全檢查：確保彈窗狀態正確
  if (!isOpen || !selectedCourt) return null;

  // 確保 selectedCourt 有 members 屬性
  if (!selectedCourt.members) {
    selectedCourt.members = [];
  }

  // 獲取可用的隊員（排除已在當前場地的隊員）
  const getAvailableMembers = () => {
    if (!members || !Array.isArray(members)) return [];
    const currentCourtMemberIds = selectedCourt.members?.map((m) => m.id) || [];
    return members.filter((member) => !currentCourtMemberIds.includes(member.id));
  };

  const availableMembers = getAvailableMembers();
  const currentMemberCount = selectedCourt.members?.length || 0;
  const maxMembers = 4;
  const remainingSlots = maxMembers - currentMemberCount;

  // 處理確認添加
  const handleConfirm = async () => {
    if (selectedMemberIds.length > remainingSlots) {
      Swal.fire({
        text: `最多只能再加入 ${remainingSlots} 位隊員`,
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      await confirmSelection();
    } catch (error) {
      Swal.fire({
        text: error?.message || "添加隊員失敗，請稍後再試",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 彈窗標題 */}
        <div className="bg-gradient-to-r from-[#c26beb] to-[#229ad1] text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">選擇隊員</h3>
            <p className="text-orange-100 text-sm mt-1">
              場地 {selectedCourt.id} ({currentMemberCount}/{maxMembers})
              {remainingSlots > 0 && ` - 還可加入 ${remainingSlots} 位`}
            </p>
          </div>
          <button onClick={closeModal} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <TiDelete className="w-10 h-10" />
          </button>
        </div>

        {/* 已選擇提示 */}
        {selectedMemberIds.length > 0 && (
          <div className="bg-orange-50 border-b-2 border-orange-200 p-3">
            <p className="text-orange-800 font-semibold text-center">
              已選擇 {selectedMemberIds.length} 位隊員
              {selectedMemberIds.length > remainingSlots && (
                <span className="text-red-600 ml-2">（超過可加入人數 {remainingSlots} 位）</span>
              )}
            </p>
          </div>
        )}

        {/* 隊員列表 */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {availableMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">沒有可用的隊員</p>
              <p className="text-gray-400 text-sm mt-2">所有隊員都已在場地中</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableMembers.map((member) => {
                const levelStyle = getLevelStyle(member.level);
                const isSelected = selectedMemberIds.includes(member.id);

                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`
                      ${levelStyle.color} rounded-lg p-3 cursor-pointer
                      transition-all duration-200 border-2
                      ${
                        isSelected
                          ? "border-orange-500 ring-2 ring-orange-300 scale-105"
                          : "border-transparent hover:border-orange-300"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-6 h-6 rounded-full ${
                          member.gender === "男" ? "bg-blue-500" : "bg-pink-500"
                        } flex items-center justify-center text-white text-xs font-bold`}
                      >
                        {member.gender === "男" ? "♂" : "♀"}
                      </div>
                      <span className="font-bold text-gray-800 text-sm truncate flex-1">{member.name}</span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{member.identity}</span>
                      <span className="text-xs font-semibold text-orange-600">Lv.{member.level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={closeModal}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedMemberIds.length === 0 || selectedMemberIds.length > remainingSlots}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
          >
            加入 {selectedMemberIds.length > 0 && `(${selectedMemberIds.length})`}
          </button>
        </div>
      </div>

      {/* 滾動條樣式 */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
    </div>
  );
}
