/**
 * 隊員選擇彈窗的 Zustand Store
 * 管理彈窗的顯示狀態和選中的場地
 */

import { create } from 'zustand';

export const useMemberModalStore = create((set) => ({
  // 彈窗是否顯示
  isOpen: false,
  
  // 當前選中的場地（包含場地資訊和隊員列表）
  selectedCourt: null,
  
  // 彈窗中選中的隊員 ID 列表
  selectedMemberIds: [],
  
  // 回調函數：當確認添加隊員時執行
  onConfirm: null,

  // 打開彈窗
  openModal: (court, onConfirmCallback) => set({
    isOpen: true,
    selectedCourt: court,
    selectedMemberIds: [],
    onConfirm: onConfirmCallback,
  }),

  // 關閉彈窗
  closeModal: () => set({
    isOpen: false,
    selectedCourt: null,
    selectedMemberIds: [],
    onConfirm: null,
  }),

  // 切換選中的隊員
  toggleMember: (memberId) => set((state) => {
    const isSelected = state.selectedMemberIds.includes(memberId);
    return {
      selectedMemberIds: isSelected
        ? state.selectedMemberIds.filter(id => id !== memberId)
        : [...state.selectedMemberIds, memberId],
    };
  }),

  // 清空選中的隊員
  clearSelection: () => set({ selectedMemberIds: [] }),

  // 確認添加隊員
  confirmSelection: async () => {
    const { onConfirm, selectedMemberIds, closeModal } = useMemberModalStore.getState();
    if (onConfirm && selectedMemberIds.length > 0) {
      try {
        await onConfirm(selectedMemberIds);
        closeModal();
      } catch (error) {
        console.error('添加隊員失敗:', error);
        // 即使失敗也關閉彈窗，讓使用者可以重試
        closeModal();
        throw error; // 重新拋出錯誤，讓調用者可以處理
      }
    }
  },
}));

