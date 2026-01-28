<template>
  <view class="page-wrapper">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 记忆唤醒条 -->
    <view
      v-if="todayMemory"
      class="memory-reminder"
      :class="{ 'slide-in': showReminder }"
      @tap="openMemoryDetail"
    >
      <view class="reminder-mark"></view>
      <view class="reminder-content">
        <text class="reminder-title">{{ todayMemory.title || '365天前的今天' }}</text>
        <text class="reminder-preview">{{ todayMemory.preview }}</text>
      </view>
      <view class="reminder-arrow">›</view>
    </view>

    <!-- 家庭头像栏 -->
    <view class="family-avatars">
      <scroll-view scroll-x class="avatars-scroll">
        <view
          v-for="member in familyMembers"
          :key="member.id"
          class="member-avatar"
          :class="{ online: member.online }"
        >
          <image
            :src="member.avatar || '/static/images/default-avatar.svg'"
            mode="aspectFill"
            class="avatar-img"
          />
          <text class="member-name">{{ member.name }}</text>
        </view>
        <view class="add-member" @tap="addMember">
          <text class="add-icon">+</text>
        </view>
      </scroll-view>
    </view>

    <!-- 日记卡片流 -->
    <scroll-view
      scroll-y
      class="timeline-scroll"
      @scrolltolower="loadMore"
      :scroll-top="scrollTop"
    >
      <!-- 日期分隔线 -->
      <view v-for="(group, date) in groupedMemories" :key="date">
        <view class="date-divider">
          <view class="date-line"></view>
          <text class="date-text">{{ date }}</text>
          <view class="date-line"></view>
        </view>

        <!-- 日记卡片 -->
        <memory-card
          v-for="memory in group"
          :key="memory.id"
          :memory="memory"
          :is-old-memory="memory.isOldMemory"
          @resonance="handleResonance"
          @playVoice="handlePlayVoice"
        />
      </view>

      <!-- 空状态 -->
      <view v-if="!memories.length && !loading" class="empty-state">
        <view class="empty-illustration">
          <view class="empty-book"></view>
        </view>
        <text class="empty-text">这里还空着，等待第一个温柔的故事</text>
        <view class="empty-hint" @tap="openRecord">
          <text>点击中间的 + 开始记录</text>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">正在唤醒记忆...</text>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 悬浮问答按钮 -->
    <view
      v-if="hasUnansweredQuestion"
      class="float-question-btn pulse-glow"
      @tap="openQuestion"
    >
      <text class="question-icon">?</text>
    </view>

    <!-- 自定义底部导航 -->
    <tab-bar current-tab="timeline" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <record-modal
      :visible="showRecordModal"
      @close="closeRecord"
      @submit="submitRecord"
    />

    <!-- 记忆详情弹窗 -->
    <view v-if="showMemoryPopup" class="memory-popup" @tap.self="closeMemoryPopup">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">当日回忆</text>
          <view class="popup-close" @tap="closeMemoryPopup">×</view>
        </view>
        <view class="popup-body">
          <text class="popup-date">{{ todayMemory?.date }}</text>
          <text class="popup-text">{{ todayMemory?.content }}</text>
          <view v-if="todayMemory?.images?.length" class="popup-images">
            <image
              v-for="(img, index) in todayMemory.images"
              :key="index"
              :src="img"
              mode="aspectFill"
              class="popup-image"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDate, generateId, getWarmMessage } from '@/utils/index.js'
import TabBar from '@/components/tab-bar/tab-bar.vue'
import MemoryCard from '@/components/memory-card/memory-card.vue'
import RecordModal from '@/components/record-modal/record-modal.vue'

