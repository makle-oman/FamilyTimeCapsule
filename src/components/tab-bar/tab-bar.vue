<template>
  <view class="tab-bar-wrapper">
    <!-- 毛玻璃背景层 -->
    <view class="tab-bar-bg"></view>

    <!-- Tab 内容 -->
    <view class="tab-bar-content">
      <!-- 时光轴 -->
      <view
        class="tab-item"
        :class="{ active: currentTab === 'timeline' }"
        @tap="switchTab('timeline')"
      >
        <view class="tab-icon-wrapper" :class="{ 'ink-spread': currentTab === 'timeline' }">
          <view class="tab-icon">
            <image
              class="icon-img"
              :src="currentTab === 'timeline' ? '/static/icons/tabbar/timeline-active.svg' : '/static/icons/tabbar/timeline.svg'"
              mode="aspectFit"
            />
          </view>
        </view>
        <text class="tab-text" :class="{ 'text-active': currentTab === 'timeline' }">时光轴</text>
      </view>

      <!-- 相册馆 -->
      <view
        class="tab-item"
        :class="{ active: currentTab === 'gallery' }"
        @tap="switchTab('gallery')"
      >
        <view class="tab-icon-wrapper" :class="{ 'ink-spread': currentTab === 'gallery' }">
          <view class="tab-icon">
            <image
              class="icon-img"
              :src="currentTab === 'gallery' ? '/static/icons/tabbar/gallery-active.svg' : '/static/icons/tabbar/gallery.svg'"
              mode="aspectFit"
            />
          </view>
        </view>
        <text class="tab-text" :class="{ 'text-active': currentTab === 'gallery' }">相册馆</text>
      </view>

      <!-- 中间悬浮记录按钮占位 -->
      <view class="center-btn-placeholder"></view>

      <!-- 慢递 -->
      <view
        class="tab-item"
        :class="{ active: currentTab === 'mailbox' }"
        @tap="switchTab('mailbox')"
      >
        <view class="tab-icon-wrapper" :class="{ 'ink-spread': currentTab === 'mailbox' }">
          <view class="tab-icon">
            <image
              class="icon-img"
              :src="currentTab === 'mailbox' ? '/static/icons/tabbar/mailbox-active.svg' : '/static/icons/tabbar/mailbox.svg'"
              mode="aspectFit"
            />
          </view>
        </view>
        <text class="tab-text" :class="{ 'text-active': currentTab === 'mailbox' }">慢递</text>
      </view>

      <!-- 我们 -->
      <view
        class="tab-item"
        :class="{ active: currentTab === 'profile' }"
        @tap="switchTab('profile')"
      >
        <view class="tab-icon-wrapper" :class="{ 'ink-spread': currentTab === 'profile' }">
          <view class="tab-icon">
            <image
              class="icon-img"
              :src="currentTab === 'profile' ? '/static/icons/tabbar/profile-active.svg' : '/static/icons/tabbar/profile.svg'"
              mode="aspectFit"
            />
          </view>
        </view>
        <text class="tab-text" :class="{ 'text-active': currentTab === 'profile' }">我们</text>
      </view>
    </view>

    <!-- 中间悬浮记录按钮 -->
    <view class="center-btn-wrapper" @tap="openRecord">
      <view class="center-btn breathing">
        <image
          class="center-icon"
          src="/static/icons/tabbar/add.svg"
          mode="aspectFit"
        />
      </view>
      <text class="center-btn-text">记录</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabBar',
  props: {
    currentTab: {
      type: String,
      default: 'timeline'
    }
  },
  methods: {
    switchTab(tab) {
      if (tab === this.currentTab) return

      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'light' })
      // #endif

      this.$emit('change', tab)

      const routes = {
        timeline: '/pages/timeline/timeline',
        gallery: '/pages/gallery/gallery',
        mailbox: '/pages/mailbox/mailbox',
        profile: '/pages/profile/profile'
      }

      uni.redirectTo({
        url: routes[tab],
        fail: () => {
          uni.switchTab({ url: routes[tab] })
        }
      })
    },
    openRecord() {
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'medium' })
      // #endif

      this.$emit('openRecord')
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-bar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-bar-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 241, 237, 0.9);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(196, 184, 168, 0.2);
}

.tab-bar-content {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 110rpx;
  padding: 0 24rpx;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 8rpx 16rpx;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  min-width: 80rpx;
}

.tab-icon-wrapper {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}

.ink-spread {
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(224, 122, 95, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    animation: inkSpread 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
  }
}

@keyframes inkSpread {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
  }
  100% {
    width: 70rpx;
    height: 70rpx;
    opacity: 1;
  }
}

.tab-icon {
  width: 40rpx;
  height: 40rpx;
  position: relative;
  z-index: 1;
}

.icon-img {
  width: 100%;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.tab-text {
  font-size: 20rpx;
  color: #C4B8A8;
  margin-top: 4rpx;
  transition: color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  white-space: nowrap;
}

.text-active {
  color: #E07A5F;
}

.center-btn-placeholder {
  width: 100rpx;
  flex-shrink: 0;
}

.center-btn-wrapper {
  position: absolute;
  left: 50%;
  top: -30rpx;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.center-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #E07A5F 0%, #D4654A 100%);
  box-shadow: 0 8rpx 24rpx rgba(224, 122, 95, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);

  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(224, 122, 95, 0.2);
  }
}

.breathing {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 8rpx 24rpx rgba(224, 122, 95, 0.3);
  }
  50% {
    opacity: 0.85;
    box-shadow: 0 6rpx 20rpx rgba(224, 122, 95, 0.25);
  }
}

.center-icon {
  width: 44rpx;
  height: 44rpx;
}

.center-btn-text {
  font-size: 20rpx;
  color: #E07A5F;
  margin-top: 6rpx;
}
</style>
