<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    // 初始化应用数据
    this.initAppData()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    initAppData() {
      // 检查是否有本地存储的家庭数据
      const familyData = uni.getStorageSync('familyData')
      if (!familyData) {
        // 初始化默认家庭数据
        const defaultData = {
          familyName: '温馨小窝',
          members: [],
          memories: [],
          letters: [],
          createdAt: Date.now()
        }
        uni.setStorageSync('familyData', defaultData)
      }
    }
  },
  globalData: {
    // 全局配色
    colors: {
      primary: '#FAF7F2',      // 米白主背景
      cardBg: '#FFFCF8',       // 暖白卡片底色
      milkCoffee: '#C4B8A8',   // 奶咖色
      warmGray: '#9E8F7D',     // 暖灰
      sunsetOrange: '#E07A5F', // 落日橙
      deepOrange: '#D4654A',   // 深橙
      mossGreen: '#8A9A5B',    // 苔藓绿
      darkBrown: '#5C4F42',    // 深褐
      warmWhite: '#F5F1ED',    // 暖灰背景
      lineColor: '#E8E4DF',    // 边框色
      paperBg: '#FAF7F2'       // 信纸背景
    },
    // 音效开关
    soundEnabled: true,
    // 当前用户
    currentUser: null
  }
}
</script>

<style>
/* 全局样式重置 */
page {
  background-color: #FAF7F2;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #5C4F42;
  font-size: 16px;
  line-height: 1.6;
}

/* 禁用纯黑纯白 */
.text-dark {
  color: #5C4F42 !important;
}

.text-light {
  color: #FAF7F2 !important;
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
  background-color: #FAF7F2;
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
