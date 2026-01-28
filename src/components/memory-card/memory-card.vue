<template>
  <view class="memory-card" :class="[cardType, { 'resonance-glow': isResonating, 'paper-float': isVisible }]">
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
      <!-- 文字内容 -->
      <view v-if="memory.content" class="content-text">
        <text>{{ memory.content }}</text>
      </view>

      <!-- 图片内容 -->
      <view v-if="memory.images && memory.images.length" class="content-images" :class="imageLayoutClass">
        <image
          v-for="(img, index) in displayImages"
          :key="index"
          class="content-image"
          :src="img"
          mode="aspectFill"
          @tap="previewImage(index)"
        />
        <view v-if="memory.images.length > 4" class="more-images" @tap="previewImage(3)">
          <text>+{{ memory.images.length - 4 }}</text>
        </view>
      </view>

      <!-- 语音内容 -->
      <view v-if="memory.voice" class="content-voice" @tap="playVoice">
        <view class="voice-icon" :class="{ playing: isPlaying }">
          <view class="voice-wave"></view>
          <view class="voice-wave"></view>
          <view class="voice-wave"></view>
        </view>
        <text class="voice-duration">{{ memory.voice.duration }}''</text>
      </view>
    </view>

    <!-- 平行视角指示器 -->
    <view v-if="cardType === 'parallel'" class="parallel-indicator">
      <view
        v-for="(view, index) in memory.parallelViews"
        :key="index"
        class="parallel-dot"
        :style="{ backgroundColor: viewColors[index] }"
      ></view>
      <text class="parallel-hint">{{ memory.parallelViews.length }}个视角</text>
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
      viewColors: ['#E07A5F', '#8A9A5B', '#C4B8A8', '#9E8F7D']
    }
  },
  computed: {
    cardType() {
      if (this.memory.parallelViews && this.memory.parallelViews.length > 1) {
        return 'parallel'
      }
      return 'single'
    },
    formattedTime() {
      return formatRelativeTime(this.memory.createTime)
    },
    displayImages() {
      return this.memory.images ? this.memory.images.slice(0, 4) : []
    },
    imageLayoutClass() {
      const count = this.memory.images ? this.memory.images.length : 0
      if (count === 1) return 'layout-single'
      if (count === 2) return 'layout-double'
      if (count === 3) return 'layout-triple'
      return 'layout-grid'
    },
    hasQuestion() {
      return this.memory.question && !this.memory.questionAnswered
    }
  },
  mounted() {
    // 触发纸张飘入动画
    setTimeout(() => {
      this.isVisible = true
    }, 100)

    // 如果是旧记忆,显示烛光效果
    if (this.isOldMemory) {
      this.showCandleEffect = true
      setTimeout(() => {
        this.showCandleEffect = false
      }, 3000)
    }
  },
  methods: {
    handleResonance() {
      this.isResonating = true
      // 震动反馈
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'medium' })
      // #endif

      this.$emit('resonance', this.memory.id)

      setTimeout(() => {
        this.isResonating = false
      }, 1500)
    },
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.memory.images
      })
    },
    playVoice() {
      if (this.isPlaying) {
        this.isPlaying = false
        // 停止播放
        return
      }
      this.isPlaying = true
      this.$emit('playVoice', this.memory.voice)
      // 模拟播放结束
      setTimeout(() => {
        this.isPlaying = false
      }, this.memory.voice.duration * 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.memory-card {
  background-color: #FFFCF8;
  border-radius: 32rpx;
  border: 2rpx solid #E8E4DF;
  box-shadow: 0 8rpx 24rpx rgba(196, 184, 168, 0.15);
  padding: 32rpx;
  margin: 24rpx 24rpx 0;
  opacity: 0;
  transform: translateY(40rpx) rotate(2deg);
  transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

// 纸张飘入动画
.paper-float {
  opacity: 1;
  transform: translateY(0) rotate(0deg);
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
  margin-bottom: 16rpx;
  padding: 12rpx 16rpx;
  background-color: rgba(138, 154, 91, 0.05);
  border-radius: 16rpx;
}

.parallel-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 6rpx;
}

.parallel-hint {
  font-size: 22rpx;
  color: #9E8F7D;
  margin-left: 8rpx;
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

// 平行视角卡片特殊样式
.parallel {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: -8rpx;
    left: 16rpx;
    right: 16rpx;
    height: 100%;
    background-color: #8A9A5B;
    border-radius: 32rpx;
    z-index: -1;
    opacity: 0.3;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -16rpx;
    left: 32rpx;
    right: 32rpx;
    height: 100%;
    background-color: #E07A5F;
    border-radius: 32rpx;
    z-index: -2;
    opacity: 0.2;
  }
}
</style>
