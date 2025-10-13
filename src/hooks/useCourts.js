import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCourts(status = null) {
  return useQuery({
    queryKey: status ? ["courts", status] : ["courts"],
    queryFn: async () => {
      const url = status ? `/api/courts?status=${status}` : "/api/courts";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("獲取場地失敗");
      }
      return response.json();
    },
  });
}

export function useCreateCourt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status = 'waiting') => {
      const response = await fetch("/api/courts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("創建場地失敗");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}

export function useDeleteCourt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (courtId) => {
      const response = await fetch(`/api/courts/${courtId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("刪除場地失敗");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}

export function useAddMembersToCourt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courtId, memberIds }) => {
      const response = await fetch(`/api/courts/${courtId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberIds }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "新增隊員失敗");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}

export function useRemoveMemberFromCourt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courtId, memberId }) => {
      const response = await fetch(`/api/courts/${courtId}/members?memberId=${memberId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("移除隊員失敗");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}

export function useUpdateCourtStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courtId, status }) => {
      const response = await fetch(`/api/courts/${courtId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "更新場地狀態失敗");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courts"] });
    },
  });
}

