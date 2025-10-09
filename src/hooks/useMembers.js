/**
 * 會員相關的 React Query Hooks
 * 這層負責管理 API 狀態、快取和重新獲取邏輯
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMembers, createMember, updateMember, deleteMember } from '@/services/memberService';

/**
 * Query Keys - 統一管理查詢鍵
 */
export const memberKeys = {
  all: ['members'],
  lists: () => [...memberKeys.all, 'list'],
  list: (filters) => [...memberKeys.lists(), { filters }],
  details: () => [...memberKeys.all, 'detail'],
  detail: (id) => [...memberKeys.details(), id],
};

/**
 * 獲取會員列表的 Hook
 * @returns {Object} 包含 data, isLoading, isError, error 等狀態
 */
export function useMembers() {
  return useQuery({
    queryKey: memberKeys.lists(),
    queryFn: fetchMembers,
    staleTime: 1000 * 60 * 5, // 5 分鐘內資料視為新鮮
    gcTime: 1000 * 60 * 10, // 快取保留 10 分鐘
    retry: 1, // 失敗時重試 1 次
  });
}

/**
 * 新增會員的 Hook
 * @returns {Object} mutation 物件，包含 mutate, mutateAsync, isLoading 等
 */
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      // 新增成功後，立即重新獲取會員列表
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
    onError: (error) => {
      console.error('新增會員失敗:', error);
    },
  });
}

/**
 * 更新會員的 Hook（預留）
 * @returns {Object} mutation 物件
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      // 更新成功後，重新獲取會員列表
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
    onError: (error) => {
      console.error('更新會員失敗:', error);
    },
  });
}

/**
 * 刪除會員的 Hook（預留）
 * @returns {Object} mutation 物件
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      // 刪除成功後，重新獲取會員列表
      queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
    },
    onError: (error) => {
      console.error('刪除會員失敗:', error);
    },
  });
}

