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
        <image :src="letter.senderAvatar || '/static/images/default-avatar.png'" mode="aspectFill" />
      </view>
      <text class="sender-name">来自 {{ letter.senderName }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatDate } from '@/utils/index.js'

const props = defineProps({
  letter: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['open'])

const showFlame = ref(false)
const isBurning = ref(false)

const canOpen = computed(() => {
  if (typeof props.letter.canOpen === 'boolean') {
    return props.letter.canOpen
  }
  return props.letter.unlockTime <= Date.now()
})

const daysLeft = computed(() => {
  if (typeof props.letter.daysUntilUnlock === 'number') {
    return props.letter.daysUntilUnlock
  }
  const diff = props.letter.unlockTime - Date.now()
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)))
})

const formattedDate = computed(() => {
  return formatDate(props.letter.createTime, 'YYYY年MM月DD日')
})

onMounted(() => {
  if (daysLeft.value <= 7 && daysLeft.value > 0) {
    showFlame.value = true
  }
})

const handleTap = () => {
  if (!canOpen.value) {
    uni.showToast({
      title: `还有 ${daysLeft.value} 天才能打开`,
      icon: 'none'
    })
    return
  }

  isBurning.value = true

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'heavy' })
  // #endif

  setTimeout(() => {
    emit('open', props.letter)
  }, 800)
}
</script>

<style lang="scss" scoped>
@use './envelope.scss';
</style>
