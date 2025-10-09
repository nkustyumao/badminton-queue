/**
 * 會員服務層 - 處理所有與會員相關的 API 請求
 * 這層負責與後端 API 溝通，不包含 React 邏輯
 */

/**
 * 獲取所有會員列表
 * @returns {Promise<Array>} 會員列表
 */
export async function fetchMembers() {
  const response = await fetch('/api/members');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '獲取會員列表失敗');
  }
  
  return data.data || [];
}

/**
 * 新增會員
 * @param {Object} memberData - 會員資料
 * @param {string} memberData.name - 姓名
 * @param {string} memberData.identity - 身份
 * @param {string|number} memberData.level - 程度
 * @param {string} memberData.gender - 性別
 * @returns {Promise<Object>} 新增的會員資料
 */
export async function createMember(memberData) {
  const response = await fetch('/api/members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '新增會員失敗');
  }
  
  return data.data;
}

/**
 * 更新會員資料
 * @param {number} id - 會員 ID
 * @param {Object} memberData - 要更新的會員資料
 * @returns {Promise<Object>} 更新後的會員資料
 */
export async function updateMember(memberData) {
  const { id } = memberData;
  const response = await fetch(`/api/members/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(memberData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '更新會員失敗');
  }
  
  return data.data;
}

/**
 * 刪除會員
 * @param {number} id - 會員 ID
 * @returns {Promise<void>}
 */
export async function deleteMember(id) {
  const response = await fetch(`/api/members/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || '刪除會員失敗');
  }
}

