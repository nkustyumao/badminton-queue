/**
 * 排隊區組件
 * 顯示排隊中的成員
 */

"use client";

import { Users, Plus, Trash2, ArrowRight } from "lucide-react";
import {
  useCourts,
  useCreateCourt,
  useDeleteCourt,
  useAddMembersToCourt,
  useRemoveMemberFromCourt,
  useUpdateCourtStatus,
} from "@/hooks/useCourts";
import { useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSettings } from "@/hooks/useSettings";
import dayjs from "dayjs";
import { useMemberModalStore } from "@/store/useMemberModalStore";

export default function QueueArea({ members = [] }) {
  const { data: courts = [], isLoading } = useCourts("queue");
  const { data: gameCourts = [] } = useCourts("game");
  const { data: settings = {} } = useSettings();
  const createCourtMutation = useCreateCourt();
  const deleteCourtMutation = useDeleteCourt();
  const addMembersMutation = useAddMembersToCourt();
  const removeMemberMutation = useRemoveMemberFromCourt();
  const updateCourtStatusMutation = useUpdateCourtStatus();

  const [dragOverCourt, setDragOverCourt] = useState(null);

  // 使用 Zustand store 管理彈窗
  const openModal = useMemberModalStore((state) => state.openModal);

  const maxGameCourts = parseInt(settings.max_game_courts || 2);
  const canMoveToGame = gameCourts.length < maxGameCourts;

  const handleCreateCourt = async () => {
    try {
      await createCourtMutation.mutateAsync("queue");
      toast.success("✅ 已成功創建場地", {
        position: "top-right",
      });
    } catch (error) {
      toast.error("❌ 創建場地失敗", {
        position: "top-right",
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
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteCourtMutation.mutateAsync(courtId);
      } catch (error) {
        toast.error("刪除失敗");
      }
    }
  };

  const handleMoveToGame = async (court) => {
    try {
      await updateCourtStatusMutation.mutateAsync({
        courtId: court.id,
        status: "game",
      });
      toast.success("🔥 熱血開打！", {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (error) {
      toast.error("❌ 發生錯誤，請重新整理", {
        position: "top-right",
      });
    }
  };

  const handleAddMembers = async (courtId, memberIds) => {
    try {
      await addMembersMutation.mutateAsync({ courtId, memberIds });
      toast.success("✅ 已成功加入隊員", {
        position: "top-right",
      });
    } catch (error) {
      toast.error(error.message || "❌ 新增隊員失敗", {
        position: "top-right",
      });
    }
  };

  const handleRemoveMember = async (courtId, memberId) => {
    try {
      await removeMemberMutation.mutateAsync({ courtId, memberId });
      toast.success("✅ 已成功移除隊員", {
        position: "top-right",
      });
    } catch (error) {
      toast.error("❌ 移除隊員失敗", {
        position: "top-right",
      });
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
          toast.warning("⚠️ 場地最多只能有 4 位隊員", {
            position: "top-right",
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

  // 獲取可用的隊員
  // 打開隊員選擇彈窗（使用 Zustand store）
  const handleOpenModal = (court) => {
    openModal(court, async (memberIds) => {
      // 確認添加隊員的回調函數
      await handleAddMembers(court.id, memberIds);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-auto flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* 區塊標題 */}
      <div className="bg-gradient-to-r from-[#3e41e2] to-[#37cacf] text-white p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Users className="w-5 h-5 md:w-6 md:h-6" />
          <div>
            <h3 className="text-base md:text-lg font-bold">排隊區 (先後順序由左至右依序排隊)</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
            <span className="text-xs md:text-sm font-bold">{courts.length} 場排隊中</span>
          </div>
          {/* <button
            onClick={handleCreateCourt}
            disabled={createCourtMutation.isPending}
            className="bg-white/20 hover:bg-white/30 p-1.5 md:p-2 rounded-full transition-colors disabled:opacity-50"
            title="新增場地"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </button> */}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto bg-gradient-to-br from-blue-50 to-white custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : courts.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <Users className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 text-blue-600 opacity-50" />
              <p className="text-gray-600 font-medium text-sm md:text-base">尚無排隊</p>
              {/* <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">點擊右上角 + 號新增場地</p> */}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
            {courts
              .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at))
              .map((court) => {
                const totalLevel = calculateTotalLevel(court.members);
                const isDragOver = dragOverCourt === court.id;

                return (
                  <div
                    key={court.id}
                    onDragOver={(e) => handleDragOver(e, court.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, court)}
                    className={`
                    relative bg-gradient-to-br from-white to-blue-50 rounded-lg md:rounded-xl border-2 p-3 md:p-4
                    transition-all duration-300 shadow-sm hover:shadow-md
                    ${isDragOver ? "border-blue-600 bg-blue-100 scale-105" : "border-blue-300"}
                  `}
                  >
                    {/* 刪除按鈕 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourt(court.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                      title="刪除場地"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* 場地標題和總程度 */}
                    <div className="mb-2 md:mb-3 pr-8">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm md:text-base text-gray-800 flex items-center gap-1.5 md:gap-2">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          {dayjs(Date.now()).format("YYYY-MM-DD")} 第 {court.id} 場
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                        <span className="text-xs md:text-sm font-semibold text-clip text-transparent bg-clip-text bg-gradient-to-r from-[#3e41e2] to-[#37cacf]">
                          總程度: {totalLevel}
                        </span>
                        <span className="text-xs md:text-sm text-gray-500">( {court.members.length} / 4 )</span>
                      </div>
                    </div>

                    {/* 移至比賽區按鈕 */}
                    {canMoveToGame && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToGame(court);
                        }}
                        className="w-full mb-2 md:mb-3 py-1.5 md:py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm md:text-base font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        點擊開賽
                      </button>
                    )}

                    {/* 隊員列表 */}
                    <div className="space-y-1.5 md:space-y-2">
                      {court.members.map((member) => {
                        const levelStyle = getLevelStyle(member.level);
                        return (
                          <div
                            key={member.id}
                            className={`${levelStyle.color} rounded-md md:rounded-lg p-1.5 md:p-2 flex items-center justify-between border border-gray-200`}
                          >
                            <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                              <div
                                className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0 ${
                                  member.gender === "男" ? "bg-blue-500" : "bg-pink-500"
                                } flex items-center justify-center text-white text-xs font-bold`}
                              >
                                {member.gender === "男" ? "♂" : "♀"}
                              </div>
                              <span className="font-semibold text-gray-800 text-xs md:text-sm truncate">
                                {member.name}
                              </span>
                              <span className="text-xs text-gray-600 flex-shrink-0">Lv.{member.level}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(court.id, member.id);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0 ml-1 cursor-pointer"
                              title="移除隊員"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          </div>
                        );
                      })}

                      {/* 空位提示 */}
                      {Array.from({ length: 4 - court.members.length }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(court);
                          }}
                          className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-md md:rounded-lg p-1.5 md:p-2 text-center text-gray-400 hover:text-blue-600 text-xs md:text-sm cursor-pointer transition-all duration-200 lg:pointer-events-none lg:opacity-50"
                        >
                          <span className="text-xs lg:hidden">
                            <Plus className="w-3 h-3 md:w-4 md:h-4 inline-block mr-1" /> 點擊加入
                          </span>
                          <span className="text-xs">空位</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
