<template>
  <view class="page-wrapper gallery-page">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部标题栏 -->
    <view class="page-header">
      <text class="page-title">相册馆</text>
      <view class="header-actions">
        <view class="compare-btn" :class="{ active: compareMode }" @tap="toggleCompareMode">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" :fill="compareMode ? '#E07A5F' : '#9E8F7D'"/>
          </svg>
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
    <scroll-view
      scroll-y
      class="gallery-scroll"
      @scrolltolower="loadMore"
    >
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
                  <image :src="photo.authorAvatar || '/static/images/default-avatar.svg'" />
                </view>
                <text class="photo-desc">{{ truncateText(photo.content, 10) }}</text>
              </view>
              <!-- 智能标签 -->
              <view v-if="photo.aiTags && photo.aiTags.length" class="ai-tags">
                <text v-for="tag in photo.aiTags.slice(0, 2)" :key="tag" class="ai-tag">{{ tag }}</text>
              </view>
            </view>
            <!-- 选中状态 -->
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
                  <image :src="photo.authorAvatar || '/static/images/default-avatar.svg'" />
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
    <tab-bar current-tab="gallery" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <record-modal :visible="showRecordModal" @close="closeRecord" @submit="submitRecord" />

    <!-- 照片详情弹窗 -->
    <view v-if="showPhotoDetail" class="photo-detail-modal" @tap.self="closePhotoDetail">
      <view class="detail-content">
        <view class="detail-header">
          <view class="detail-author">
            <image :src="currentPhoto?.authorAvatar || '/static/images/default-avatar.svg'" class="detail-avatar" />
            <view class="author-info">
              <text class="author-name">{{ currentPhoto?.authorName }}</text>
              <text class="photo-date">{{ currentPhoto?.dateText }}</text>
            </view>
          </view>
          <view class="close-btn" @tap="closePhotoDetail">×</view>
        </view>

        <scroll-view scroll-y class="detail-body">
          <image :src="currentPhoto?.url" mode="widthFix" class="detail-image" />

          <!-- 照片故事 - 关联的日记内容 -->
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

          <!-- AI 识别标签 -->
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

<script>
import { formatDate, generateId } from '@/utils/index.js'
import TabBar from '@/components/tab-bar/tab-bar.vue'
import RecordModal from '@/components/record-modal/record-modal.vue'

