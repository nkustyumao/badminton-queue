/**
 * 程度相關工具函數
 * 集中管理程度樣式和計算，避免重複定義
 */

/**
 * 根據程度返回對應的 Tailwind 背景顏色 class
 * @param {number} level - 程度值 (0-18)
 * @returns {{ color: string }} 包含背景色 class 的物件
 */
export const getLevelStyle = (level) => {
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
 * 計算隊員列表的程度總和
 * @param {Array<{ level: number|string }>} members - 隊員陣列
 * @returns {number} 程度總和
 */
export const calculateTotalLevel = (members) => {
  return members.reduce((sum, member) => sum + parseInt(member.level || 0), 0);
};
