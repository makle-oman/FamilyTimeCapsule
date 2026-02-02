/**
 * API 请求封装
 * 响应格式: { code: number, data: any, message: string }
 * code = 200 表示成功，其他表示失败
 */

// API 基础地址 - 根据环境配置
const BASE_URL = 'http://localhost:1314/api';

// 响应码
const ResponseCode = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

/**
 * 统一请求方法 - 所有接口使用 POST
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');

    uni.request({
      url: BASE_URL + options.url,
      method: 'POST',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === ResponseCode.SUCCESS) {
            resolve(res.data);
          } else if (res.data.code === ResponseCode.UNAUTHORIZED) {
            // Token 过期，跳转登录
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            uni.reLaunch({ url: '/pages/login/login' });
            reject(res.data);
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
            });
            reject(res.data);
          }
        } else {
          uni.showToast({
            title: '请求失败',
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
    data,
  });
}

/**
 * 用户注册
 */
export function register(data) {
  return request({
    url: '/auth/register',
    data,
  });
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/auth/me',
  });
}

/**
 * 更新用户资料
 */
export function updateProfile(data) {
  return request({
    url: '/auth/update-profile',
    data,
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
    url: '/families/create',
    data,
  });
}

/**
 * 加入家庭
 */
export function joinFamily(inviteCode) {
  return request({
    url: '/families/join',
    data: { inviteCode },
  });
}

/**
 * 获取我的家庭
 */
export function getMyFamily() {
  return request({
    url: '/families/my',
  });
}

/**
 * 获取家庭详情
 */
export function getFamilyById(familyId) {
  return request({
    url: '/families/detail',
    data: { familyId },
  });
}

/**
 * 更新家庭信息
 */
export function updateFamily(familyId, data) {
  return request({
    url: '/families/update',
    data: { familyId, ...data },
  });
}

/**
 * 获取家庭成员
 */
export function getFamilyMembers(familyId) {
  return request({
    url: '/families/members',
    data: { familyId },
  });
}

/**
 * 获取家庭统计
 */
export function getFamilyStats(familyId) {
  return request({
    url: '/families/stats',
    data: { familyId },
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
    url: '/memories/create',
    data,
  });
}

/**
 * 获取记忆列表
 */
export function getMemories(params = {}) {
  return request({
    url: '/memories/list',
    data: params,
  });
}

/**
 * 获取单个记忆
 */
export function getMemoryById(memoryId) {
  return request({
    url: '/memories/detail',
    data: { memoryId },
  });
}

/**
 * 获取一年前的记忆
 */
export function getYearAgoMemories() {
  return request({
    url: '/memories/year-ago',
  });
}

/**
 * 添加平行视角
 */
export function addParallelView(memoryId, data) {
  return request({
    url: '/memories/parallel-view',
    data: { memoryId, ...data },
  });
}

/**
 * 添加/取消共鸣 (toggle)
 */
export function addResonance(memoryId, parallelViewId = null) {
  return request({
    url: '/memories/resonance',
    data: { memoryId, parallelViewId },
  });
}

// ============================================================
// 相册相关 API
// ============================================================

/**
 * 获取相册照片
 */
export function getPhotos(params = {}) {
  return request({
    url: '/photos/list',
    data: params,
  });
}

/**
 * 获取照片标签
 */
export function getPhotoTags() {
  return request({
    url: '/photos/tags',
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
    url: '/letters/create',
    data,
  });
}

/**
 * 获取待开启的信件
 */
export function getPendingLetters() {
  return request({
    url: '/letters/pending',
  });
}

/**
 * 打开信件
 */
export function openLetter(letterId) {
  return request({
    url: '/letters/open',
    data: { letterId },
  });
}

/**
 * 获取已打开的信件
 */
export function getOpenedLetters(year = null) {
  return request({
    url: '/letters/opened',
    data: year ? { year } : {},
  });
}

/**
 * 获取信件年份列表
 */
export function getLetterYears() {
  return request({
    url: '/letters/years',
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
  });
}

/**
 * 回答问题
 */
export function answerQuestion(questionId, content) {
  return request({
    url: '/questions/answer',
    data: { questionId, content },
  });
}

/**
 * 获取问答历史
 */
export function getQuestionHistory(params = {}) {
  return request({
    url: '/questions/history',
    data: params,
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
    url: '/tags/list',
  });
}

/**
 * 创建标签
 */
export function createTag(data) {
  return request({
    url: '/tags/create',
    data,
  });
}

/**
 * 删除标签
 */
export function deleteTag(tagId) {
  return request({
    url: '/tags/delete',
    data: { tagId },
  });
}