export default {
  components: {
    TabBar,
    RecordModal
  },
  data() {
    return {
      statusBarHeight: 20,
      showRecordModal: false,
      showPhotoDetail: false,
      showCompareResult: false,
      loading: false,
      compareMode: false,
      activeTag: 'all',
      currentPhoto: null,
      selectedPhotos: [],
      photos: [],
      leftColumnHeight: 0,
      rightColumnHeight: 0,
      smartTags: [
        { id: 'all', name: '全部', icon: '📷', count: 0 },
        { id: 'smile', name: '笑脸', icon: '😊', count: 0 },
        { id: 'food', name: '美食', icon: '🍜', count: 0 },
        { id: 'outdoor', name: '户外', icon: '🌳', count: 0 },
        { id: 'family', name: '全家福', icon: '👨‍👩‍👧', count: 0 },
        { id: 'pet', name: '萌宠', icon: '🐱', count: 0 },
        { id: 'anniversary', name: '纪念日', icon: '🎂', count: 0 }
      ]
    }
  },
  computed: {
    leftColumn() {
      return this.photos.filter((_, index) => index % 2 === 0)
    },
    rightColumn() {
      return this.photos.filter((_, index) => index % 2 === 1)
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 20

    this.loadPhotos()
  },
  methods: {
    loadPhotos() {
      this.loading = true

      // 模拟照片数据
      setTimeout(() => {
        const mockPhotos = [
          {
            id: generateId(),
            url: 'https://picsum.photos/400/500?random=1',
            content: '今天的晚餐超级丰盛，全家人一起吃火锅，热热闹闹的感觉真好',
            authorName: '妈妈',
            authorAvatar: '',
            createTime: Date.now() - 1000 * 60 * 60 * 2,
            displayHeight: 400,
            aiTags: ['美食', '晚餐'],
            memoryId: 'memory_001'
          },
          {
            id: generateId(),
            url: 'https://picsum.photos/400/300?random=2',
            content: '周末去公园散步，阳光正好',
            authorName: '爸爸',
            authorAvatar: '',
            createTime: Date.now() - 1000 * 60 * 60 * 24,
            displayHeight: 300,
            aiTags: ['户外', '笑脸'],
            memoryId: 'memory_002'
          },
          {
            id: generateId(),
            url: 'https://picsum.photos/400/450?random=3',
            content: '小猫咪今天特别粘人',
            authorName: '我',
            authorAvatar: '',
            createTime: Date.now() - 1000 * 60 * 60 * 48,
            displayHeight: 450,
            aiTags: ['萌宠'],
            memoryId: 'memory_003'
          },
          {
            id: generateId(),
            url: 'https://picsum.photos/400/350?random=4',
            content: '生日快乐！又长大一岁了',
            authorName: '妈妈',
            authorAvatar: '',
            createTime: Date.now() - 1000 * 60 * 60 * 72,
            displayHeight: 350,
            aiTags: ['纪念日', '笑脸'],
            memoryId: 'memory_004'
          },
          {
            id: generateId(),
            url: 'https://picsum.photos/400/500?random=5',
            content: '全家福，记录这幸福的时刻',
            authorName: '爸爸',
            authorAvatar: '',
            createTime: Date.now() - 1000 * 60 * 60 * 24 * 7,
            displayHeight: 500,
            aiTags: ['全家福', '笑脸'],
            memoryId: 'memory_005'
          },
          {
            id: generateId(),
            url: 'https://picsum.photos/400/380?random=6',
            content: '自己做的蛋糕，虽然丑但好吃',
            authorName: '我',
            authorAvatar: '',
            createTime: Date.now() - 1000 * 60 * 60 * 24 * 10,
            displayHeight: 380,
            aiTags: ['美食'],
            memoryId: 'memory_006'
          }
        ]

        // 添加日期文本
        mockPhotos.forEach(photo => {
          photo.dateText = formatDate(photo.createTime, 'YYYY年MM月DD日')
        })

        this.photos = [...this.photos, ...mockPhotos]
        this.updateTagCounts()
        this.loading = false
      }, 800)
    },
    updateTagCounts() {
      // 更新标签计数
      this.smartTags[0].count = this.photos.length

      const tagMap = {
        smile: '笑脸',
        food: '美食',
        outdoor: '户外',
        family: '全家福',
        pet: '萌宠',
        anniversary: '纪念日'
      }

      this.smartTags.forEach(tag => {
        if (tag.id !== 'all') {
          tag.count = this.photos.filter(p =>
            p.aiTags && p.aiTags.includes(tagMap[tag.id])
          ).length
        }
      })
    },
    filterByTag(tagId) {
      this.activeTag = tagId
      // 实际项目中这里应该过滤照片列表
    },
    truncateText(text, maxLength) {
      if (!text) return ''
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
    },
    toggleCompareMode() {
      this.compareMode = !this.compareMode
      if (!this.compareMode) {
        this.selectedPhotos = []
      }
    },
    isSelected(photoId) {
      return this.selectedPhotos.some(p => p.id === photoId)
    },
    getSelectOrder(photoId) {
      const index = this.selectedPhotos.findIndex(p => p.id === photoId)
      return index + 1
    },
    handlePhotoTap(photo) {
      if (this.compareMode) {
        this.selectForCompare(photo)
      } else {
        this.openPhotoDetail(photo)
      }
    },
    selectForCompare(photo) {
      const index = this.selectedPhotos.findIndex(p => p.id === photo.id)
      if (index > -1) {
        this.selectedPhotos.splice(index, 1)
      } else if (this.selectedPhotos.length < 2) {
        this.selectedPhotos.push(photo)
      }
    },
    cancelCompare() {
      this.selectedPhotos = []
      this.compareMode = false
    },
    generateCompare() {
      if (this.selectedPhotos.length !== 2) return
      this.showCompareResult = true
    },
    closeCompareResult() {
      this.showCompareResult = false
    },
    saveCompare() {
      uni.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
      this.closeCompareResult()
      this.cancelCompare()
    },
    shareCompare() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },
    openPhotoDetail(photo) {
      this.currentPhoto = photo
      this.showPhotoDetail = true
    },
    closePhotoDetail() {
      this.showPhotoDetail = false
      this.currentPhoto = null
    },
    gotoTimeline(photo) {
      // 跳转到时光轴对应的日记
      this.closePhotoDetail()
      uni.redirectTo({
        url: `/pages/timeline/timeline?memoryId=${photo.memoryId}`
      })
    },
    loadMore() {
      if (this.loading) return
      this.loadPhotos()
    },
    openRecord() {
      this.showRecordModal = true
    },
    closeRecord() {
      this.showRecordModal = false
    },
    submitRecord(data) {
      // 如果有图片，添加到相册
      if (data.images && data.images.length > 0) {
        data.images.forEach((url, index) => {
          this.photos.unshift({
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
  }
}
</script>

<style lang="scss" scoped>
.gallery-page {
  background-color: #FAF7F2;
  min-height: 100vh;
}

.status-bar {
  background-color: #FAF7F2;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
}

.page-title {
  font-size: 40rpx;
  color: #5C4F42;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 24rpx;
}

.compare-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #FFFCF8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(196, 184, 168, 0.15);

  &.active {
    background-color: rgba(224, 122, 95, 0.1);
  }
}

// 标签筛选
.tags-filter {
  padding: 0 32rpx 24rpx;
}

.tags-scroll {
  white-space: nowrap;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background-color: #FFFCF8;
  border-radius: 32rpx;
  border: 2rpx solid #E8E4DF;
  transition: all 0.3s ease;

  &.active {
    background-color: rgba(224, 122, 95, 0.1);
    border-color: #E07A5F;
  }
}

.tag-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.tag-name {
  font-size: 26rpx;
  color: #5C4F42;
}

.tag-count {
  font-size: 22rpx;
  color: #9E8F7D;
  margin-left: 8rpx;
}

// 对比模式提示
.compare-hint {
  padding: 20rpx 32rpx;
  background-color: rgba(224, 122, 95, 0.1);
  text-align: center;

  text {
    font-size: 28rpx;
    color: #E07A5F;
  }
}

.compare-actions {
  display: flex;
  justify-content: center;
  gap: 32rpx;
}

.cancel-btn,
.generate-btn {
  padding: 12rpx 32rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
}

.cancel-btn {
  background-color: #FFFCF8;
  color: #9E8F7D;
}

.generate-btn {
  background-color: #E07A5F;
  color: #FFFCF8;
}

// 瀑布流
.gallery-scroll {
  height: calc(100vh - 280rpx);
}

.waterfall-container {
  display: flex;
  padding: 0 24rpx;
  gap: 16rpx;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.photo-card {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #E8E4DF;

  &.selected {
    box-shadow: 0 0 0 4rpx #E07A5F;
  }
}

.photo-image {
  width: 100%;
  display: block;
}

.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(92, 79, 66, 0.7) 100%);
}

.photo-info {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12rpx;
  border: 2rpx solid rgba(255, 252, 248, 0.5);

  image {
    width: 100%;
    height: 100%;
  }
}

.photo-desc {
  font-size: 24rpx;
  color: #FFFCF8;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-tags {
  display: flex;
  gap: 8rpx;
  margin-top: 8rpx;
}

.ai-tag {
  font-size: 20rpx;
  color: #FFFCF8;
  padding: 4rpx 12rpx;
  background-color: rgba(255, 252, 248, 0.2);
  border-radius: 12rpx;
}

// 选中指示器
.select-indicator {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
}

.select-circle {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 3rpx solid #FFFCF8;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background-color: #E07A5F;
    border-color: #E07A5F;
  }

  text {
    font-size: 24rpx;
    color: #FFFCF8;
    font-weight: bold;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #5C4F42;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #9E8F7D;
}

// 加载更多
.loading-more {
  padding: 32rpx;
  text-align: center;
}

.loading-text {
  font-size: 26rpx;
  color: #9E8F7D;
}

.bottom-space {
  height: 200rpx;
}

// 照片详情弹窗
.photo-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(92, 79, 66, 0.9);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
}

.detail-content {
  width: 100%;
  max-height: 90vh;
  background-color: #FFFCF8;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.detail-author {
  display: flex;
  align-items: center;
}

.detail-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 30rpx;
  color: #5C4F42;
  font-weight: 500;
}

.photo-date {
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: #9E8F7D;
}

.detail-body {
  max-height: 70vh;
  padding: 24rpx 32rpx;
}

.detail-image {
  width: 100%;
  border-radius: 16rpx;
}

.photo-story {
  margin-top: 24rpx;
  padding: 24rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
}

.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.story-title {
  font-size: 28rpx;
  color: #5C4F42;
  font-weight: 500;
}

.goto-timeline {
  display: flex;
  align-items: center;

  text {
    font-size: 24rpx;
    color: #E07A5F;
  }

  .arrow {
    margin-left: 4rpx;
  }
}

.story-content {
  font-size: 28rpx;
  color: #5C4F42;
  line-height: 1.6;
}

.detail-tags {
  margin-top: 24rpx;
}

.tags-label {
  font-size: 24rpx;
  color: #9E8F7D;
  margin-bottom: 12rpx;
  display: block;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.detail-tag {
  padding: 8rpx 20rpx;
  background-color: rgba(138, 154, 91, 0.1);
  color: #8A9A5B;
  font-size: 24rpx;
  border-radius: 20rpx;
}

// 对比结果弹窗
.compare-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(92, 79, 66, 0.9);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.compare-content {
  width: 100%;
  background-color: #FFFCF8;
  border-radius: 24rpx;
  overflow: hidden;
}

.compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.compare-title {
  font-size: 34rpx;
  color: #5C4F42;
  font-weight: 500;
}

.compare-images {
  display: flex;
  align-items: center;
  padding: 32rpx;
  gap: 16rpx;
}

.compare-item {
  flex: 1;
  text-align: center;
}

.compare-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
}

.compare-date {
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 12rpx;
  display: block;
}

.compare-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16rpx;
}

.vs-text {
  font-size: 28rpx;
  color: #E07A5F;
  font-weight: bold;
}

.compare-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #E8E4DF;
}

.save-btn,
.share-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 30rpx;
}

.save-btn {
  background-color: #FAF7F2;
  color: #5C4F42;
}

.share-btn {
  background-color: #E07A5F;
  color: #FFFCF8;
}
</style>
