<template>
  <view class="memorybook-page" :class="fontClass">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部导航 -->
    <view class="book-header" :style="{ paddingTop: (menuButtonInfo.top - statusBarHeight) + 'px' }">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-title">
        <text class="title-text">{{ familyName }}</text>
        <text class="title-sub">家庭纪念册</text>
      </view>
      <view class="chapter-btn-placeholder" :style="{ width: menuButtonInfo.right + 'px' }"></view>
    </view>

    <!-- 悬浮目录按钮 - 避开胶囊 -->
    <view
      class="chapter-btn-float"
      :style="{ top: (menuButtonInfo.top + menuButtonInfo.height + 16) + 'px' }"
      @tap="toggleChapterList"
    >
      <text class="chapter-icon">☰</text>
    </view>

    <!-- 书籍主体 -->
    <view class="book-container">
      <!-- 书籍外壳 -->
      <view class="book-shell">
        <!-- 书脊 -->
        <view class="book-spine">
          <text class="spine-text">{{ familyName }}</text>
        </view>

        <!-- 翻页区域 -->
        <view class="book-pages-wrapper">
          <!-- 底层：下一页（翻页时露出） -->
          <view v-if="isFlipping && nextPageContent" class="book-page-layer under-page" :class="nextPageClass">
            <!-- 渲染即将显示的页面内容 -->
            <block v-if="nextPageContent.type === 'cover'">
              <view class="cover-content">
                <view class="cover-decoration top"></view>
                <text class="cover-title">{{ familyName }}</text>
                <text class="cover-subtitle">家庭纪念册</text>
                <view class="cover-year">{{ currentYear }}</view>
                <view class="cover-decoration bottom"></view>
                <text class="cover-hint">轻触翻页 →</text>
              </view>
            </block>
            <block v-else-if="nextPageContent.type === 'end'">
              <view class="end-content">
                <text class="end-title">未完待续...</text>
                <text class="end-text">已记录 {{ totalMemories }} 个瞬间</text>
                <view class="end-stats">
                  <view class="stat-item">
                    <text class="stat-value">{{ totalPages }}</text>
                    <text class="stat-label">页</text>
                  </view>
                  <view class="stat-divider"></view>
                  <view class="stat-item">
                    <text class="stat-value">{{ chaptersCount }}</text>
                    <text class="stat-label">章节</text>
                  </view>
                </view>
                <text class="end-hint">← 轻触翻页</text>
              </view>
            </block>
            <block v-else-if="nextPageContent.type === 'memory'">
              <view class="page-left">
                <view class="page-inner">
                  <view class="page-date">
                    <text class="date-text">{{ nextPageContent.data.dateText }}</text>
                  </view>
                  <view class="page-author">
                    <view
                      v-if="nextPageContent.data.avatarInfo && nextPageContent.data.avatarInfo.type === 'default'"
                      class="author-avatar-default"
                      :style="{ backgroundColor: nextPageContent.data.avatarInfo.color }"
                    >
                      <text class="avatar-emoji">{{ nextPageContent.data.avatarInfo.emoji }}</text>
                    </view>
                    <image
                      v-else
                      class="author-avatar"
                      :src="nextPageContent.data.avatar || '/static/images/default-avatar.png'"
                      mode="aspectFill"
                    />
                    <text class="author-name">{{ nextPageContent.data.authorName }}</text>
                  </view>
                  <view class="page-content">
                    <text class="content-text">{{ nextPageContent.data.content || '...' }}</text>
                  </view>
                  <view v-if="nextPageContent.data.tags && nextPageContent.data.tags.length" class="page-tags">
                    <text v-for="tag in nextPageContent.data.tags" :key="tag" class="page-tag">#{{ tag }}</text>
                  </view>
                  <view class="page-number left">
                    <text>{{ nextPageContent.pageIndex * 2 - 1 }}</text>
                  </view>
                </view>
              </view>
              <view class="page-right">
                <view class="page-inner">
                  <view v-if="nextPageContent.data.images && nextPageContent.data.images.length" class="page-images">
                    <image
                      v-for="(img, idx) in nextPageContent.data.images.slice(0, 4)"
                      :key="idx"
                      class="page-image"
                      :class="getImageClass(nextPageContent.data.images.length, idx)"
                      :src="img"
                      mode="aspectFill"
                    />
                  </view>
                  <view v-else class="page-empty-image">
                    <view class="empty-decoration">
                      <view class="decoration-line"></view>
                      <text class="decoration-text">记忆片段</text>
                      <view class="decoration-line"></view>
                    </view>
                  </view>
                  <view class="page-number right">
                    <text>{{ nextPageContent.pageIndex * 2 }}</text>
                  </view>
                </view>
              </view>
            </block>
          </view>

          <!-- 顶层：当前页（翻页时翻走） -->
          <view
            class="book-page-layer top-page"
            :class="[
              currentPageClass,
              { 'flip-out-left': isFlipping && flipDirection === 'left' },
              { 'flip-out-right': isFlipping && flipDirection === 'right' }
            ]"
          >
            <!-- 封面 -->
            <block v-if="currentPage === 0">
              <view class="cover-content">
                <view class="cover-decoration top"></view>
                <text class="cover-title">{{ familyName }}</text>
                <text class="cover-subtitle">家庭纪念册</text>
                <view class="cover-year">{{ currentYear }}</view>
                <view class="cover-decoration bottom"></view>
                <text class="cover-hint">轻触翻页 →</text>
              </view>
            </block>

            <!-- 内容页 -->
            <block v-else-if="currentPageData">
              <view class="page-left">
                <view class="page-inner">
                  <view class="page-date">
                    <text class="date-text">{{ currentPageData.dateText }}</text>
                  </view>
                  <view class="page-author">
                    <view
                      v-if="currentPageData.avatarInfo && currentPageData.avatarInfo.type === 'default'"
                      class="author-avatar-default"
                      :style="{ backgroundColor: currentPageData.avatarInfo.color }"
                    >
                      <text class="avatar-emoji">{{ currentPageData.avatarInfo.emoji }}</text>
                    </view>
                    <image
                      v-else
                      class="author-avatar"
                      :src="currentPageData.avatar || '/static/images/default-avatar.png'"
                      mode="aspectFill"
                    />
                    <text class="author-name">{{ currentPageData.authorName }}</text>
                  </view>
                  <view class="page-content">
                    <text class="content-text">{{ currentPageData.content || '...' }}</text>
                  </view>
                  <view v-if="currentPageData.tags && currentPageData.tags.length" class="page-tags">
                    <text v-for="tag in currentPageData.tags" :key="tag" class="page-tag">#{{ tag }}</text>
                  </view>
                  <view class="page-number left">
                    <text>{{ currentPage * 2 - 1 }}</text>
                  </view>
                </view>
              </view>
              <view class="page-right">
                <view class="page-inner">
                  <view v-if="currentPageData.images && currentPageData.images.length" class="page-images">
                    <image
                      v-for="(img, idx) in currentPageData.images.slice(0, 4)"
                      :key="idx"
                      class="page-image"
                      :class="getImageClass(currentPageData.images.length, idx)"
                      :src="img"
                      mode="aspectFill"
                      @tap="previewImage(currentPageData.images, idx)"
                    />
                  </view>
                  <view v-else class="page-empty-image">
                    <view class="empty-decoration">
                      <view class="decoration-line"></view>
                      <text class="decoration-text">记忆片段</text>
                      <view class="decoration-line"></view>
                    </view>
                  </view>
                  <view class="page-number right">
                    <text>{{ currentPage * 2 }}</text>
                  </view>
                </view>
              </view>
            </block>

            <!-- 尾页 -->
            <block v-else-if="currentPage > totalPages">
              <view class="end-content">
                <text class="end-title">未完待续...</text>
                <text class="end-text">已记录 {{ totalMemories }} 个瞬间</text>
                <view class="end-stats">
                  <view class="stat-item">
                    <text class="stat-value">{{ totalPages }}</text>
                    <text class="stat-label">页</text>
                  </view>
                  <view class="stat-divider"></view>
                  <view class="stat-item">
                    <text class="stat-value">{{ chaptersCount }}</text>
                    <text class="stat-label">章节</text>
                  </view>
                </view>
                <text class="end-hint">← 轻触翻页</text>
              </view>
            </block>
          </view>
        </view>

        <!-- 翻页触控区 -->
        <view class="flip-zones">
          <view class="flip-zone left" @tap="prevPage"></view>
          <view class="flip-zone right" @tap="nextPage"></view>
        </view>
      </view>
    </view>

    <!-- 底部进度 -->
    <view class="book-footer">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
      <view class="page-info">
        <text class="page-current">{{ currentPage }}</text>
        <text class="page-divider">/</text>
        <text class="page-total">{{ totalPages + 1 }}</text>
      </view>
    </view>

    <!-- 章节列表弹窗 -->
    <view v-if="showChapterList" class="chapter-popup" @tap.self="toggleChapterList">
      <view class="chapter-content" @tap.stop>
        <view class="chapter-header">
          <text class="chapter-title">目录</text>
          <view class="chapter-close" @tap="toggleChapterList">×</view>
        </view>
        <scroll-view scroll-y class="chapter-list">
          <view
            v-for="(chapter, index) in chapters"
            :key="chapter.key"
            class="chapter-item"
            :class="{ active: currentChapter === chapter.key }"
            @tap="goToChapter(chapter)"
          >
            <text class="chapter-name">{{ chapter.name }}</text>
            <text class="chapter-count">{{ chapter.count }} 篇</text>
            <text class="chapter-page">P{{ chapter.startPage }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-book">
        <view class="loading-page"></view>
        <view class="loading-page"></view>
        <view class="loading-page"></view>
      </view>
      <text class="loading-text">正在装订纪念册...</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMemories, getMyFamily } from '@/utils/api.js'
