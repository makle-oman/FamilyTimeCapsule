<template>
  <view class="envelope-card" :class="{ 'can-open': canOpen, burning: isBurning }" @tap="handleTap">
    <!-- 信封主体 -->
    <view class="envelope-body">
      <!-- 信封盖子 -->
      <view class="envelope-flap"></view>

      <!-- 火漆印章 -->
      <view class="wax-seal" :class="{ 'flame-active': showFlame }">
        <view class="seal-inner">
          <text class="seal-text">封</text>
        </view>
        <!-- 火焰粒子 -->
        <view v-if="showFlame" class="flame-particles">
          <view v-for="i in 5" :key="i" class="flame-particle"></view>
        </view>
      </view>

      <!-- 信封内容预览 -->
      <view class="envelope-preview">
        <text class="preview-date">{{ formattedDate }}</text>
        <text class="preview-hint">{{ daysLeft > 0 ? `还有 ${daysLeft} 天解锁` : '可以打开了' }}</text>
      </view>

      <!-- 焦痕效果 -->
      <view v-if="canOpen" class="burn-marks">
        <view class="burn-mark mark-1"></view>
        <view class="burn-mark mark-2"></view>
        <view class="burn-mark mark-3"></view>
      </view>
    </view>

    <!-- 发送人信息 -->
    <view class="sender-info">
      <view class="sender-avatar">
        <image :src="letter.senderAvatar || '/static/images/default-avatar.svg'" mode="aspectFill" />
      </view>
      <text class="sender-name">来自 {{ letter.senderName }}</text>
    </view>
  </view>
</template>

<script>
import { formatDate } from '@/utils/index.js'

export default {
  name: 'EnvelopeCard',
  props: {
    letter: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showFlame: false,
      isBurning: false
    }
  },
  computed: {
    canOpen() {
      return this.letter.unlockTime <= Date.now()
    },
    daysLeft() {
      const diff = this.letter.unlockTime - Date.now()
      return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
    },
    formattedDate() {
      return formatDate(this.letter.createTime, 'YYYY年MM月DD日')
    }
  },
  mounted() {
    // 距离解锁7天内显示火焰效果
    if (this.daysLeft <= 7 && this.daysLeft > 0) {
      this.showFlame = true
    }
  },
  methods: {
    handleTap() {
      if (!this.canOpen) {
        uni.showToast({
          title: `还有 ${this.daysLeft} 天才能打开`,
          icon: 'none'
        })
        return
      }

      // 触发开启动画
      this.isBurning = true

      // 震动反馈
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'heavy' })
      // #endif

      // 播放火漆破碎音效
      // TODO: 播放音效

      setTimeout(() => {
        this.$emit('open', this.letter)
      }, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.envelope-card {
  margin: 24rpx;
  perspective: 1000px;
}

.envelope-body {
  position: relative;
  width: 100%;
  height: 280rpx;
  background: linear-gradient(180deg, #E8DCC4 0%, #D4C8B0 100%);
  border-radius: 16rpx;
  box-shadow: 0 12rpx 32rpx rgba(92, 79, 66, 0.2);
  overflow: hidden;
}

// 信封盖子
.envelope-flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: linear-gradient(180deg, #D4C8B0 0%, #C4B8A0 100%);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  z-index: 2;
}

// 火漆印章
.wax-seal {
  position: absolute;
  top: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #E07A5F 0%, #C4534A 100%);
  border-radius: 50%;
  z-index: 3;
  box-shadow: 0 4rpx 12rpx rgba(224, 122, 95, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-inner {
  width: 60rpx;
  height: 60rpx;
  border: 2rpx solid rgba(255, 252, 248, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-text {
  font-size: 28rpx;
  color: #FFFCF8;
  font-weight: bold;
}

// 火焰粒子
.flame-particles {
  position: absolute;
  top: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 40rpx;
}

.flame-particle {
  position: absolute;
  width: 8rpx;
  height: 16rpx;
  background: linear-gradient(180deg, #FFD700 0%, #E07A5F 100%);
  border-radius: 50%;
  animation: flameAnim 0.5s ease-in-out infinite;

  &:nth-child(1) { left: 10rpx; animation-delay: 0s; }
  &:nth-child(2) { left: 20rpx; animation-delay: 0.1s; }
  &:nth-child(3) { left: 30rpx; animation-delay: 0.2s; }
  &:nth-child(4) { left: 40rpx; animation-delay: 0.15s; }
  &:nth-child(5) { left: 50rpx; animation-delay: 0.05s; }
}

@keyframes flameAnim {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(-8rpx) scale(1.2);
    opacity: 0.7;
  }
}

// 信封预览内容
.envelope-preview {
  position: absolute;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
  text-align: center;
}

.preview-date {
  display: block;
  font-size: 26rpx;
  color: #5C4F42;
  margin-bottom: 8rpx;
}

.preview-hint {
  font-size: 24rpx;
  color: #9E8F7D;
}

// 焦痕效果
.burn-marks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.burn-mark {
  position: absolute;
  background: radial-gradient(ellipse, rgba(92, 79, 66, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: burnAppear 2s ease-out forwards;
}

.mark-1 {
  width: 60rpx;
  height: 40rpx;
  top: 20rpx;
  right: 20rpx;
  animation-delay: 0s;
}

.mark-2 {
  width: 80rpx;
  height: 50rpx;
  bottom: 30rpx;
  left: 30rpx;
  animation-delay: 0.3s;
}

.mark-3 {
  width: 50rpx;
  height: 30rpx;
  bottom: 60rpx;
  right: 60rpx;
  animation-delay: 0.6s;
}

@keyframes burnAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

// 可开启状态
.can-open {
  .envelope-body {
    cursor: pointer;
  }

  .wax-seal {
    animation: sealPulse 2s ease-in-out infinite;
  }
}

@keyframes sealPulse {
  0%, 100% {
    box-shadow: 0 4rpx 12rpx rgba(224, 122, 95, 0.4);
  }
  50% {
    box-shadow: 0 4rpx 24rpx rgba(224, 122, 95, 0.6);
  }
}

// 开启燃烧效果
.burning {
  .wax-seal {
    animation: sealBreak 0.8s ease-out forwards;
  }

  .envelope-flap {
    animation: flapOpen 0.8s ease-out forwards;
  }
}

@keyframes sealBreak {
  0% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) scale(1.3);
  }
  100% {
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }
}

@keyframes flapOpen {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(-180deg);
    transform-origin: top center;
  }
}

// 发送人信息
.sender-info {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding: 0 8rpx;
}

.sender-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.sender-name {
  font-size: 24rpx;
  color: #9E8F7D;
}
</style>
