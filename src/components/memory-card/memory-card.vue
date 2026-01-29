<template>
  <view class="memory-card-wrapper" :class="{ 'has-parallel': hasParallelViews }">
    <!-- 多视角卡片堆叠 -->
    <view v-if="hasParallelViews" class="card-stack" @tap="flipToNext">
      <!-- 底层堆叠的纸张（固定不动，颜色跟随指示器） -->
      <view 
        v-if="allViews.length > 2" 
        class="stacked-layer layer-2" 
        :style="{ backgroundColor: viewColors[(currentViewIndex + 2) % viewColors.length] }"
      ></view>
      <view 
        v-if="allViews.length > 1" 
        class="stacked-layer layer-1" 
        :style="{ backgroundColor: viewColors[(currentViewIndex + 1) % viewColors.length] }"
      ></view>
      
      <!-- 当前显示的卡片（会被吹走） -->
      <view
        class="memory-card current-card"
        :class="[
          { 'resonance-glow': isResonating, 'paper-float': isVisible },
          { 'flip-out': isFlipping }
        ]"
      >
        <!-- 旧记忆标签 -->
        <view v-if="isOldMemory" class="old-memory-tag" :class="{ 'candle-flicker': showCandleEffect }">
          <text class="old-memory-text">365天前，此刻你们也在看这页</text>
        </view>

        <!-- 卡片头部 -->
        <view class="card-header">
          <view class="author-info">
            <view class="avatar-wrapper" :class="{ online: currentView.online }">
              <image
                class="avatar-img"
                :src="currentView.avatar || '/static/images/default-avatar.svg'"
                mode="aspectFill"
              />
            </view>
            <view class="author-detail">
              <text class="author-name">{{ currentView.authorName }}</text>
              <text class="memory-time">{{ formattedTime }}</text>
            </view>
          </view>
          <view v-if="currentView.tags && currentView.tags.length" class="tags-wrapper">
            <view v-for="tag in currentView.tags" :key="tag" class="memory-tag">{{ tag }}</view>
          </view>
        </view>

        <!-- 卡片内容 -->
        <view class="card-content">
          <view v-if="currentView.content" class="content-text">
            <text>{{ currentView.content }}</text>
          </view>

          <view v-if="currentView.images && currentView.images.length" class="content-images" :class="getImageLayoutClass(currentView.images)">
            <image
              v-for="(img, index) in currentView.images.slice(0, 4)"
              :key="index"
              class="content-image"
              :src="img"
              mode="aspectFill"
              @tap.stop="previewImage(currentView.images, index)"
            />
            <view v-if="currentView.images.length > 4" class="more-images" @tap.stop="previewImage(currentView.images, 3)">
              <text>+{{ currentView.images.length - 4 }}</text>
            </view>
          </view>

          <view v-if="currentView.voice" class="content-voice" @tap.stop="playVoice(currentView.voice)">
            <view class="voice-icon" :class="{ playing: isPlaying }">
              <view class="voice-wave"></view>
              <view class="voice-wave"></view>
              <view class="voice-wave"></view>
            </view>
            <text class="voice-duration">{{ currentView.voice.duration }}''</text>
          </view>
        </view>

        <!-- 平行视角指示器 -->
        <view class="parallel-indicator">
          <view class="parallel-dots">
            <view
              v-for="(view, index) in allViews"
              :key="index"
              class="parallel-dot"
              :class="{ active: index === currentViewIndex }"
              :style="{ backgroundColor: viewColors[index % viewColors.length] }"
            ></view>
          </view>
          <text class="parallel-hint">{{ currentViewIndex + 1 }}/{{ allViews.length }}个视角 · 点击翻页</text>
        </view>

        <!-- 卡片底部操作 -->
        <view class="card-footer">
          <view class="resonance-btn" @tap.stop="handleResonance">
            <text class="resonance-icon">💕</text>
            <text v-if="totalResonanceCount" class="resonance-count">{{ totalResonanceCount }}</text>
          </view>
          <view v-if="hasQuestion" class="question-indicator">
            <view class="question-dot pulse-glow"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 单视角卡片（无翻页） -->
    <view
      v-else
      class="memory-card"
      :class="[cardType, { 'resonance-glow': isResonating, 'paper-float': isVisible }]"
    >
      <!-- 旧记忆标签 -->
      <view v-if="isOldMemory" class="old-memory-tag" :class="{ 'candle-flicker': showCandleEffect }">
        <text class="old-memory-text">365天前，此刻你们也在看这页</text>
      </view>

      <!-- 卡片头部 -->
      <view class="card-header">
        <view class="author-info">
          <view class="avatar-wrapper" :class="{ online: memory.authorOnline }">
            <image
              class="avatar-img"
              :src="memory.authorAvatar || '/static/images/default-avatar.svg'"
              mode="aspectFill"
            />
          </view>
          <view class="author-detail">
            <text class="author-name">{{ memory.authorName }}</text>
            <text class="memory-time">{{ formattedTime }}</text>
          </view>
        </view>
        <view v-if="memory.tags && memory.tags.length" class="tags-wrapper">
          <view v-for="tag in memory.tags" :key="tag" class="memory-tag">{{ tag }}</view>
        </view>
      </view>

      <!-- 卡片内容 -->
      <view class="card-content">
        <view v-if="memory.content" class="content-text">
          <text>{{ memory.content }}</text>
        </view>

        <view v-if="memory.images && memory.images.length" class="content-images" :class="imageLayoutClass">
          <image
            v-for="(img, index) in displayImages"
            :key="index"
            class="content-image"
            :src="img"
            mode="aspectFill"
            @tap="previewImage(memory.images, index)"
          />
          <view v-if="memory.images.length > 4" class="more-images" @tap="previewImage(memory.images, 3)">
            <text>+{{ memory.images.length - 4 }}</text>
          </view>
        </view>

        <view v-if="memory.voice" class="content-voice" @tap="playVoice(memory.voice)">
          <view class="voice-icon" :class="{ playing: isPlaying }">
            <view class="voice-wave"></view>
            <view class="voice-wave"></view>
            <view class="voice-wave"></view>
          </view>
          <text class="voice-duration">{{ memory.voice.duration }}''</text>
        </view>
      </view>

      <!-- 卡片底部操作 -->
      <view class="card-footer">
        <view class="resonance-btn" @tap="handleResonance">
          <text class="resonance-icon">💕</text>
          <text v-if="memory.resonanceCount" class="resonance-count">{{ memory.resonanceCount }}</text>
        </view>
        <view v-if="hasQuestion" class="question-indicator">
          <view class="question-dot pulse-glow"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatRelativeTime } from '@/utils/index.js'

