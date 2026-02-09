<template>
  <view class="page-wrapper gallery-page" :class="fontClass" :style="themeStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部标题栏 -->
    <view class="page-header">
      <text class="page-title">相册馆</text>
      <view class="header-actions">
        <view class="compare-btn" :class="{ active: compareMode }" @tap="toggleCompareMode">
          <image
            class="compare-icon"
            :src="compareMode ? '/static/icons/extra/compare-active.png' : '/static/icons/extra/compare.png'"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>

    <!-- 智能标签筛选 -->
    <view class="tags-filter">
      <scroll-view scroll-x class="tags-scroll">
        <view
          v-for="tag in smartTags"
          :key="tag.id"
          class="filter-tag"
          :class="{ active: activeTag === tag.id }"
          @tap="filterByTag(tag.id)"
        >
          <text class="tag-icon">{{ tag.icon }}</text>
          <text class="tag-name">{{ tag.name }}</text>
          <text class="tag-count">{{ tag.count }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 时光对比模式提示 -->
    <view v-if="compareMode" class="compare-hint">
      <text v-if="selectedPhotos.length === 0">请选择第一张照片（如去年的）</text>
      <text v-else-if="selectedPhotos.length === 1">再选择一张照片进行对比</text>
      <view v-else class="compare-actions">
        <view class="cancel-btn" @tap="cancelCompare">取消</view>
        <view class="generate-btn" @tap="generateCompare">生成对比图</view>
      </view>
    </view>

    <!-- 瀑布流相册 -->
    <scroll-view scroll-y class="gallery-scroll" @scrolltolower="loadMore">
      <view class="waterfall-container">
        <!-- 左列 -->
        <view class="waterfall-column">
          <view
            v-for="photo in leftColumn"
            :key="photo.id"
            class="photo-card"
            :class="{ selected: isSelected(photo.id) }"
            @tap="handlePhotoTap(photo)"
          >
            <image
              :src="photo.url"
              mode="widthFix"
              class="photo-image"
              :style="{ height: photo.displayHeight + 'rpx' }"
            />
            <view class="photo-overlay">
              <view class="photo-info">
                <view class="author-avatar">
                  <image :src="photo.authorAvatar || '/static/images/default-avatar.png'" />
                </view>
                <text class="photo-desc">{{ truncateText(photo.content, 10) }}</text>
              </view>
              <view v-if="photo.aiTags && photo.aiTags.length" class="ai-tags">
                <text v-for="tag in photo.aiTags.slice(0, 2)" :key="tag" class="ai-tag">{{ tag }}</text>
              </view>
            </view>
            <view v-if="compareMode" class="select-indicator">
              <view class="select-circle" :class="{ checked: isSelected(photo.id) }">
                <text v-if="isSelected(photo.id)">{{ getSelectOrder(photo.id) }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 右列 -->
        <view class="waterfall-column">
          <view
            v-for="photo in rightColumn"
            :key="photo.id"
            class="photo-card"
            :class="{ selected: isSelected(photo.id) }"
            @tap="handlePhotoTap(photo)"
          >
            <image
              :src="photo.url"
              mode="widthFix"
              class="photo-image"
              :style="{ height: photo.displayHeight + 'rpx' }"
            />
            <view class="photo-overlay">
              <view class="photo-info">
                <view class="author-avatar">
                  <image :src="photo.authorAvatar || '/static/images/default-avatar.png'" />
                </view>
                <text class="photo-desc">{{ truncateText(photo.content, 10) }}</text>
              </view>
              <view v-if="photo.aiTags && photo.aiTags.length" class="ai-tags">
                <text v-for="tag in photo.aiTags.slice(0, 2)" :key="tag" class="ai-tag">{{ tag }}</text>
              </view>
            </view>
            <view v-if="compareMode" class="select-indicator">
              <view class="select-circle" :class="{ checked: isSelected(photo.id) }">
                <text v-if="isSelected(photo.id)">{{ getSelectOrder(photo.id) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!photos.length && !loading" class="empty-state">
        <text class="empty-icon">🖼</text>
        <text class="empty-text">相册里还没有照片</text>
        <text class="empty-hint">记录生活，从一张照片开始</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">正在加载更多照片...</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部导航 -->
    <ft-tab-bar current-tab="gallery" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <ft-record-modal :visible="showRecordModal" @close="closeRecord" @submit="submitRecord" />

    <!-- 照片详情弹窗 -->
    <view v-if="showPhotoDetail" class="photo-detail-modal" @tap.self="closePhotoDetail">
      <view class="detail-content">
        <view class="detail-header">
          <view class="detail-author">
            <image :src="currentPhoto?.authorAvatar || '/static/images/default-avatar.png'" class="detail-avatar" />
            <view class="author-info">
              <text class="author-name">{{ currentPhoto?.authorName }}</text>
              <text class="photo-date">{{ currentPhoto?.dateText }}</text>
            </view>
          </view>
          <view class="close-btn" @tap="closePhotoDetail">×</view>
        </view>

        <scroll-view scroll-y class="detail-body">
          <image :src="currentPhoto?.url" mode="widthFix" class="detail-image" />

          <view class="photo-story">
            <view class="story-header">
              <text class="story-title">照片故事</text>
              <view class="goto-timeline" @tap="gotoTimeline(currentPhoto)">
                <text>查看完整日记</text>
                <text class="arrow">›</text>
              </view>
            </view>
            <text class="story-content">{{ currentPhoto?.content }}</text>
          </view>

          <view v-if="currentPhoto?.aiTags?.length" class="detail-tags">
            <text class="tags-label">智能识别</text>
            <view class="tags-list">
              <text v-for="tag in currentPhoto.aiTags" :key="tag" class="detail-tag">{{ tag }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 时光对比生成弹窗 -->
    <view v-if="showCompareResult" class="compare-modal" @tap.self="closeCompareResult">
      <view class="compare-content">
        <view class="compare-header">
          <text class="compare-title">时光对比</text>
          <view class="close-btn" @tap="closeCompareResult">×</view>
        </view>

        <view class="compare-images">
          <view class="compare-item">
            <image :src="selectedPhotos[0]?.url" mode="aspectFill" class="compare-image" />
            <text class="compare-date">{{ selectedPhotos[0]?.dateText }}</text>
          </view>
          <view class="compare-divider">
            <text class="vs-text">VS</text>
          </view>
          <view class="compare-item">
            <image :src="selectedPhotos[1]?.url" mode="aspectFill" class="compare-image" />
            <text class="compare-date">{{ selectedPhotos[1]?.dateText }}</text>
          </view>
        </view>

        <view class="compare-footer">
          <view class="save-btn" @tap="saveCompare">保存到相册</view>
          <view class="share-btn" @tap="shareCompare">分享给家人</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { formatDate, generateId } from '@/utils/index.js'
import { useTheme } from '@/composables/useTheme.js'
import { getPhotos, getPhotoTags } from '@/utils/api.js'

const { themeStyle } = useTheme()

const statusBarHeight = ref(20)
const showRecordModal = ref(false)
const showPhotoDetail = ref(false)
const showCompareResult = ref(false)
const loading = ref(false)
const compareMode = ref(false)
const activeTag = ref('all')
const currentPhoto = ref(null)
const selectedPhotos = ref([])
const photos = ref([])
const allPhotos = ref([])
const fontClass = ref('font-system')
const pageNo = ref(1)
const hasMore = ref(true)
const smartTags = ref([{ id: 'all', name: '全部', icon: '📷', count: 0 }])

const leftColumn = computed(() => photos.value.filter((_, index) => index % 2 === 0))
const rightColumn = computed(() => photos.value.filter((_, index) => index % 2 === 1))

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'
  loadPhotos()
  loadTags()
})

onShow(() => {
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'
})

const loadPhotos = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const params = { page: pageNo.value, limit: 20 }
    if (activeTag.value !== 'all') {
      params.tag = activeTag.value
    }

    const res = await getPhotos(params)

    if (res.data && res.data.items) {
      const newPhotos = res.data.items.map(p => ({
        id: p.id,
        url: p.url,
        content: p.content || '',
        authorName: p.authorName || '未知',
        authorAvatar: p.authorAvatar || '',
        createTime: new Date(p.createdAt).getTime(),
        dateText: formatDate(new Date(p.createdAt).getTime(), 'YYYY年MM月DD日'),
        displayHeight: 300 + Math.floor(Math.random() * 200),
        aiTags: p.tags || [],
        memoryId: p.memoryId
      }))

      if (pageNo.value === 1) {
        photos.value = newPhotos
        allPhotos.value = newPhotos
      } else {
        photos.value = [...photos.value, ...newPhotos]
        allPhotos.value = [...allPhotos.value, ...newPhotos]
      }

      hasMore.value = res.data.page < res.data.totalPages
      pageNo.value++
      updateTagCounts()
    }
  } catch (error) {
    console.error('加载照片失败:', error)
  } finally {
    loading.value = false
  }
}

const loadTags = async () => {
  try {
    const res = await getPhotoTags()
    if (res.data && Array.isArray(res.data)) {
      const dynamicTags = res.data.map(tag => ({
        id: tag,
        name: tag,
        icon: getTagIcon(tag),
        count: 0
      }))
      smartTags.value = [
        { id: 'all', name: '全部', icon: '📷', count: 0 },
        ...dynamicTags
      ]
      updateTagCounts()
    }
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const getTagIcon = (tagName) => {
  const iconMap = {
    '笑脸': '😊', '美食': '🍜', '户外': '🌳',
    '全家福': '👨‍👩‍👧', '萌宠': '🐱', '纪念日': '🎂',
    '旅行': '✈️', '运动': '⚽', '学习': '📚'
  }
  return iconMap[tagName] || '🏷'
}

const updateTagCounts = () => {
  smartTags.value[0].count = allPhotos.value.length
  smartTags.value.forEach(tag => {
    if (tag.id !== 'all') {
      tag.count = allPhotos.value.filter(p => p.aiTags && p.aiTags.includes(tag.id)).length
    }
  })
}

const filterByTag = (tagId) => {
  activeTag.value = tagId
  pageNo.value = 1
  hasMore.value = true
  photos.value = []
  loadPhotos()
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

const toggleCompareMode = () => {
  compareMode.value = !compareMode.value
  if (!compareMode.value) {
    selectedPhotos.value = []
  }
}

const isSelected = (photoId) => selectedPhotos.value.some(p => p.id === photoId)

const getSelectOrder = (photoId) => {
  const index = selectedPhotos.value.findIndex(p => p.id === photoId)
  return index + 1
}

const handlePhotoTap = (photo) => {
  if (compareMode.value) {
    selectForCompare(photo)
  } else {
    openPhotoDetail(photo)
  }
}

const selectForCompare = (photo) => {
  const index = selectedPhotos.value.findIndex(p => p.id === photo.id)
  if (index > -1) {
    selectedPhotos.value.splice(index, 1)
  } else if (selectedPhotos.value.length < 2) {
    selectedPhotos.value.push(photo)
  }
}

const cancelCompare = () => {
  selectedPhotos.value = []
  compareMode.value = false
}

const generateCompare = () => {
  if (selectedPhotos.value.length !== 2) return
  showCompareResult.value = true
}

const closeCompareResult = () => { showCompareResult.value = false }

const saveCompare = () => {
  uni.showToast({ title: '已保存到相册', icon: 'success' })
  closeCompareResult()
  cancelCompare()
}

const shareCompare = () => { uni.showToast({ title: '分享功能开发中', icon: 'none' }) }

const openPhotoDetail = (photo) => {
  currentPhoto.value = photo
  showPhotoDetail.value = true
}

const closePhotoDetail = () => {
  showPhotoDetail.value = false
  currentPhoto.value = null
}

const gotoTimeline = (photo) => {
  closePhotoDetail()
  uni.redirectTo({ url: `/pages/timeline/timeline?memoryId=${photo.memoryId}` })
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadPhotos()
}

const openRecord = () => { showRecordModal.value = true }
const closeRecord = () => { showRecordModal.value = false }

const submitRecord = (data) => {
  if (data.images && data.images.length > 0) {
    data.images.forEach((url) => {
      photos.value.unshift({
        id: generateId(),
        url: url,
        content: data.content,
        authorName: '我',
        authorAvatar: '',
        createTime: Date.now(),
        dateText: formatDate(Date.now(), 'YYYY年MM月DD日'),
        displayHeight: 300 + Math.random() * 200,
        aiTags: data.tags || [],
        memoryId: generateId()
      })
    })
  }
}
</script>

<style lang="scss" scoped>
@use './gallery.scss';
</style>
