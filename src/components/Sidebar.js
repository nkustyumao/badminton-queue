/**
 * 側邊欄組件 - 顯示隊員列表
 * 展示所有會員的基本資訊：名字、身份、程度、性別
 * 升級版：加入更多動畫、漸層效果和互動元素
 */

"use client";

import { Users, Award, User, UserPlus, X, Settings, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { useCreateMember, useDeleteMember, useUpdateMember } from "@/hooks/useMembers";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { useClearAllCourts } from "@/hooks/useCourts";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function Sidebar({ members, onClose, selectedMembers = [], onToggleMember, courtsMembers = [] }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showLevelTable, setShowLevelTable] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [maxGameCourts, setMaxGameCourts] = useState(2);
  const [editFormData, setEditFormData] = useState({
    name: "",
    identity: "",
    level: "",
    gender: "",
  });
  const [sortBy, setSortBy] = useState("identity"); // identity, level-asc, level-desc
  const [formData, setFormData] = useState({
    name: "",
    identity: "",
    level: "",
    gender: "",
  });

  // 使用 TanStack Query 的 mutation hook 來新增會員
  const createMemberMutation = useCreateMember();
  const deleteMemberMutation = useDeleteMember();
  const updateMemberMutation = useUpdateMember();
  const { data: settings = {} } = useSettings();
  const updateSettingMutation = useUpdateSetting();
  const clearAllCourtsMutation = useClearAllCourts();

  // 當設定載入後更新本地狀態
  useMemo(() => {
    if (settings.max_game_courts) {
      setMaxGameCourts(parseInt(settings.max_game_courts));
    }
  }, [settings]);

  /**
   * 根據性別返回對應的漸層色彩和 icon
   */
  const getGenderStyle = (gender) => {
    return gender === "男"
      ? {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
          text: "text-white",
          icon: "👨",
        }
      : {
          bg: "bg-gradient-to-r from-pink-500 to-rose-500",
          text: "text-white",
          icon: "👩",
        };
  };

  /**
   * 根據程度返回對應的顏色
   */
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

  /**
   * 排序後的會員列表（過濾掉已在場地中的隊員）
   */
  const sortedMembers = useMemo(() => {
    const membersCopy = [...members].filter((member) => !courtsMembers.includes(member.id));

    if (sortBy === "identity") {
      // 按身份排序：隊長 > 副隊長 > 會員 > 臨打
      return membersCopy.sort((a, b) => {
        const identityOrder = { 隊長: 1, 副隊長: 2, 會員: 3, 臨打: 4 };
        const orderA = identityOrder[a.identity] || 4;
        const orderB = identityOrder[b.identity] || 4;

        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.name.localeCompare(b.name, "zh-TW");
      });
    } else if (sortBy === "level-asc") {
      // 按程度由小到大
      return membersCopy.sort((a, b) => a.level - b.level);
    } else if (sortBy === "level-desc") {
      // 按程度由大到小
      return membersCopy.sort((a, b) => b.level - a.level);
    }

    return membersCopy;
  }, [members, sortBy, courtsMembers]);

  /**
   * 處理表單提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 使用 TanStack Query mutation 來新增會員
      await createMemberMutation.mutateAsync(formData);

      // 新增成功後重置表單
      setFormData({
        name: "",
        identity: "",
        level: "",
        gender: "",
      });
      setShowAddForm(false);
      toast.success(`✅ 已成功新增會員：${formData.name}`, {
        position: "top-right",
      });
    } catch (error) {
      console.error("新增會員錯誤:", error);
      toast.error("❌ 新增失敗：" + (error?.message || "請稍後再試"), {
        position: "top-right",
      });
    }
  };

  //  處理刪除會員
  const handleDelete = async (id, memberName) => {
    const result = await Swal.fire({
      title: "⚠️未經許可請勿操作⚠️",
      html: `確定要刪除會員 <strong>${memberName}</strong> 嗎？<br/>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "確定刪除",
      cancelButtonText: "取消",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      try {
        await deleteMemberMutation.mutateAsync(id);
      } catch (error) {
        Swal.fire({
          text: error?.message || "無法刪除會員，請稍後再試",
          icon: "error",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "確定",
        });
      }
    }
  };

  // 編輯會員 跳出表單
  const handleEdit = (id) => {
    setShowEditForm(true);
    setEditFormData(members.find((member) => member.id === id));
  };
  // 處理編輯會員
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMemberMutation.mutateAsync(editFormData);
      setShowEditForm(false);
      toast.success(`✅ 已成功更新會員：${editFormData.name}`, {
        position: "top-right",
      });
    } catch (error) {
      toast.error("❌ 更新失敗：" + (error?.message || "請稍後再試"), {
        position: "top-right",
      });
    }
  };

  // 處理設定更新
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettingMutation.mutateAsync({
        setting_key: "max_game_courts",
        setting_value: maxGameCourts.toString(),
      });
      setShowSettingsModal(false);
      toast.success("✅ 設定已成功更新", {
        position: "top-right",
      });
    } catch (error) {
      toast.error("❌ 設定更新失敗", {
        position: "top-right",
      });
    }
  };

  // 處理重置所有場地
  const handleReset = async () => {
    const result = await Swal.fire({
      title: "⚠️未經隊長同意請勿操作⚠️",
      html: `
        <p class="text-lg mb-3">確定要重置所有場地資料嗎？</p>
        <p class="text-sm text-red-600 font-semibold">這將會重置：</p>
        <ul class="text-sm text-gray-700 mt-2 text-left ml-8">
          <li>• 比賽區場地</li>
          <li>• 排隊區場地</li>
          <li>• 等待區場地</li>
          <li>• 場地 ID 將重置為 1</li>
        </ul>
        <p class="text-sm text-red-600 font-bold mt-3">此操作無法復原！</p>
      `,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "確定重置",
      cancelButtonText: "取消",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await clearAllCourtsMutation.mutateAsync();
        Swal.fire({
          title: "清除成功！",
          text: "所有場地資料已清除，ID 已重置",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          title: "清除失敗",
          text: error.message || "無法清除場地資料",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // 處理清除所有場地
  const handleClearAllCourts = async () => {
    const confirmClear = window.confirm(
      "⚠️ 危險操作 ⚠️\n\n" +
        "確定要清除所有場地資料嗎？\n\n" +
        "這將會刪除：\n" +
        "• 所有比賽區場地\n" +
        "• 所有排隊區場地\n" +
        "• 所有等待區場地\n" +
        "• 場地 ID 將重置為 1\n\n" +
        "此操作無法復原！"
    );

    if (confirmClear) {
      try {
        await clearAllCourtsMutation.mutateAsync();
        toast.success("✅ 所有場地資料已清除，ID 已重置", {
          position: "top-right",
          autoClose: 2000,
        });
      } catch (error) {
        toast.error(error.message || "❌ 無法清除場地資料", {
          position: "top-right",
        });
      }
    }
  };

  return (
    <div className="w-screen md:w-80 max-w-full bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 shadow-lg overflow-hidden flex flex-col h-[calc(100vh-4rem)]">
      {/* 側邊欄標題 */}
      <div className="relative bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-4 md:p-6 shadow-md flex-shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight truncate">隊員列表</h2>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></div>
            <p className="text-blue-100 text-xs md:text-sm font-medium truncate">{members.length} 位隊員</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div
              className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm flex-shrink-0 cursor-pointer"
              onClick={handleReset}
            >
              重置
            </div>

            <div
              className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm flex-shrink-0 cursor-pointer"
              onClick={() => setShowLevelTable(true)}
            >
              {/* <Users className="w-5 h-5 md:w-7 md:h-7" /> */}
              程度表
            </div>
            <div
              className="bg-white/20 p-2 md:p-3 rounded-xl backdrop-blur-sm flex-shrink-0 cursor-pointer hover:bg-white/30 transition-colors"
              onClick={() => setShowSettingsModal(true)}
              title="系統設定"
            >
              {/* <Settings className="w-4 h-4 md:w-5 md:h-5" /> */}
              設定場地數量
            </div>
          </div>

          {/* 手機版關閉按鈕 */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="關閉選單"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 新增隊員按鈕和排序選項 */}
      <div className="p-3 border-b border-gray-200 bg-white space-y-2">
        {selectedMembers.length > 0 && (
          <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-2 text-center">
            <p className="text-orange-800 font-semibold text-sm">已選擇 {selectedMembers.length} 位隊員</p>
            <p className="text-orange-600 text-xs mt-1">
              {selectedMembers.length > 0 && selectedMembers.length < 5
                ? "點擊場地以加入隊員"
                : "超過4位隊員，請先移除隊員"}
            </p>
          </div>
        )}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#764ba2] hover:to-[#667eea] text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>{showAddForm ? "取消新增" : "新增隊員"}</span>
        </button>

        {/* 排序選項 */}
        <div className="flex items-center gap-1">
          {/* <ArrowUpDown className="w-3 h-3 text-gray-600 flex-shrink-0" /> */}
          <button
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700  focus:bg-blue-200 bg-white cursor-pointer"
            onClick={() => setSortBy("identity")}
          >
            依身份排序
          </button>
          <button
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:bg-blue-200 bg-white cursor-pointer"
            onClick={() => setSortBy("level-asc")}
          >
            程度低到高
          </button>
          <button
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 focus:bg-blue-200 bg-white cursor-pointer"
            onClick={() => setSortBy("level-desc")}
          >
            程度高到低
          </button>
        </div>

        {/* 清除場地按鈕 */}
        {/* <button
          onClick={handleClearAllCourts}
          disabled={clearAllCourtsMutation.isPending}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="清除所有場地資料"
        >
          <Trash2 className="w-5 h-5" />
          <span>{clearAllCourtsMutation.isPending ? "清除中..." : "清除所有場地"}</span>
        </button> */}
      </div>

      {/* 新增隊員表單 */}
      {showAddForm && (
        <div className="p-3 bg-blue-50 border-b border-blue-200 animate-slide-down">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="bg-white rounded-lg p-3 space-y-3">
              {/* 名字欄位 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  名字 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border text-black rounded-lg text-sm"
                  placeholder="請輸入姓名"
                  required
                />
              </div>

              {/* 身份和性別 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    身份 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.identity}
                    onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
                    className="w-full px-3 py-2 border text-black rounded-lg text-sm"
                    required
                  >
                    <option value="">請選擇身份</option>
                    <option value="會員">會員</option>
                    {/* <option value="隊長">隊長</option> */}
                    <option value="臨打">臨打</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    性別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border text-black rounded-lg text-sm"
                    required
                  >
                    <option value="">請選擇性別</option>
                    <option value="男">男 ♂</option>
                    <option value="女">女 ♀</option>
                  </select>
                </div>
              </div>

              {/* 程度欄位 */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  程度 <span className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal ml-1">{formData.level}</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 border text-black rounded-lg text-sm"
                  required
                >
                  <option value="">請選擇級別(可以參考程度表)</option>
                  <optgroup label="初入茅廬">
                    <option value="0">0級</option>
                  </optgroup>
                  <optgroup label="快樂級">
                    <option value="1">1級</option>
                    <option value="2">2級</option>
                    <option value="3">3級</option>
                  </optgroup>
                  <optgroup label="普通級">
                    <option value="4">4級</option>
                    <option value="5">5級</option>
                    <option value="6">6級</option>
                  </optgroup>
                  <optgroup label="中級">
                    <option value="7">7級</option>
                    <option value="8">8級</option>
                    <option value="9">9級</option>
                  </optgroup>
                  <optgroup label="高級">
                    <option value="10">10級</option>
                    <option value="11">11級</option>
                    <option value="12">12級</option>
                  </optgroup>
                  <optgroup label="競技級">
                    <option value="13">13級</option>
                    <option value="14">14級</option>
                    <option value="15">15級</option>
                  </optgroup>
                  <optgroup label="專業級">
                    <option value="16">16級</option>
                    <option value="17">17級</option>
                    <option value="18">18級</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={createMemberMutation.isPending}
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:cursor-not-allowed cursor-pointer"
            >
              {createMemberMutation.isPending ? "新增中..." : "✓ 確認新增"}
            </button>
          </form>
        </div>
      )}

      {/* 隊員列表 */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 custom-scrollbar">
        {sortedMembers.length === 0 ? (
          <div className="text-center text-gray-400 py-12 md:py-16">
            <div className="bg-gray-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-gray-300" />
            </div>
            <p className="text-xs font-medium">目前沒有隊員資料</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            {sortedMembers.map((member, index) => {
              const genderStyle = getGenderStyle(member.gender);
              const levelStyle = getLevelStyle(member.level);
              const isHovered = hoveredId === member.id;
              const isSelected = selectedMembers.includes(member.id);

              return (
                <div
                  key={member.id || index}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("member", JSON.stringify(member));
                  }}
                  onMouseEnter={() => setHoveredId(member.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={(e) => {
                    if (onToggleMember) {
                      e.stopPropagation();
                      onToggleMember(member.id);
                    }
                  }}
                  className={`
                    relative ${levelStyle.color}
                    rounded-lg shadow-sm active:shadow-md 
                    transition-all duration-300 p-2 md:p-2.5 border-2
                    ${isHovered ? "md:-translate-y-0.5" : ""}
                    ${isSelected ? "border-orange-500 ring-2 ring-orange-300" : "border-transparent"}
                    cursor-pointer group
                    active:scale-95
                  `}
                >
                  {/* 裝飾性漸層邊框效果 */}
                  <div
                    className={`absolute inset-0 rounded-lg bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  ></div>

                  <div className="relative">
                    {/* 頭像和名字 */}
                    <div className="flex items-center mb-1.5 md:mb-2">
                      {/* 頭像圓圈 */}
                      <div className="relative">
                        <div
                          className={`w-5 h-5 rounded-full ${
                            member.gender === "男" ? "bg-blue-500" : "bg-pink-500"
                          } flex items-center justify-center shadow-md text-white font-bold text-xs`}
                        >
                          {member.gender === "男" ? "♂" : "♀"}
                        </div>
                        {/* 身份標示 */}
                        {(member.identity === "隊長" || member.identity === "副隊長") && (
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-[9px] md:text-[10px]">👑</span>
                          </div>
                        )}
                      </div>

                      {/* 名字 */}
                      <h3 className="font-bold text-gray-900 text-xs md:text-sm truncate w-full text-center px-1">
                        {member.name}
                      </h3>

                      {/* 身份標籤 */}
                      <span
                        className={`text-nowrap inline-flex items-center px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-semibold mt-0.5 md:mt-1 ${
                          member.identity === "隊長" || member.identity === "副隊長"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-white/60 text-blue-800"
                        }`}
                      >
                        {member.identity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-black">
                        <button
                          className="cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(member.id);
                          }}
                          title="編輯會員"
                        >
                          <svg
                            width="18px"
                            height="18px"
                            viewBox="-2.4 -2.4 28.80 28.80"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#000000"
                            transform="matrix(1, 0, 0, 1, 0, 0)"
                          >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g
                              id="SVGRepo_tracerCarrier"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              stroke="#CCCCCC"
                              strokeWidth="0.096"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <title></title>{" "}
                              <g id="Complete">
                                {" "}
                                <g id="edit">
                                  {" "}
                                  <g>
                                    {" "}
                                    <path
                                      d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8"
                                      fill="none"
                                      stroke="#3b82f6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                    ></path>{" "}
                                    <polygon
                                      fill="none"
                                      points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8"
                                      stroke="#3b82f6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                    ></polygon>{" "}
                                  </g>{" "}
                                </g>{" "}
                              </g>{" "}
                            </g>
                          </svg>
                        </button>

                        <button
                          className="cursor-pointer hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(member.id, member.name);
                          }}
                          title="刪除會員"
                        >
                          <svg
                            width="18px"
                            height="18px"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                              {" "}
                              <path
                                d="M10 12V17"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>{" "}
                              <path
                                d="M14 12V17"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>{" "}
                              <path
                                d="M4 7H20"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>{" "}
                              <path
                                d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>{" "}
                              <path
                                d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></path>{" "}
                            </g>
                          </svg>
                        </button>
                      </div>
                      {/* 程度顯示區 */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-md p-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] md:text-[10px] font-semibold text-gray-600 flex items-center gap-0.5">
                            <svg className="w-2 h-2 md:w-2.5 md:h-2.5" fill="#FFD306" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            程度
                          </span>
                          <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Lv.{member.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* 編輯會員表單 */}
      {showEditForm && (
        <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fadeIn">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 border border-gray-200 relative"
          >
            {/* 關閉按鈕 */}
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>

            {/* 標題 */}
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">編輯隊員資料</h2>

            {/* 表單區域 */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  名字 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none text-black"
                  placeholder="請輸入姓名"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  身份 <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.identity}
                  onChange={(e) => setEditFormData({ ...editFormData, identity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none text-black bg-white"
                  required
                >
                  <option value="">請選擇身份</option>
                  <option value="會員">會員</option>
                  <option value="臨打">臨打</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  程度 <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.level}
                  onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none text-black bg-white"
                  required
                >
                  <option value="">請選擇程度</option>
                  <option value="0">0級</option>
                  <option value="1">1級</option>
                  <option value="2">2級</option>
                  <option value="3">3級</option>
                  <option value="4">4級</option>
                  <option value="5">5級</option>
                  <option value="6">6級</option>
                  <option value="7">7級</option>
                  <option value="8">8級</option>
                  <option value="9">9級</option>
                  <option value="10">10級</option>
                  <option value="11">11級</option>
                  <option value="12">12級</option>
                  <option value="13">13級</option>
                  <option value="14">14級</option>
                  <option value="15">15級</option>
                  <option value="16">16級</option>
                  <option value="17">17級</option>
                  <option value="18">18級</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性別 <span className="text-red-500">*</span>
                </label>
                <select
                  value={editFormData.gender}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none text-black bg-white"
                  required
                >
                  <option value="">請選擇性別</option>
                  <option value="男">男 ♂</option>
                  <option value="女">女 ♀</option>
                </select>
              </div>
            </div>

            {/* 按鈕列 */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                送出
              </button>
            </div>
          </form>
        </div>
      )}
      {/* 程度表 */}
      {showLevelTable && (
        <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-xl p-6 border border-gray-200 relative">
            <button
              type="button"
              onClick={() => setShowLevelTable(false)}
              className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={20} />
            </button>
            <img src="/level-table.webp" alt="程度表" className="w-full h-full" />
          </div>
        </div>
      )}

      {/* 系統設定彈窗 */}
      {showSettingsModal && (
        <div className="w-screen h-screen fixed top-0 left-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 border border-gray-200 relative">
            <button
              type="button"
              onClick={() => setShowSettingsModal(false)}
              className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-2 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">系統設定</h3>
              </div>
              {/* <p className="text-gray-500 text-sm">調整系統運作參數</p> */}
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">比賽區最大場地數量</label>
                <p className="text-xs text-gray-500 mb-3">設定比賽區最多可以同時容納多少塊場地</p>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxGameCourts}
                  onChange={(e) => setMaxGameCourts(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-semibold text-center focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition text-blue-600"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  目前設定：<span className="font-bold text-blue-600">{maxGameCourts}</span> 塊場地
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateSettingMutation.isPending ? "儲存中..." : "儲存設定"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 自訂樣式 */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #2563eb);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #1d4ed8);
        }
      `}</style>
    </div>
  );
}