export default {
  name: 'MemoryCard',
  props: {
    memory: {
      type: Object,
      required: true
    },
    isOldMemory: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisible: false,
      isResonating: false,
      isPlaying: false,
      showCandleEffect: false,
      currentViewIndex: 0,
      isFlipping: false,
      viewColors: ['#8A9A5B', '#E07A5F', '#C4B8A8', '#9E8F7D']
    }
  },
  computed: {
    hasParallelViews() {
      return this.memory.parallelViews && this.memory.parallelViews.length > 0
    },
    allViews() {
      if (!this.hasParallelViews) return []

      const mainView = {
        authorId: this.memory.authorId,
        authorName: this.memory.authorName,
        avatar: this.memory.authorAvatar,
        online: this.memory.authorOnline,
        content: this.memory.content,
        images: this.memory.images,
        tags: this.memory.tags,
        voice: this.memory.voice,
        resonanceCount: this.memory.resonanceCount
      }

      const parallelViews = this.memory.parallelViews.map((view) => ({
        authorId: view.authorId,
        authorName: view.authorName,
        avatar: view.avatar || '',
        online: view.online || false,
        content: view.content || `这是${view.authorName}的视角记录...`,
        images: view.images || [],
        tags: view.tags || this.memory.tags,
        voice: view.voice || null,
        resonanceCount: view.resonanceCount || 0
      }))

      return [mainView, ...parallelViews]
    },
    currentView() {
      return this.allViews[this.currentViewIndex] || {}
    },
    totalResonanceCount() {
      if (!this.hasParallelViews) return this.memory.resonanceCount
      return this.allViews.reduce((sum, view) => sum + (view.resonanceCount || 0), 0)
    },
    cardType() {
      return this.hasParallelViews ? 'parallel' : 'single'
    },
    formattedTime() {
      return formatRelativeTime(this.memory.createTime)
    },
    displayImages() {
      return this.memory.images ? this.memory.images.slice(0, 4) : []
    },
    imageLayoutClass() {
      return this.getImageLayoutClass(this.memory.images)
    },
    hasQuestion() {
      return this.memory.question && !this.memory.questionAnswered
    }
  },
  mounted() {
    setTimeout(() => {
      this.isVisible = true
    }, 100)

    if (this.isOldMemory) {
      this.showCandleEffect = true
      setTimeout(() => {
        this.showCandleEffect = false
      }, 3000)
    }
  },
  methods: {
    getImageLayoutClass(images) {
      const count = images ? images.length : 0
      if (count === 1) return 'layout-single'
      if (count === 2) return 'layout-double'
      if (count === 3) return 'layout-triple'
      return 'layout-grid'
    },
    flipToNext() {
      if (this.isFlipping) return
      if (this.currentViewIndex >= this.allViews.length - 1) {
        // 已经是最后一张，回到第一张
        this.isFlipping = true
        // #ifdef MP-WEIXIN
        uni.vibrateShort({ type: 'light' })
        // #endif

        setTimeout(() => {
          this.currentViewIndex = 0
          this.isFlipping = false
        }, 600)
        return
      }

      this.isFlipping = true
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'light' })
      // #endif

      setTimeout(() => {
        this.currentViewIndex++
        this.isFlipping = false
      }, 600)
    },
    handleResonance() {
      this.isResonating = true
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'medium' })
      // #endif

      this.$emit('resonance', this.memory.id)

      setTimeout(() => {
        this.isResonating = false
      }, 1500)
    },
    previewImage(images, index) {
      uni.previewImage({
        current: index,
        urls: images
      })
    },
    playVoice(voice) {
      if (this.isPlaying) {
        this.isPlaying = false
        return
      }
      this.isPlaying = true
      this.$emit('playVoice', voice)
      setTimeout(() => {
        this.isPlaying = false
      }, voice.duration * 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.memory-card-wrapper {
  position: relative;
  margin: 24rpx 24rpx 0;

  &.has-parallel {
    margin-bottom: 40rpx;
  }
}

// 卡片堆叠容器
.card-stack {
  position: relative;
  padding-bottom: 20rpx; // 留出空间让底层纸张露出
}

// 主卡片样式 - 单视角保持原来的白色
.memory-card {
  position: relative;
  background-color: #FFFCF8;
  border-radius: 32rpx;
  border: 2rpx solid #E8E4DF;
  box-shadow: 0 8rpx 24rpx rgba(196, 184, 168, 0.15);
  padding: 32rpx;
  opacity: 0;
  transform: translateY(40rpx) rotate(2deg);
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

// 多视角卡片 - 米黄色纸张效果
.current-card.memory-card {
  background: linear-gradient(180deg, #F5EEE6 0%, #EDE5D8 100%);
  border-radius: 24rpx;
  border: 1rpx solid rgba(92, 79, 66, 0.12);
  box-shadow: 0 4rpx 16rpx rgba(92, 79, 66, 0.1);
}

// 当前卡片
.current-card {
  z-index: 10;
}

// 纸张飘入动画
.paper-float {
  opacity: 1;
  transform: translateY(0) rotate(0deg);
}

// 翻页吹飞动画 - 模拟纸张被风吹走的效果
.flip-out {
  animation: paperBlowAway 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  pointer-events: none;
}

@keyframes paperBlowAway {
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 1;
    filter: brightness(1);
  }
  15% {
    transform: translateY(-20rpx) rotate(-3deg) scale(1.02);
    opacity: 1;
  }
  40% {
    transform: translateX(60rpx) translateY(-60rpx) rotate(-12deg) scale(0.98);
    opacity: 0.9;
    filter: brightness(1.05);
  }
  70% {
    transform: translateX(200rpx) translateY(-100rpx) rotate(-25deg) scale(0.9);
    opacity: 0.5;
  }
  100% {
    transform: translateX(400rpx) translateY(-120rpx) rotate(-35deg) scale(0.8);
    opacity: 0;
    filter: brightness(1.1);
  }
}

// 共鸣金光效果
.resonance-glow {
  animation: resonanceGlow 1.5s ease-out;
}

@keyframes resonanceGlow {
  0% {
    box-shadow: 0 8rpx 24rpx rgba(196, 184, 168, 0.15);
  }
  30% {
    box-shadow: 0 0 40rpx rgba(224, 122, 95, 0.4);
  }
  100% {
    box-shadow: 0 8rpx 24rpx rgba(196, 184, 168, 0.15);
  }
}

// 旧记忆标签
.old-memory-tag {
  margin-bottom: 16rpx;
}

.old-memory-text {
  font-size: 22rpx;
  color: #9E8F7D;
  font-style: italic;
}

// 烛光闪烁效果
.candle-flicker {
  animation: candleFlicker 0.5s ease-in-out infinite;
}

@keyframes candleFlicker {
  0%, 100% { opacity: 1; }
  25% { opacity: 0.97; }
  50% { opacity: 0.95; }
  75% { opacity: 0.98; }
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.author-info {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  width: 72rpx;
  height: 72rpx;
  border-radius: 48% 52% 53% 47% / 52% 46% 54% 48%;
  border: 3rpx solid #C4B8A8;
  overflow: hidden;
  position: relative;
}

.avatar-wrapper.online::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16rpx;
  height: 16rpx;
  background-color: #8A9A5B;
  border-radius: 50%;
  border: 2rpx solid #FFFCF8;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.author-detail {
  margin-left: 16rpx;
}

.author-name {
  display: block;
  font-size: 28rpx;
  color: #5C4F42;
  font-weight: 500;
}

.memory-time {
  display: block;
  font-size: 22rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.memory-tag {
  padding: 6rpx 16rpx;
  background-color: rgba(224, 122, 95, 0.1);
  color: #E07A5F;
  font-size: 22rpx;
  border-radius: 16rpx;
}

// 卡片内容
.card-content {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 32rpx;
  color: #5C4F42;
  line-height: 1.7;
  word-break: break-all;
}

// 图片布局
.content-images {
  display: grid;
  gap: 12rpx;
  margin-top: 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.layout-single {
  grid-template-columns: 1fr;
}

.layout-double {
  grid-template-columns: 1fr 1fr;
}

.layout-triple {
  grid-template-columns: 1fr 1fr;
  .content-image:first-child {
    grid-column: span 2;
  }
}

.layout-grid {
  grid-template-columns: 1fr 1fr;
}

.content-image {
  width: 100%;
  height: 240rpx;
  object-fit: cover;
  border-radius: 12rpx;
}

.layout-single .content-image {
  height: 400rpx;
}

.more-images {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(92, 79, 66, 0.6);
  color: #FFFCF8;
  font-size: 32rpx;
  border-radius: 12rpx;
}

// 语音内容
.content-voice {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: rgba(224, 122, 95, 0.1);
  border-radius: 40rpx;
  width: fit-content;
  margin-top: 16rpx;
}

.voice-icon {
  display: flex;
  align-items: flex-end;
  height: 32rpx;
  gap: 4rpx;
}

.voice-wave {
  width: 6rpx;
  background-color: #E07A5F;
  border-radius: 3rpx;
  &:nth-child(1) { height: 12rpx; }
  &:nth-child(2) { height: 20rpx; }
  &:nth-child(3) { height: 16rpx; }
}

.voice-icon.playing .voice-wave {
  animation: waveAnim 0.5s ease-in-out infinite alternate;
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
}

@keyframes waveAnim {
  from { transform: scaleY(1); }
  to { transform: scaleY(1.5); }
}

.voice-duration {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #E07A5F;
}

// 平行视角指示器
.parallel-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 16rpx 20rpx;
  background-color: rgba(138, 154, 91, 0.08);
  border-radius: 20rpx;
}

.parallel-dots {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.parallel-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  opacity: 0.4;
  transition: all 0.3s ease;

  &.active {
    opacity: 1;
    transform: scale(1.3);
    box-shadow: 0 0 8rpx currentColor;
  }
}

.parallel-hint {
  font-size: 24rpx;
  color: #9E8F7D;
  font-style: italic;
}

// 卡片底部
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid #E8E4DF;
}

.resonance-btn {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;

  &:active {
    background-color: rgba(224, 122, 95, 0.1);
    transform: scale(1.1);
  }
}

.resonance-icon {
  font-size: 32rpx;
}

.resonance-count {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #9E8F7D;
}

// 问题指示器
.question-indicator {
  display: flex;
  align-items: center;
}

.question-dot {
  width: 20rpx;
  height: 20rpx;
  background-color: #8A9A5B;
  border-radius: 50%;
}

// 心跳光晕
.pulse-glow {
  animation: pulseGlow 1.5s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(138, 154, 91, 0.4);
  }
  50% {
    box-shadow: 0 0 20rpx 10rpx rgba(138, 154, 91, 0.2);
  }
}

// 底层堆叠的纸张（独立元素，不会被吹走）
.stacked-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24rpx;
  pointer-events: none;
}

.layer-1 {
  top: 8rpx;
  left: 16rpx;
  right: 16rpx;
  z-index: 1;
}

.layer-2 {
  top: 16rpx;
  left: 32rpx;
  right: 32rpx;
  z-index: 0;
}
</style>
