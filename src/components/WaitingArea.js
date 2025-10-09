/**
 * 等待區組件
 * 顯示等待中的場地和隊伍
 */

"use client";

import { Clock, Plus, Trash2, Users, Star } from "lucide-react";
import {
  useCourts,
  useCreateCourt,
  useDeleteCourt,
  useAddMembersToCourt,
  useRemoveMemberFromCourt,
} from "@/hooks/useCourts";
import { useState } from "react";
import Swal from "sweetalert2";

export default function WaitingArea({ members = [], selectedMembers = [], onToggleMember, onClearSelection }) {
  const { data: courts = [], isLoading } = useCourts();
  const createCourtMutation = useCreateCourt();
  const deleteCourtMutation = useDeleteCourt();
  const addMembersMutation = useAddMembersToCourt();
  const removeMemberMutation = useRemoveMemberFromCourt();

  const [dragOverCourt, setDragOverCourt] = useState(null);

  const handleCreateCourt = async () => {
    try {
      await createCourtMutation.mutateAsync();
    } catch (error) {
      Swal.fire({
        text: "創建場地失敗",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDeleteCourt = async (courtId) => {
    const result = await Swal.fire({
      text: "確定要刪除此場地嗎？",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
    });

    if (result.isConfirmed) {
      try {
        await deleteCourtMutation.mutateAsync(courtId);
        Swal.fire({
          text: "刪除成功",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
        });
      } catch (error) {
        Swal.fire({
          text: "刪除失敗",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const handleAddMembers = async (courtId, memberIds) => {
    try {
      await addMembersMutation.mutateAsync({ courtId, memberIds });
      if (onClearSelection) {
        onClearSelection();
      }
    } catch (error) {
      Swal.fire({
        text: error.message || "新增隊員失敗",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleRemoveMember = async (courtId, memberId) => {
    try {
      await removeMemberMutation.mutateAsync({ courtId, memberId });
    } catch (error) {
      Swal.fire({
        text: "移除隊員失敗",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleCourtClick = (court) => {
    if (selectedMembers.length > 0) {
      if (court.members.length + selectedMembers.length > 4) {
        Swal.fire({
          text: "場地最多只能有4位隊員",
          icon: "warning",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
      handleAddMembers(court.id, selectedMembers);
    }
  };

  const handleDragOver = (e, courtId) => {
    e.preventDefault();
    setDragOverCourt(courtId);
  };

  const handleDragLeave = () => {
    setDragOverCourt(null);
  };

  const handleDrop = (e, court) => {
    e.preventDefault();
    setDragOverCourt(null);

    try {
      const memberData = e.dataTransfer.getData("member");
      if (memberData) {
        const member = JSON.parse(memberData);
        if (court.members.length >= 4) {
          Swal.fire({
            text: "場地最多只能有4位隊員",
            icon: "warning",
            confirmButtonColor: "#3b82f6",
          });
          return;
        }
        handleAddMembers(court.id, [member.id]);
      }
    } catch (error) {
      console.error("拖曳錯誤:", error);
    }
  };

  const calculateTotalLevel = (members) => {
    return members.reduce((sum, member) => sum + parseInt(member.level || 0), 0);
  };

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
        <div className="flex items-center gap-3">
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="text-sm font-bold">{courts.length} 場</span>
          </div>
          <button
            onClick={handleCreateCourt}
            disabled={createCourtMutation.isPending}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors disabled:opacity-50"
            title="新增場地"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-orange-50 to-white custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : courts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Clock className="w-20 h-20 mx-auto mb-4 text-orange-500 opacity-50" />
              <p className="text-gray-600 font-medium">尚無場地</p>
              <p className="text-gray-400 text-sm mt-2">點擊右上角 + 號新增場地</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {courts.map((court) => {
              const totalLevel = calculateTotalLevel(court.members);
              const isDragOver = dragOverCourt === court.id;
              const hasSelection = selectedMembers.length > 0;

              return (
                <div
                  key={court.id}
                  onClick={() => handleCourtClick(court)}
                  onDragOver={(e) => handleDragOver(e, court.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, court)}
                  className={`
                    relative bg-gradient-to-br from-white to-orange-50 rounded-xl border-2 p-4
                    transition-all duration-300 shadow-sm hover:shadow-md
                    ${isDragOver ? "border-orange-500 bg-orange-100 scale-105" : "border-orange-200"}
                    ${hasSelection ? "cursor-pointer hover:border-orange-400" : ""}
                  `}
                >
                  {/* 刪除按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourt(court.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="刪除場地"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* 場地標題和總程度 */}
                  <div className="mb-3 pr-8">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        場地 {court.id}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-semibold text-orange-600">總程度: {totalLevel}</span>
                      <span className="text-xs text-gray-500">({court.members.length}/4)</span>
                    </div>
                  </div>

                  {/* 隊員列表 */}
                  <div className="space-y-2">
                    {court.members.map((member) => {
                      const levelStyle = getLevelStyle(member.level);
                      return (
                        <div
                          key={member.id}
                          className={`${levelStyle.color} rounded-lg p-2 flex items-center justify-between border border-gray-200`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full ${
                                member.gender === "男" ? "bg-blue-500" : "bg-pink-500"
                              } flex items-center justify-center text-white text-xs font-bold`}
                            >
                              {member.gender === "男" ? "♂" : "♀"}
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">{member.name}</span>
                            <span className="text-xs text-gray-600">Lv.{member.level}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMember(court.id, member.id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="移除隊員"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {/* 空位提示 */}
                    {Array.from({ length: 4 - court.members.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center text-gray-400 text-sm"
                      >
                        空位
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
