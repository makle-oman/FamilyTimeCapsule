<template>
  <view class="page-wrapper" :class="fontClass">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 家庭名称头部 -->
    <view class="family-header">
      <view class="family-info">
        <text class="family-name">{{ familyName }}</text>
        <text class="family-year">Established {{ establishedYear }}</text>
      </view>
      <view class="edit-name-btn" @tap="openEditName">
        <text class="edit-icon">✎</text>
      </view>
    </view>

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

    <!-- 家庭名称弹窗 -->
    <family-name-modal
      :visible="showFamilyNameModal"
      :mode="familyNameModalMode"
      :initial-name="familyName"
      @close="closeFamilyNameModal"
      @submit="saveFamilyName"
    />

    <!-- 记忆详情弹窗 -->
    <view v-if="showMemoryPopup" class="memory-popup" @tap.self="closeMemoryPopup">
      <view class="popup-card">
        <!-- 头部：日期 + 关闭按钮 -->
        <view class="popup-header">
          <text class="popup-date">{{ todayMemory?.date }}</text>
          <text class="popup-close" @tap="closeMemoryPopup">Close</text>
        </view>

        <!-- 图片区域 -->
        <view class="popup-image-wrapper">
          <image
            v-if="todayMemory?.images?.length"
            :src="todayMemory.images[0]"
            mode="aspectFill"
            class="popup-image"
          />
          <view v-else class="popup-image-placeholder"></view>
          <text class="popup-image-hint">Do you remember this?</text>
        </view>

        <!-- 引用文字 -->
        <view class="popup-quote">
          <text class="popup-text">"{{ todayMemory?.content }}"</text>
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
import FamilyNameModal from '@/components/family-name-modal/family-name-modal.vue'

export default {
  components: {
    TabBar,
    MemoryCard,
    RecordModal,
    FamilyNameModal
  },
  data() {
    return {
      statusBarHeight: 20,
      scrollTop: 0,
      showReminder: false,
      showRecordModal: false,
      showMemoryPopup: false,
      showFamilyNameModal: false,
      familyNameModalMode: 'welcome',
      loading: false,
      fontClass: 'font-system',
      familyName: '',
      establishedYear: new Date().getFullYear(),
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

    // 加载字体设置
    this.fontClass = uni.getStorageSync('fontClass') || 'font-system'

    // 加载家庭信息
    this.loadFamilyInfo()

    // 加载数据
    this.loadMemories()
    this.checkTodayMemory()

    // 首次进入显示记忆唤醒条动画
    setTimeout(() => {
      this.showReminder = true
    }, 500)
  },
  onShow() {
    // 每次显示页面时刷新字体设置
    this.fontClass = uni.getStorageSync('fontClass') || 'font-system'
    // 刷新家庭信息
    this.loadFamilyInfo()
  },
  methods: {
    loadFamilyInfo() {
      const familyData = uni.getStorageSync('familyData')
      if (familyData && familyData.familyName) {
        this.familyName = familyData.familyName
        this.establishedYear = familyData.establishedYear || new Date().getFullYear()
      } else {
        // 首次登录，显示设置家庭名称弹窗
        this.familyNameModalMode = 'welcome'
        this.showFamilyNameModal = true
      }
    },
    openEditName() {
      this.familyNameModalMode = 'edit'
      this.showFamilyNameModal = true
    },
    closeFamilyNameModal() {
      this.showFamilyNameModal = false
    },
    saveFamilyName(name) {
      this.familyName = name
      const familyData = uni.getStorageSync('familyData') || {}
      familyData.familyName = name
      familyData.establishedYear = familyData.establishedYear || new Date().getFullYear()
      this.establishedYear = familyData.establishedYear
      uni.setStorageSync('familyData', familyData)

      this.showFamilyNameModal = false

      if (this.familyNameModalMode === 'welcome') {
        uni.showToast({
          title: '欢迎回家',
          icon: 'success'
        })
      } else {
        uni.showToast({
          title: '已保存',
          icon: 'success'
        })
      }
    },
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
              {
                authorId: '1',
                authorName: '爸爸',
                avatar: '',
                online: true,
                content: '今天妈妈做的菜真的很好吃，虽然看起来有点奇怪，但味道棒极了！孩子也吃得特别香。',
                images: [],
                tags: ['美食', '家庭'],
                resonanceCount: 2
              },
              {
                authorId: '3',
                authorName: '我',
                avatar: '',
                online: true,
                content: '妈妈今天做的菜超级好吃！我吃了两碗饭，爸爸也夸妈妈的厨艺越来越好了。',
                images: [],
                tags: ['美食'],
                resonanceCount: 1
              }
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
        date: formatDate(Date.now() - 365 * 24 * 60 * 60 * 1000, 'MMM DD, YYYY'),
        content: '那天阳光正好，我们一家人去海边玩耍，孩子第一次看到大海，兴奋得不得了。',
        images: ['https://picsum.photos/600/400?random=memory']
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
  height: 100vh;
  background-color: #FAF7F2;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.status-bar {
  flex-shrink: 0;
  background-color: #FAF7F2;
}

// 家庭名称头部
.family-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16rpx 32rpx 24rpx;
  background: linear-gradient(180deg, #FDF8F3 0%, #FAF7F2 100%);
}

.family-info {
  flex: 1;
}

.family-name {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: #5C4F42;
  font-style: italic;
  line-height: 1.2;
}

.family-year {
  display: block;
  font-size: 24rpx;
  color: #C4B8A8;
  margin-top: 4rpx;
  font-style: italic;
}

.edit-name-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}

.edit-icon {
  font-size: 32rpx;
  color: #C4B8A8;
}

// 记忆唤醒条
.memory-reminder {
  flex-shrink: 0;
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
  flex-shrink: 0;
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
  flex: 1;
  overflow: hidden;
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
  background-color: rgba(196, 184, 168, 0.7);
  backdrop-filter: blur(20rpx);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.popup-card {
  width: 100%;
  background-color: #F5F1ED;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(92, 79, 66, 0.2);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 36rpx;
}

.popup-date {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 32rpx;
  font-style: italic;
  color: #5C4F42;
  font-weight: 500;
}

.popup-close {
  font-size: 28rpx;
  color: #9E8F7D;
  letter-spacing: 1rpx;
}

.popup-image-wrapper {
  position: relative;
  margin: 0 36rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.popup-image {
  width: 100%;
  height: 400rpx;
  display: block;
  filter: grayscale(30%) sepia(10%);
}

.popup-image-placeholder {
  width: 100%;
  height: 400rpx;
  background: linear-gradient(135deg, #D4C8B0 0%, #C4B8A8 100%);
}

.popup-image-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28rpx;
  color: rgba(255, 252, 248, 0.9);
  background-color: rgba(92, 79, 66, 0.4);
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  letter-spacing: 1rpx;
}

.popup-quote {
  padding: 40rpx 36rpx 48rpx;
}

.popup-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 32rpx;
  font-style: italic;
  color: #5C4F42;
  line-height: 1.8;
  text-align: center;
  display: block;
}
</style>