import { formatDate, getAvatarInfo } from '@/utils/index.js'

const statusBarHeight = ref(20)
const menuButtonInfo = ref({ top: 0, height: 32, right: 10 })
const fontClass = ref('font-system')
const loading = ref(true)
const familyName = ref('我们的家')
const currentYear = computed(() => new Date().getFullYear())

// 翻页相关
const currentPage = ref(0) // 0 = 封面
const flipDirection = ref('')
const isFlipping = ref(false)
const memories = ref([])
const showChapterList = ref(false)

// 计算总页数 (每个记忆一页)
const totalPages = computed(() => memories.value.length)
const totalMemories = computed(() => memories.value.length)

// 当前章节
const currentChapter = computed(() => {
  if (currentPage.value === 0) return null
  const memory = memories.value[currentPage.value - 1]
  if (!memory) return null
  return formatDate(memory.createdAt, 'YYYY-MM')
})

// 章节列表 (按月份分组)
const chapters = computed(() => {
  const chapterMap = {}
  let pageNum = 1

  memories.value.forEach((memory, index) => {
    const key = formatDate(memory.createdAt, 'YYYY-MM')
    const name = formatDate(memory.createdAt, 'YYYY年MM月')

    if (!chapterMap[key]) {
      chapterMap[key] = {
        key,
        name,
        count: 0,
        startPage: pageNum
      }
    }
    chapterMap[key].count++
    pageNum++
  })

  return Object.values(chapterMap)
})

