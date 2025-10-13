/**
 * 等待區組件
 * 顯示等待中的場地和隊伍
 */

"use client";

import { Clock, Plus, Trash2, Users, Star, Check } from "lucide-react";
import { TiDelete } from "react-icons/ti";
import {
  useCourts,
  useCreateCourt,
  useDeleteCourt,
  useAddMembersToCourt,
  useRemoveMemberFromCourt,
  useUpdateCourtStatus,
} from "@/hooks/useCourts";
import { useState } from "react";
import Swal from "sweetalert2";
import { useSettings } from "@/hooks/useSettings";
import dayjs from "dayjs";

export default function WaitingArea({ members = [], selectedMembers = [], onToggleMember, onClearSelection }) {
  const { data: courts = [], isLoading } = useCourts("waiting");
  const { data: gameCourts = [] } = useCourts("game");
  const { data: settings = {} } = useSettings();
  const createCourtMutation = useCreateCourt();
  const deleteCourtMutation = useDeleteCourt();
  const addMembersMutation = useAddMembersToCourt();
  const removeMemberMutation = useRemoveMemberFromCourt();
  const updateCourtStatusMutation = useUpdateCourtStatus();

  const [dragOverCourt, setDragOverCourt] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [modalSelectedMembers, setModalSelectedMembers] = useState([]);

  const handleCreateCourt = async () => {
    try {
      await createCourtMutation.mutateAsync("waiting");
    } catch (error) {
      Swal.fire({
        text: "創建場地失敗",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleStartGame = async (court) => {
    try {
      const maxGameCourts = parseInt(settings.max_game_courts || 2);
      const currentGameCourts = gameCourts.length;

      if (currentGameCourts < maxGameCourts) {
        // 比賽區未滿，移至比賽區
        await updateCourtStatusMutation.mutateAsync({
          courtId: court.id,
          status: "game",
        });
        Swal.fire({
          text: "已加入比賽區",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
        });
      } else {
        // 比賽區已滿，移至排隊區
        await updateCourtStatusMutation.mutateAsync({
          courtId: court.id,
          status: "queue",
        });
        Swal.fire({
          text: "比賽區已滿，已加入排隊區",
          icon: "info",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        text: "操作失敗",
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

  // 獲取可用的隊員（不在任何場地中的隊員）
  const getAvailableMembers = () => {
    const courtsMembers = courts.flatMap((court) => court.members.map((m) => m.id));
    return members.filter((member) => !courtsMembers.includes(member.id));
  };

  // 打開隊員選擇彈窗
  const handleOpenModal = (court) => {
    setSelectedCourt(court);
    setModalSelectedMembers([]);
    setShowMemberModal(true);
  };

  // 切換彈窗中的隊員選擇
  const handleToggleModalMember = (memberId) => {
    setModalSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // 從彈窗加入隊員
  const handleAddFromModal = async () => {
    if (modalSelectedMembers.length === 0) {
      Swal.fire({
        text: "請選擇至少一位隊員",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (selectedCourt.members.length + modalSelectedMembers.length > 4) {
      Swal.fire({
        text: "場地最多只能有4位隊員",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    await handleAddMembers(selectedCourt.id, modalSelectedMembers);
    setShowMemberModal(false);
    setModalSelectedMembers([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-auto flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* 區塊標題 */}
      <div className="bg-gradient-to-r from-[#08b834] to-[#e5e77a] text-white p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <Clock className="w-5 h-5 md:w-6 md:h-6" />
          <div>
            <h3 className="text-base md:text-lg font-bold">等待區</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* <div className="bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
            <span className="text-xs md:text-sm font-bold">{courts.length} 場</span>
          </div> */}
          <button
            onClick={handleCreateCourt}
            disabled={createCourtMutation.isPending}
            className="bg-white/20 hover:bg-white/50 p-1.5 md:p-2 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            title="新增場地"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto bg-gradient-to-br from-orange-50 to-white custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#08b834] border-t-transparent"></div>
          </div>
        ) : courts.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <Clock className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 text-[#08b834] opacity-50" />
              <p className="text-gray-600 font-medium text-sm md:text-base">尚無場地</p>
              <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">點擊右上角 + 號新增場地</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
                    relative bg-gradient-to-br from-white to-orange-50 rounded-lg md:rounded-xl border-2 p-3 md:p-4
                    transition-all duration-300 shadow-sm hover:shadow-md
                    ${isDragOver ? "border-[#08b834] bg-[#e5e77a] scale-105" : "border-[#7add93]"}
                    ${hasSelection ? "cursor-pointer hover:border-orange-400" : ""}
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
                      <span className="text-xs md:text-sm font-semibold  text-clip text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2]">
                        總程度: {totalLevel}
                      </span>
                      <span className="text-xs md:text-sm text-gray-500">( {court.members.length} / 4 )</span>
                    </div>
                  </div>

                  {/* 準備好了按鈕 */}
                  {court.members.length === 4 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartGame(court);
                      }}
                      className="w-full mb-2 md:mb-3 py-1.5 md:py-2 bg-gradient-to-r from-green-600 to-emerald-400 hover:from-green-600 hover:to-emerald-700 text-white text-sm md:text-base font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      準備好了
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
                        className="border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 rounded-md md:rounded-lg p-1.5 md:p-2 text-center text-gray-400 hover:text-orange-600 text-xs md:text-sm cursor-pointer transition-all duration-200 lg:pointer-events-none lg:opacity-50"
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

      {/* 隊員選擇彈窗 */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* 彈窗標題 */}
            <div className="bg-gradient-to-r from-[#c26beb] to-[#229ad1] text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">選擇隊員</h3>
                <p className="text-orange-100 text-sm mt-1">
                  場地 {selectedCourt?.id} ({selectedCourt?.members.length}/4)
                </p>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <TiDelete className="w-10 h-10" />
              </button>
            </div>

            {/* 已選擇提示 */}
            {modalSelectedMembers.length > 0 && (
              <div className="bg-orange-50 border-b-2 border-orange-200 p-3">
                <p className="text-orange-800 font-semibold text-center">已選擇 {modalSelectedMembers.length} 位隊員</p>
              </div>
            )}

            {/* 隊員列表 */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {getAvailableMembers().length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">沒有可用的隊員</p>
                  <p className="text-gray-400 text-sm mt-2">所有隊員都已在場地中</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getAvailableMembers().map((member) => {
                    const levelStyle = getLevelStyle(member.level);
                    const isSelected = modalSelectedMembers.includes(member.id);

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleToggleModalMember(member.id)}
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
                onClick={() => setShowMemberModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddFromModal}
                disabled={modalSelectedMembers.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
              >
                加入 {modalSelectedMembers.length > 0 && `(${modalSelectedMembers.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

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
