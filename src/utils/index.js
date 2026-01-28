/**
 * 工具函数
 */

// 格式化日期
export function formatDate(timestamp, format = 'YYYY年MM月DD日') {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
}

// 格式化相对时间
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatDate(timestamp, 'MM月DD日')
  }
}

// 计算365天前的日期
export function getYearAgoDate(date = new Date()) {
  const yearAgo = new Date(date)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  return yearAgo
}

// 判断是否是今天
export function isToday(timestamp) {
  const today = new Date()
  const date = new Date(timestamp)
  return today.toDateString() === date.toDateString()
}

// 判断是否是同一天
export function isSameDay(timestamp1, timestamp2) {
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)
  return date1.toDateString() === date2.toDateString()
}

// 获取随机温馨语句
export function getWarmMessage(type = 'empty') {
  const messages = {
    empty: [
      '这里还空着，等待第一个温柔的故事',
      '每一个平凡的日子，都值得被温柔记录',
      '时光很慢，故事很长，慢慢写吧'
    ],
    loading: [
      '正在唤醒记忆...',
      '翻开时光的书页...',
      '回忆正在慢慢浮现...'
    ],
    parallel: [
      '今天只有一个人说话，另一个视角会在明天补上吗？',
      '平行的时光，等待交汇的瞬间',
      '每个人的视角都是独特的风景'
    ],
    memory: [
      '365天前，此刻你们也在看这页',
      '时光是最好的见证者',
      '旧日子里藏着新惊喜'
    ]
  }

  const list = messages[type] || messages.empty
  return list[Math.floor(Math.random() * list.length)]
}

// 节流函数
export function throttle(fn, delay = 300) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 防抖函数
export function debounce(fn, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// rpx转px
export function rpx2px(rpx) {
  const systemInfo = uni.getSystemInfoSync()
  return rpx * systemInfo.windowWidth / 750
}

// 震动反馈
export function vibrate(type = 'light') {
  // #ifdef MP-WEIXIN
  if (type === 'light') {
    uni.vibrateShort({ type: 'light' })
  } else {
    uni.vibrateLong()
  }
  // #endif

  // #ifdef H5
  if (navigator.vibrate) {
    navigator.vibrate(type === 'light' ? 10 : 50)
  }
  // #endif
}