const chaptersCount = computed(() => chapters.value.length)

// 当前页样式类
const currentPageClass = computed(() => {
  if (currentPage.value === 0) return 'cover-page'
  if (currentPage.value > totalPages.value) return 'end-page'
  return 'content-page'
})

// 下一页样式类
const nextPageClass = computed(() => {
  if (!nextPageContent.value) return ''
  if (nextPageContent.value.type === 'cover') return 'cover-page'
  if (nextPageContent.value.type === 'end') return 'end-page'
  return 'content-page'
})

// 获取指定页码的数据
const getPageData = (pageIndex) => {
  if (pageIndex <= 0 || pageIndex > totalPages.value) return null
  const memory = memories.value[pageIndex - 1]
  if (!memory) return null
  return {
    id: memory.id,
    dateText: formatDate(memory.createdAt, 'YYYY年MM月DD日'),
    authorName: memory.author?.nickname || '家人',
    avatar: memory.author?.avatar || '',
    avatarInfo: getAvatarInfo(memory.author?.avatar),
    content: memory.content,
    images: memory.images || [],
    tags: memory.tags || []
  }
}

// 翻页时下一页的内容
const nextPageContent = computed(() => {
  if (!isFlipping.value) return null

  const targetPage = flipDirection.value === 'left'
    ? currentPage.value + 1
    : currentPage.value - 1

  if (targetPage < 0) return null
  if (targetPage === 0) return { type: 'cover' }
  if (targetPage > totalPages.value) return { type: 'end' }

  const data = getPageData(targetPage)
  return data ? { type: 'memory', data, pageIndex: targetPage } : null
})

// 当前页数据
const currentPageData = computed(() => {
  return getPageData(currentPage.value)
})

// 进度百分比
const progressPercent = computed(() => {
  if (totalPages.value === 0) return 0
  return Math.round((currentPage.value / (totalPages.value + 1)) * 100)
})

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'

  // #ifdef MP-WEIXIN
  const menuBtn = uni.getMenuButtonBoundingClientRect()
  menuButtonInfo.value = {
    top: menuBtn.top,
    height: menuBtn.height,
    right: systemInfo.windowWidth - menuBtn.left + 10
  }
  // #endif

  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    // 加载家庭信息
    const familyRes = await getMyFamily()
    if (familyRes.data) {
      familyName.value = familyRes.data.name || '我们的家'
    }

    // 加载所有记忆
    const res = await getMemories({ page: 1, limit: 1000 })
    console.log('memories res:', res)
    if (res.data && res.data.items) {
      memories.value = res.data.items
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  uni.navigateBack()
}

const prevPage = () => {
  if (currentPage.value <= 0 || isFlipping.value) return

  isFlipping.value = true
  flipDirection.value = 'right'

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif

  setTimeout(() => {
    currentPage.value--
    isFlipping.value = false
    flipDirection.value = ''
  }, 600)
}

const nextPage = () => {
  if (currentPage.value > totalPages.value || isFlipping.value) return

  isFlipping.value = true
  flipDirection.value = 'left'

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif

  setTimeout(() => {
    currentPage.value++
    isFlipping.value = false
    flipDirection.value = ''
  }, 600)
}

const toggleChapterList = () => {
  showChapterList.value = !showChapterList.value
}

const goToChapter = (chapter) => {
  currentPage.value = chapter.startPage
  showChapterList.value = false
}

const getImageClass = (total, index) => {
  if (total === 1) return 'single'
  if (total === 2) return 'double'
  if (total === 3) return index === 0 ? 'triple-main' : 'triple-sub'
  return 'quad'
}

const previewImage = (images, index) => {
  uni.previewImage({
    urls: images,
    current: images[index]
  })
}
</script>

<style lang="scss" scoped>
@use './memorybook.scss';
</style>
