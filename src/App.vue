<script>
import { getCurrentThemeId, applyTheme } from '@/utils/themes.js'

export default {
  onLaunch: function() {
    console.log('App Launch')
    // 初始化应用数据
    this.initAppData()
    // 初始化字体设置
    this.initFontSettings()
    // 初始化主题
    this.initTheme()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    initAppData() {
      // 数据现在由后端管理，这里不再初始化本地假数据
    },
    initFontSettings() {
      // 读取存储的字体设置
      const savedFont = uni.getStorageSync('fontFamily')
      if (savedFont && savedFont !== 'system') {
        this.globalData.currentFont = savedFont
      }
    },
    initTheme() {
      // 读取存储的主题设置
      const themeId = getCurrentThemeId()
      const { theme, cssVars } = applyTheme(themeId)
      this.globalData.currentTheme = themeId
      this.globalData.themeCssVars = cssVars
    },
    // 全局方法：设置字体
    setGlobalFont(fontValue) {
      this.globalData.currentFont = fontValue
      uni.setStorageSync('fontFamily', fontValue)
    },
    // 全局方法：设置主题
    setGlobalTheme(themeId) {
      const { theme, cssVars } = applyTheme(themeId)
      this.globalData.currentTheme = themeId
      this.globalData.themeCssVars = cssVars
      return { theme, cssVars }
    }
  },
  globalData: {
    // 当前主题
    currentTheme: 'default',
    themeCssVars: '',
    // 当前字体
    currentFont: 'system',
    // 音效开关
    soundEnabled: true,
    // 当前用户
    currentUser: null
  }
}
</script>

<style>
/* 全局主题变量 */
page {
  /* 主色调 */
  --color-primary: #E07A5F;
  --color-primary-dark: #C96B52;
  --color-primary-light: rgba(224, 122, 95, 0.1);
  /* 辅助色 */
  --color-secondary: #8A9A5B;
  --color-secondary-light: rgba(138, 154, 91, 0.1);
  /* 背景色 */
  --color-background: #FFFCF8;
  --color-background-secondary: #FAF7F2;
  /* 文字色 */
  --color-text: #5C4F42;
  --color-text-secondary: #9E8F7D;
  --color-text-light: #C4B8A8;
  /* 边框色 */
  --color-border: #E8E4DF;
  --color-border-light: #F0EBE5;
  /* 遮罩 */
  --color-overlay: rgba(92, 79, 66, 0.5);
  --color-overlay-light: rgba(230, 222, 212, 0.6);

  background-color: var(--color-background-secondary);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: var(--color-text);
  font-size: 16px;
  line-height: 1.6;
}

/* 主题过渡动画 */
.theme-transition,
.theme-transition view,
.theme-transition text,
.theme-transition image,
.theme-transition button,
.theme-transition input,
.theme-transition textarea {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 全局字体样式类 - 使用手机系统支持的字体 */
.font-system,
.font-system view,
.font-system text,
.font-system input,
.font-system textarea,
.font-system button {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
}

/* 圆润 - iOS/Android 都支持 PingFang SC */
.font-round,
.font-round view,
.font-round text,
.font-round input,
.font-round textarea,
.font-round button {
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif !important;
  font-weight: 300 !important;
  letter-spacing: 1rpx !important;
}

/* 手写楷书 - 使用系统楷体 */
.font-handwrite,
.font-handwrite view,
.font-handwrite text,
.font-handwrite input,
.font-handwrite textarea,
.font-handwrite button {
  font-family: 'Kaiti SC', 'STKaiti', 'KaiTi', 'FangSong', serif !important;
  font-style: italic !important;
}

/* 宋体 - iOS 的宋体 */
.font-songti,
.font-songti view,
.font-songti text,
.font-songti input,
.font-songti textarea,
.font-songti button {
  font-family: 'Songti SC', 'STSong', 'SimSun', 'Noto Serif SC', serif !important;
}

/* 黑体 - 使用系统黑体，加粗效果 */
.font-heiti,
.font-heiti view,
.font-heiti text,
.font-heiti input,
.font-heiti textarea,
.font-heiti button {
  font-family: 'Heiti SC', 'STHeiti', 'Microsoft YaHei', 'Noto Sans SC', sans-serif !important;
  font-weight: 500 !important;
}

/* 圆体 - 使用 PingFang 模拟圆润效果 */
.font-yuanti,
.font-yuanti view,
.font-yuanti text,
.font-yuanti input,
.font-yuanti textarea,
.font-yuanti button {
  font-family: 'PingFang SC', -apple-system, 'Noto Sans SC', sans-serif !important;
  font-weight: 400 !important;
  letter-spacing: 2rpx !important;
}

/* 行楷 - 使用楷体配合斜体模拟 */
.font-xingkai,
.font-xingkai view,
.font-xingkai text,
.font-xingkai input,
.font-xingkai textarea,
.font-xingkai button {
  font-family: 'Kaiti SC', 'STKaiti', 'KaiTi', serif !important;
  font-style: italic !important;
  letter-spacing: 1rpx !important;
}

/* 纤细优雅 - 细体效果 */
.font-light,
.font-light view,
.font-light text,
.font-light input,
.font-light textarea,
.font-light button {
  font-family: 'PingFang SC', -apple-system, sans-serif !important;
  font-weight: 200 !important;
  letter-spacing: 1rpx !important;
}

/* 醒目粗体 - 加粗效果 */
.font-bold,
.font-bold view,
.font-bold text,
.font-bold input,
.font-bold textarea,
.font-bold button {
  font-family: 'PingFang SC', -apple-system, sans-serif !important;
  font-weight: 600 !important;
}

/* 宽松舒适 - 大字间距 */
.font-wide,
.font-wide view,
.font-wide text,
.font-wide input,
.font-wide textarea,
.font-wide button {
  font-family: 'PingFang SC', -apple-system, sans-serif !important;
  letter-spacing: 4rpx !important;
  word-spacing: 8rpx !important;
}

/* 禁用纯黑纯白 */
.text-dark {
  color: var(--color-text) !important;
}

.text-light {
  color: var(--color-background) !important;
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}

/* 通用过渡动效 */
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
}

/* 页面容器 */
.page-container {
  min-height: 100vh;
  background-color: var(--color-background-secondary);
  padding-bottom: 180rpx;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}
</style>
