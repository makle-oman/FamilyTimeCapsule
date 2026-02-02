/**
 * 主题配置文件
 * 定义应用支持的所有主题
 */

export const THEMES = {
  // 默认主题 - 暖阳
  default: {
    id: 'default',
    name: '暖阳',
    icon: '☀️',
    description: '温暖的橙色调，家的感觉',
    colors: {
      // 主色调
      primary: '#E07A5F',
      primaryDark: '#C96B52',
      primaryLight: 'rgba(224, 122, 95, 0.1)',
      // 辅助色
      secondary: '#8A9A5B',
      secondaryLight: 'rgba(138, 154, 91, 0.1)',
      // 背景色
      background: '#FFFCF8',
      backgroundSecondary: '#FAF7F2',
      // 文字色
      text: '#5C4F42',
      textSecondary: '#9E8F7D',
      textLight: '#C4B8A8',
      // 边框色
      border: '#E8E4DF',
      borderLight: '#F0EBE5',
      // 遮罩
      overlay: 'rgba(92, 79, 66, 0.5)',
      overlayLight: 'rgba(230, 222, 212, 0.6)',
    }
  },

  // 海洋主题
  ocean: {
    id: 'ocean',
    name: '海洋',
    icon: '🌊',
    description: '清新的蓝色调，宁静深邃',
    colors: {
      primary: '#4A90D9',
      primaryDark: '#3A7BC8',
      primaryLight: 'rgba(74, 144, 217, 0.1)',
      secondary: '#6BBFB5',
      secondaryLight: 'rgba(107, 191, 181, 0.1)',
      background: '#F5F9FC',
      backgroundSecondary: '#EDF4F8',
      text: '#2C3E50',
      textSecondary: '#7B8FA3',
      textLight: '#A8B8C8',
      border: '#D4E2ED',
      borderLight: '#E8F0F5',
      overlay: 'rgba(44, 62, 80, 0.5)',
      overlayLight: 'rgba(212, 226, 237, 0.6)',
    }
  },

  // 森林主题
  forest: {
    id: 'forest',
    name: '森林',
    icon: '🌲',
    description: '自然的绿色调，生机盎然',
    colors: {
      primary: '#5D8A66',
      primaryDark: '#4A7553',
      primaryLight: 'rgba(93, 138, 102, 0.1)',
      secondary: '#A67C52',
      secondaryLight: 'rgba(166, 124, 82, 0.1)',
      background: '#F8FAF5',
      backgroundSecondary: '#EFF5EC',
      text: '#3D4A3E',
      textSecondary: '#7A8A7C',
      textLight: '#A8B5A9',
      border: '#D8E4D9',
      borderLight: '#E8F0E9',
      overlay: 'rgba(61, 74, 62, 0.5)',
      overlayLight: 'rgba(216, 228, 217, 0.6)',
    }
  },

  // 樱花主题
  sakura: {
    id: 'sakura',
    name: '樱花',
    icon: '🌸',
    description: '浪漫的粉色调，甜蜜温馨',
    colors: {
      primary: '#E8A0BF',
      primaryDark: '#D88AAD',
      primaryLight: 'rgba(232, 160, 191, 0.1)',
      secondary: '#B4A7D6',
      secondaryLight: 'rgba(180, 167, 214, 0.1)',
      background: '#FDF8FA',
      backgroundSecondary: '#F9F0F4',
      text: '#5C4A52',
      textSecondary: '#9E8A92',
      textLight: '#C8B8C0',
      border: '#F0E0E8',
      borderLight: '#F5EBF0',
      overlay: 'rgba(92, 74, 82, 0.5)',
      overlayLight: 'rgba(240, 224, 232, 0.6)',
    }
  },

  // 夜间主题
  night: {
    id: 'night',
    name: '夜间',
    icon: '🌙',
    description: '深色护眼模式，适合夜间使用',
    colors: {
      primary: '#B794F4',
      primaryDark: '#9F7AEA',
      primaryLight: 'rgba(183, 148, 244, 0.15)',
      secondary: '#68D391',
      secondaryLight: 'rgba(104, 211, 145, 0.15)',
      background: '#1A1A2E',
      backgroundSecondary: '#252542',
      text: '#E2E8F0',
      textSecondary: '#A0AEC0',
      textLight: '#718096',
      border: '#3D3D5C',
      borderLight: '#4A4A6A',
      overlay: 'rgba(0, 0, 0, 0.6)',
      overlayLight: 'rgba(26, 26, 46, 0.8)',
    }
  }
}

// 主题列表（用于选择器显示）
export const THEME_LIST = Object.values(THEMES)

// 获取主题配置
export function getTheme(themeId) {
  return THEMES[themeId] || THEMES.default
}

// 生成 CSS 变量字符串
export function generateCssVariables(theme) {
  const colors = theme.colors
  return `
    --color-primary: ${colors.primary};
    --color-primary-dark: ${colors.primaryDark};
    --color-primary-light: ${colors.primaryLight};
    --color-secondary: ${colors.secondary};
    --color-secondary-light: ${colors.secondaryLight};
    --color-background: ${colors.background};
    --color-background-secondary: ${colors.backgroundSecondary};
    --color-text: ${colors.text};
    --color-text-secondary: ${colors.textSecondary};
    --color-text-light: ${colors.textLight};
    --color-border: ${colors.border};
    --color-border-light: ${colors.borderLight};
    --color-overlay: ${colors.overlay};
    --color-overlay-light: ${colors.overlayLight};
  `
}

// 应用主题
export function applyTheme(themeId) {
  const theme = getTheme(themeId)
  const cssVars = generateCssVariables(theme)

  // 保存到本地存储
  uni.setStorageSync('currentTheme', themeId)

  return { theme, cssVars }
}

// 获取当前主题ID
export function getCurrentThemeId() {
  return uni.getStorageSync('currentTheme') || 'default'
}