export default {
  components: {
    TabBar,
    MemoryCard,
    RecordModal
  },
  data() {
    return {
      statusBarHeight: 20,
      scrollTop: 0,
      showReminder: false,
      showRecordModal: false,
      showMemoryPopup: false,
      loading: false,
      familyMembers: [
        { id: '1', name: '爸爸', avatar: '', online: true },
        { id: '2', name: '妈妈', avatar: '', online: true },
        { id: '3', name: '我', avatar: '', online: true }
      ],
      memories: [],
      todayMemory: null,
      hasUnansweredQuestion: false,
      pageNo: 1,
      hasMore: true
    }
  },
  computed: {
    groupedMemories() {
      const groups = {}
      this.memories.forEach(memory => {
        const date = formatDate(memory.createTime, 'MM月DD日')
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(memory)
      })
      return groups
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 20

    // 加载数据
    this.loadMemories()
    this.checkTodayMemory()

    // 首次进入显示记忆唤醒条动画
    setTimeout(() => {
      this.showReminder = true
    }, 500)
  },
  methods: {
    loadMemories() {
      this.loading = true

      // 模拟数据加载
      setTimeout(() => {
        const mockMemories = [
          {
            id: generateId(),
            authorId: '1',
            authorName: '爸爸',
            authorAvatar: '',
            authorOnline: true,
            content: '今天带孩子去公园放风筝，春天的风很温柔，就像我们的生活一样。',
            images: [],
            tags: ['日常', '出行'],
            createTime: Date.now() - 1000 * 60 * 30,
            resonanceCount: 2
          },
          {
            id: generateId(),
            authorId: '2',
            authorName: '妈妈',
            authorAvatar: '',
            authorOnline: true,
            content: '学会了一道新菜，虽然卖相不太好，但家人都说好吃。',
            images: [],
            tags: ['美食'],
            createTime: Date.now() - 1000 * 60 * 60 * 2,
            resonanceCount: 3,
            parallelViews: [
              { authorId: '1', authorName: '爸爸' },
              { authorId: '2', authorName: '妈妈' }
            ]
          },
          {
            id: generateId(),
            authorId: '3',
            authorName: '我',
            authorAvatar: '',
            authorOnline: true,
            content: '今天考试成绩出来了，虽然不是满分，但是进步很大。感谢爸爸妈妈的鼓励！',
            images: [],
            tags: ['成长', '感恩'],
            createTime: Date.now() - 1000 * 60 * 60 * 24,
            resonanceCount: 5,
            isOldMemory: false
          }
        ]

        this.memories = [...this.memories, ...mockMemories]
        this.loading = false
        this.pageNo++
      }, 1000)
    },
    checkTodayMemory() {
      // 检查是否有365天前的今天的记忆
      // 模拟数据
      this.todayMemory = {
        title: '365天前的今天',
        preview: '那天我们一起去了海边...',
        date: formatDate(Date.now() - 365 * 24 * 60 * 60 * 1000, 'YYYY年MM月DD日'),
        content: '那天阳光正好，我们一家人去海边玩耍。孩子第一次看到大海，兴奋得不得了。这样的时光，真希望永远不会结束。',
        images: []
      }
    },
    openMemoryDetail() {
      this.showMemoryPopup = true
    },
    closeMemoryPopup() {
      this.showMemoryPopup = false
    },
    openRecord() {
      this.showRecordModal = true
    },
    closeRecord() {
      this.showRecordModal = false
    },
    submitRecord(data) {
      // 添加新记录到列表
      const newMemory = {
        id: generateId(),
        authorId: '3',
        authorName: '我',
        authorAvatar: '',
        authorOnline: true,
        content: data.content,
        images: data.images,
        tags: data.tags,
        voice: data.type === 'voice' ? { duration: data.voiceDuration } : null,
        createTime: data.createTime,
        resonanceCount: 0
      }

      this.memories.unshift(newMemory)
      this.scrollTop = 0
    },
    handleResonance(memoryId) {
      // 处理共鸣
      const memory = this.memories.find(m => m.id === memoryId)
      if (memory) {
        memory.resonanceCount = (memory.resonanceCount || 0) + 1
      }
    },
    handlePlayVoice(voice) {
      // 播放语音
      console.log('播放语音', voice)
    },
    openQuestion() {
      // 打开问答
      uni.showToast({
        title: '问答功能开发中',
        icon: 'none'
      })
    },
    addMember() {
      uni.showToast({
        title: '邀请家人功能开发中',
        icon: 'none'
      })
    },
    loadMore() {
      if (this.loading || !this.hasMore) return
      this.loadMemories()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  min-height: 100vh;
  background-color: #FAF7F2;
}

.status-bar {
  background-color: #FAF7F2;
}

// 记忆唤醒条
.memory-reminder {
  display: flex;
  align-items: center;
  margin: 16rpx 24rpx;
  padding: 24rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(196, 184, 168, 0.1);
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.slide-in {
  transform: translateY(0);
  opacity: 1;
}

.reminder-mark {
  width: 8rpx;
  height: 48rpx;
  background-color: #E07A5F;
  border-radius: 4rpx;
  margin-right: 20rpx;
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  display: block;
  font-size: 28rpx;
  color: #5C4F42;
  font-weight: 500;
}

.reminder-preview {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reminder-arrow {
  font-size: 32rpx;
  color: #C4B8A8;
}

// 家庭头像栏
.family-avatars {
  padding: 16rpx 0;
}

.avatars-scroll {
  white-space: nowrap;
  padding: 0 24rpx;
}

.member-avatar {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 24rpx;
  position: relative;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48% 52% 53% 47% / 52% 46% 54% 48%;
  border: 3rpx solid #C4B8A8;
}

.member-avatar.online .avatar-img {
  border-color: #8A9A5B;
  animation: breathingBorder 2s ease-in-out infinite;
}

@keyframes breathingBorder {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(138, 154, 91, 0.3);
  }
  50% {
    box-shadow: 0 0 12rpx 4rpx rgba(138, 154, 91, 0.2);
  }
}

.member-name {
  font-size: 22rpx;
  color: #9E8F7D;
  margin-top: 8rpx;
}

.add-member {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 2rpx dashed #C4B8A8;
  vertical-align: top;
}

.add-icon {
  font-size: 40rpx;
  color: #C4B8A8;
}

// 日记卡片流
.timeline-scroll {
  height: calc(100vh - 300rpx);
}

// 日期分隔线
.date-divider {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx 16rpx;
}

.date-line {
  flex: 1;
  height: 1rpx;
  background-color: #E8E4DF;
}

.date-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: #9E8F7D;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-illustration {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-book {
  width: 100rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #E8DCC4 0%, #D4C8B0 100%);
  border-radius: 8rpx;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 8rpx;
    top: 8rpx;
    right: 8rpx;
    bottom: 8rpx;
    background-color: #FFFCF8;
    border-radius: 4rpx;
  }

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 8rpx;
    background-color: #E07A5F;
    border-radius: 0 4rpx 4rpx 0;
  }
}

.empty-text {
  font-size: 28rpx;
  color: #9E8F7D;
  text-align: center;
  line-height: 1.6;
}

.empty-hint {
  margin-top: 24rpx;
  padding: 16rpx 32rpx;
  background-color: rgba(224, 122, 95, 0.1);
  border-radius: 32rpx;

  text {
    font-size: 26rpx;
    color: #E07A5F;
  }
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

// 底部留白
.bottom-space {
  height: 200rpx;
}

// 悬浮问答按钮
.float-question-btn {
  position: fixed;
  right: 32rpx;
  bottom: 240rpx;
  width: 88rpx;
  height: 88rpx;
  background-color: #8A9A5B;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(138, 154, 91, 0.3);
  z-index: 100;
}

.pulse-glow {
  animation: pulseGlow 1.5s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 8rpx 24rpx rgba(138, 154, 91, 0.3);
  }
  50% {
    box-shadow: 0 8rpx 32rpx rgba(138, 154, 91, 0.5), 0 0 20rpx rgba(138, 154, 91, 0.3);
  }
}

.question-icon {
  font-size: 40rpx;
  color: #FFFCF8;
  font-weight: bold;
}

// 记忆详情弹窗
.memory-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(196, 184, 168, 0.6);
  backdrop-filter: blur(10rpx);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.popup-content {
  width: 100%;
  max-height: 80vh;
  background-color: #FFFCF8;
  border-radius: 32rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.popup-title {
  font-size: 32rpx;
  color: #5C4F42;
  font-weight: 500;
}

.popup-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #9E8F7D;
}

.popup-body {
  padding: 32rpx;
}

.popup-date {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-bottom: 16rpx;
}

.popup-text {
  font-size: 32rpx;
  color: #5C4F42;
  line-height: 1.7;
}

.popup-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}

.popup-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
}
</style>
