/**
 * API 请求封装
 */

// API 基础地址 - 根据环境配置
const BASE_URL = 'http://localhost:1314/api';

/**
 * 统一请求方法
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          if (res.data.success) {
            resolve(res.data);
          } else {
            uni.showToast({
              title: res.data.error || '请求失败',
              icon: 'none',
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');
          uni.reLaunch({ url: '/pages/login/login' });
          reject(res.data);
        } else {
          uni.showToast({
            title: res.data.error || '请求失败',
            icon: 'none',
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
        });
        reject(err);
      },
    });
  });
}

// ============================================================
// 认证相关 API
// ============================================================

/**
 * 用户登录
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data,
  });
}

/**
 * 用户注册
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'POST',
    data,
  });
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/auth/me',
    method: 'GET',
  });
}

// ============================================================
// 家庭相关 API
// ============================================================

/**
 * 创建家庭
 */
export function createFamily(data) {
  return request({
    url: '/families',
    method: 'POST',
    data,
  });
}

/**
 * 加入家庭
 */
export function joinFamily(inviteCode) {
  return request({
    url: '/families/join',
    method: 'POST',
    data: { inviteCode },
  });
}

/**
 * 获取我的家庭
 */
export function getMyFamily() {
  return request({
    url: '/families/my',
    method: 'GET',
  });
}

/**
 * 获取家庭详情
 */
export function getFamilyById(familyId) {
  return request({
    url: `/families/${familyId}`,
    method: 'GET',
  });
}

/**
 * 更新家庭信息
 */
export function updateFamily(familyId, data) {
  return request({
    url: `/families/${familyId}`,
    method: 'PUT',
    data,
  });
}

/**
 * 获取家庭成员
 */
export function getFamilyMembers(familyId) {
  return request({
    url: `/families/${familyId}/members`,
    method: 'GET',
  });
}

/**
 * 获取家庭统计
 */
export function getFamilyStats(familyId) {
  return request({
    url: `/families/${familyId}/stats`,
    method: 'GET',
  });
}

// ============================================================
// 记忆相关 API
// ============================================================

/**
 * 创建记忆
 */
export function createMemory(data) {
  return request({
    url: '/memories',
    method: 'POST',
    data,
  });
}

/**
 * 获取记忆列表
 */
export function getMemories(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request({
    url: `/memories${query ? '?' + query : ''}`,
    method: 'GET',
  });
}

/**
 * 获取单个记忆
 */
export function getMemoryById(memoryId) {
  return request({
    url: `/memories/${memoryId}`,
    method: 'GET',
  });
}

/**
 * 获取一年前的记忆
 */
export function getYearAgoMemories() {
  return request({
    url: '/memories/year-ago',
    method: 'GET',
  });
}

/**
 * 添加平行视角
 */
export function addParallelView(memoryId, data) {
  return request({
    url: `/memories/${memoryId}/parallel-views`,
    method: 'POST',
    data,
  });
}

/**
 * 添加共鸣
 */
export function addResonance(memoryId, parallelViewId = null) {
  return request({
    url: `/memories/${memoryId}/resonance`,
    method: 'POST',
    data: { parallelViewId },
  });
}

/**
 * 取消共鸣
 */
export function removeResonance(memoryId, parallelViewId = null) {
  return request({
    url: `/memories/${memoryId}/resonance`,
    method: 'DELETE',
    data: { parallelViewId },
  });
}

// ============================================================
// 相册相关 API
// ============================================================

/**
 * 获取相册照片
 */
export function getPhotos(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request({
    url: `/photos${query ? '?' + query : ''}`,
    method: 'GET',
  });
}

/**
 * 获取照片标签
 */
export function getPhotoTags() {
  return request({
    url: '/photos/tags',
    method: 'GET',
  });
}

// ============================================================
// 信箱相关 API
// ============================================================

/**
 * 创建信件
 */
export function createLetter(data) {
  return request({
    url: '/letters',
    method: 'POST',
    data,
  });
}

/**
 * 获取待开启的信件
 */
export function getPendingLetters() {
  return request({
    url: '/letters/pending',
    method: 'GET',
  });
}

/**
 * 打开信件
 */
export function openLetter(letterId) {
  return request({
    url: `/letters/${letterId}/open`,
    method: 'POST',
  });
}

/**
 * 获取已打开的信件
 */
export function getOpenedLetters(year = null) {
  const query = year ? `?year=${year}` : '';
  return request({
    url: `/letters/opened${query}`,
    method: 'GET',
  });
}

// ============================================================
// 问答相关 API
// ============================================================

/**
 * 获取今日问题
 */
export function getTodayQuestion() {
  return request({
    url: '/questions/today',
    method: 'GET',
  });
}

/**
 * 回答问题
 */
export function answerQuestion(questionId, content) {
  return request({
    url: '/questions/answer',
    method: 'POST',
    data: { questionId, content },
  });
}

// ============================================================
// 标签相关 API
// ============================================================

/**
 * 获取用户标签列表
 */
export function getTags() {
  return request({
    url: '/tags',
    method: 'GET',
  });
}

/**
 * 创建标签
 */
export function createTag(data) {
  return request({
    url: '/tags',
    method: 'POST',
    data,
  });
}

/**
 * 删除标签
 */
export function deleteTag(tagId) {
  return request({
    url: `/tags/${tagId}`,
    method: 'DELETE',
  });
}
