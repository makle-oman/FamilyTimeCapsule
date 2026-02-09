import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getTheme, getCurrentThemeId } from '@/utils/themes.js'

/**
 * 主题 composable - 为所有页面提供主题支持
 */
export function useTheme() {
  const currentTheme = ref(getCurrentThemeId())

  // 主题样式对象 - 绑定到页面根元素
  const themeStyle = computed(() => {
    const theme = getTheme(currentTheme.value)
    const c = theme.colors
    return {
      '--color-primary': c.primary,
      '--color-primary-dark': c.primaryDark,
      '--color-primary-light': c.primaryLight,
      '--color-secondary': c.secondary,
      '--color-secondary-light': c.secondaryLight,
      '--color-background': c.background,
      '--color-background-secondary': c.backgroundSecondary,
      '--color-text': c.text,
      '--color-text-secondary': c.textSecondary,
      '--color-text-light': c.textLight,
      '--color-border': c.border,
      '--color-border-light': c.borderLight,
      '--color-overlay': c.overlay,
      '--color-overlay-light': c.overlayLight
    }
  })

  // 在页面显示时检查主题是否改变（支持跨页面同步）
  onShow(() => {
    const themeId = getCurrentThemeId()
    if (themeId !== currentTheme.value) {
      currentTheme.value = themeId
    }
  })

  return {
    currentTheme,
    themeStyle
  }
}
