<template>
  <view class="tab-bar-wrapper" :style="themeStyle">
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
              :src="currentTab === 'timeline' ? '/static/icons/tabbar/timeline-active.png' : '/static/icons/tabbar/timeline.png'"
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
              :src="currentTab === 'gallery' ? '/static/icons/tabbar/gallery-active.png' : '/static/icons/tabbar/gallery.png'"
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
              :src="currentTab === 'mailbox' ? '/static/icons/tabbar/mailbox-active.png' : '/static/icons/tabbar/mailbox.png'"
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
              :src="currentTab === 'profile' ? '/static/icons/tabbar/profile-active.png' : '/static/icons/tabbar/profile.png'"
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
          src="/static/icons/tabbar/add.png"
          mode="aspectFit"
        />
      </view>
      <text class="center-btn-text">记录</text>
    </view>
  </view>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme.js'

const props = defineProps({
  currentTab: {
    type: String,
    default: 'timeline'
  }
})

const emit = defineEmits(['change', 'openRecord'])
const { themeStyle } = useTheme()

const switchTab = (tab) => {
  if (tab === props.currentTab) return

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif

  emit('change', tab)

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
}

const openRecord = () => {
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'medium' })
  // #endif

  emit('openRecord')
}
</script>

<style lang="scss" scoped>
@use './tab-bar.scss';
</style>
