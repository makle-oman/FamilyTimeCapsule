<template>
  <view class="memory-card-wrapper" :class="{ 'has-parallel': hasParallelViews }">
    <!-- 多视角卡片堆叠 -->
    <view v-if="hasParallelViews" class="card-stack" @tap="flipToNext">
      <!-- 底层堆叠的纸张 -->
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

      <!-- 当前显示的卡片 -->
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
                :src="currentView.avatar || '/static/images/default-avatar.png'"
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
              :src="memory.authorAvatar || '/static/images/default-avatar.png'"
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatRelativeTime } from '@/utils/index.js'

const props = defineProps({
  memory: {
    type: Object,
    required: true
  },
  isOldMemory: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['resonance', 'playVoice'])

const isVisible = ref(false)
const isResonating = ref(false)
const isPlaying = ref(false)
const showCandleEffect = ref(false)
const currentViewIndex = ref(0)
const isFlipping = ref(false)
const viewColors = ['#8A9A5B', '#E07A5F', '#C4B8A8', '#9E8F7D']

const hasParallelViews = computed(() => {
  return props.memory.parallelViews && props.memory.parallelViews.length > 0
})

const allViews = computed(() => {
  if (!hasParallelViews.value) return []

  const mainView = {
    authorId: props.memory.authorId,
    authorName: props.memory.authorName,
    avatar: props.memory.authorAvatar,
    online: props.memory.authorOnline,
    content: props.memory.content,
    images: props.memory.images,
    tags: props.memory.tags,
    voice: props.memory.voice,
    resonanceCount: props.memory.resonanceCount
  }

  const parallelViews = props.memory.parallelViews.map((view) => ({
    authorId: view.authorId,
    authorName: view.authorName,
    avatar: view.avatar || '',
    online: view.online || false,
    content: view.content || `这是${view.authorName}的视角记录...`,
    images: view.images || [],
    tags: view.tags || props.memory.tags,
    voice: view.voice || null,
    resonanceCount: view.resonanceCount || 0
  }))

  return [mainView, ...parallelViews]
})

const currentView = computed(() => {
  return allViews.value[currentViewIndex.value] || {}
})

const totalResonanceCount = computed(() => {
  if (!hasParallelViews.value) return props.memory.resonanceCount
  return allViews.value.reduce((sum, view) => sum + (view.resonanceCount || 0), 0)
})

const cardType = computed(() => {
  return hasParallelViews.value ? 'parallel' : 'single'
})

const formattedTime = computed(() => {
  return formatRelativeTime(props.memory.createTime)
})

const displayImages = computed(() => {
  return props.memory.images ? props.memory.images.slice(0, 4) : []
})

const imageLayoutClass = computed(() => {
  return getImageLayoutClass(props.memory.images)
})

const hasQuestion = computed(() => {
  return props.memory.question && !props.memory.questionAnswered
})

onMounted(() => {
  setTimeout(() => { isVisible.value = true }, 100)

  if (props.isOldMemory) {
    showCandleEffect.value = true
    setTimeout(() => { showCandleEffect.value = false }, 3000)
  }
})

const getImageLayoutClass = (images) => {
  const count = images ? images.length : 0
  if (count === 1) return 'layout-single'
  if (count === 2) return 'layout-double'
  if (count === 3) return 'layout-triple'
  return 'layout-grid'
}

const flipToNext = () => {
  if (isFlipping.value) return
  if (currentViewIndex.value >= allViews.value.length - 1) {
    isFlipping.value = true
    // #ifdef MP-WEIXIN
    uni.vibrateShort({ type: 'light' })
    // #endif

    setTimeout(() => {
      currentViewIndex.value = 0
      isFlipping.value = false
    }, 600)
    return
  }

  isFlipping.value = true
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif

  setTimeout(() => {
    currentViewIndex.value++
    isFlipping.value = false
  }, 600)
}

const handleResonance = () => {
  isResonating.value = true
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'medium' })
  // #endif

  emit('resonance', props.memory.id)

  setTimeout(() => { isResonating.value = false }, 1500)
}

const previewImage = (images, index) => {
  uni.previewImage({ current: index, urls: images })
}

const playVoice = (voice) => {
  if (isPlaying.value) {
    isPlaying.value = false
    return
  }
  isPlaying.value = true
  emit('playVoice', voice)
  setTimeout(() => { isPlaying.value = false }, voice.duration * 1000)
}
</script>

<style lang="scss" scoped>
@use './memory-card.scss';
</style>
