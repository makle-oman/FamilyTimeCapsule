<template>
  <svg :viewBox="viewBox" :width="size" :height="size" xmlns="http://www.w3.org/2000/svg">
    <g :fill="currentColor">
      <!-- 时光轴 icon -->
      <template v-if="icon === 'timeline'">
        <path d="M4 4h2v16H4V4zm5 2h2v14H9V6zm5 4h2v10h-2v-10zm5 3h2v7h-2v-7z" />
      </template>

      <!-- 相册馆 icon -->
      <template v-else-if="icon === 'gallery'">
        <path d="M2 4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V4zm2 0h12v12H4V4zm3.5 6c.83 0 1.5-.67 1.5-1.5S10.33 7 9.5 7 8 7.67 8 8.5 8.67 10 9.5 10zm6.5 2L12 7l-4 5.5L5 9l-3 4v-1h12v1z" />
      </template>

      <!-- 信箱 icon -->
      <template v-else-if="icon === 'mailbox'">
        <path d="M4 4h12c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v2l6 3.5L16 8V6H4zm12 8H4v2h12v-2z" />
      </template>

      <!-- 我们 icon (profile) -->
      <template v-else-if="icon === 'profile'">
        <path d="M9 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 5c2.33 0 7 1.17 7 3.5V17H2v-2.5c0-2.33 4.67-3.5 7-3.5zm0 2c-2.33 0-5.17.85-5.17 1.5V15h10.34v-1.5c0-.65-2.84-1.5-5.17-1.5z" />
      </template>

      <!-- 记录 icon (add) -->
      <template v-else-if="icon === 'add'">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
      </template>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { getTheme, getCurrentThemeId } from '@/utils/themes.js'

defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: '24'
  },
  active: {
    type: Boolean,
    default: false
  }
})

const currentTheme = getCurrentThemeId()
const theme = getTheme(currentTheme)

const currentColor = computed(() => {
  return active ? theme.colors.primary : theme.colors.textLight
})

const viewBox = '0 0 18 18'
</script>

<style scoped>
svg {
  display: block;
}
</style>
