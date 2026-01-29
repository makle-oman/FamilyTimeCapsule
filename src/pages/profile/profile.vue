<template>
  <view class="page-wrapper profile-page" :class="fontClass">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <scroll-view scroll-y class="profile-scroll">
      <!-- 家庭封面图 -->
      <view class="family-cover">
        <image
          v-if="familyInfo.coverImage"
          :src="familyInfo.coverImage"
          mode="aspectFill"
          class="cover-image"
        />
        <view v-else class="cover-placeholder">
          <view class="cover-gradient"></view>
        </view>

        <view class="cover-overlay">
          <text class="family-name" @tap.stop="openEditFamilyName">{{ familyInfo.name }}</text>
          <text class="family-slogan">{{ familyInfo.slogan || '记录每一个温柔的瞬间' }}</text>
        </view>

        <view class="edit-cover-btn" :style="{ top: (menuButtonTop + menuButtonHeight + 16) + 'px' }" @tap.stop="changeCover">
          <text class="edit-icon">✎</text>
        </view>
      </view>

      <!-- 成员头像墙 -->
      <view class="members-section">
        <view class="section-header">
          <text class="section-title">家庭成员</text>
          <view class="add-member-btn" @tap="inviteMember">
            <text>+ 邀请</text>
          </view>
        </view>

        <scroll-view scroll-x class="members-scroll">
          <view
            v-for="member in familyMembers"
            :key="member.id"
            class="member-item"
            @tap="viewMember(member)"
          >
            <view class="member-avatar-wrapper" :class="{ online: member.online }">
              <image
                :src="member.avatar || '/static/images/default-avatar.svg'"
                mode="aspectFill"
                class="member-avatar"
              />
              <view v-if="member.online" class="online-indicator"></view>
            </view>
            <text class="member-name">{{ member.name }}</text>
            <text class="member-role">{{ member.role }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 家庭数据展示 -->
      <view class="stats-section">
        <view class="section-header">
          <text class="section-title">我们的故事</text>
        </view>

        <view class="stats-cards">
          <!-- 记录数量 - 信纸堆积效果 -->
          <view class="stat-card paper-stack">
            <view class="paper-layers">
              <view class="paper-layer layer-1"></view>
              <view class="paper-layer layer-2"></view>
              <view class="paper-layer layer-3">
                <view class="paper-preview">
                  <view class="preview-line"></view>
                  <view class="preview-line short"></view>
                </view>
              </view>
            </view>
            <view class="stat-info">
              <text class="stat-label">已记录</text>
              <text class="stat-value">{{ stats.memoriesCount }}</text>
              <text class="stat-unit">个瞬间</text>
            </view>
          </view>

          <!-- 平行时刻 - 双头像插画 -->
          <view class="stat-card parallel-moments">
            <view class="parallel-illustration">
              <view class="illust-avatar left">
                <image :src="familyMembers[0]?.avatar || '/static/images/default-avatar.svg'" />
              </view>
              <view class="illust-heart">💕</view>
              <view class="illust-avatar right">
                <image :src="familyMembers[1]?.avatar || '/static/images/default-avatar.svg'" />
              </view>
            </view>
            <view class="stat-info">
              <text class="stat-label">平行时刻</text>
              <text class="stat-value">{{ stats.parallelCount }}</text>
              <text class="stat-unit">次同频</text>
            </view>
          </view>

          <!-- 共鸣次数 -->
          <view class="stat-card resonance-stat">
            <view class="resonance-illustration">
              <view class="resonance-wave"></view>
              <view class="resonance-wave delay-1"></view>
              <view class="resonance-wave delay-2"></view>
              <view class="resonance-heart">💕</view>
            </view>
            <view class="stat-info">
              <text class="stat-label">收获共鸣</text>
              <text class="stat-value">{{ stats.resonanceCount }}</text>
              <text class="stat-unit">次心动</text>
            </view>
          </view>

          <!-- 慢递信件 -->
          <view class="stat-card letters-stat">
            <view class="letters-illustration">
              <view class="letter-icon">✉</view>
              <view class="letter-sparkle">✨</view>
            </view>
            <view class="stat-info">
              <text class="stat-label">时光慢递</text>
              <text class="stat-value">{{ stats.lettersCount }}</text>
              <text class="stat-unit">封信件</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 实体书生成入口 -->
      <view class="book-section">
        <view class="section-header">
          <text class="section-title">制作纪念册</text>
        </view>

        <view class="book-preview" @tap="generateBook">
          <view class="book-3d">
            <view class="book-cover">
              <view class="book-spine"></view>
              <view class="book-front">
                <text class="book-title">{{ familyInfo.name }}</text>
                <text class="book-year">{{ currentYear }}</text>
                <view class="book-decoration">
                  <view class="decor-line"></view>
                  <text class="decor-text">家庭纪念册</text>
                  <view class="decor-line"></view>
                </view>
              </view>
            </view>
          </view>
          <view class="book-info">
            <text class="book-hint">将回忆印成实体书</text>
            <text class="book-desc">精选 {{ stats.memoriesCount }} 个瞬间，制作专属纪念册</text>
          </view>
        </view>
      </view>

      <!-- 功能列表 -->
      <view class="feature-list">
        <view class="feature-item" @tap="openSettings('font')">
          <view class="feature-icon font-icon">
            <text>文</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">字体设置</text>
            <text class="feature-desc">上传手写体，让记录更有温度</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon sound-icon">
            <text>♪</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">音效设置</text>
            <text class="feature-desc">{{ soundEnabled ? '已开启' : '已关闭' }}翻页、风铃等音效</text>
          </view>
          <view class="sound-switch" :class="{ on: soundEnabled }" @tap.stop="toggleSound">
            <view class="switch-track">
              <view class="switch-icon off-icon">🔇</view>
              <view class="switch-icon on-icon">🔔</view>
            </view>
            <view class="switch-thumb"></view>
          </view>
        </view>

        <view class="feature-item" @tap="openSettings('privacy')">
          <view class="feature-icon privacy-icon">
            <text>🔒</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">隐私设置</text>
            <text class="feature-desc">管理数据存储与分享权限</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item" @tap="openSettings('about')">
          <view class="feature-icon about-icon">
            <text>♡</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">关于我们</text>
            <text class="feature-desc">家的时光 v1.0.0</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item logout-item" @tap="handleLogout">
          <view class="feature-icon logout-icon">
            <text>↪</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">退出登录</text>
            <text class="feature-desc">切换账号或退出当前登录</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>
      </view>

      <!-- 底部签名 -->
      <view class="footer-signature">
        <text class="signature-text">用心记录，温柔以待</text>
        <text class="signature-date">始于 {{ familyInfo.createdDate || '2024年' }}</text>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部导航 -->
    <tab-bar current-tab="profile" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <record-modal :visible="showRecordModal" @close="closeRecord" @submit="submitRecord" />

    <!-- 字体设置弹窗 -->
    <view v-if="showFontSettings" class="settings-popup" @tap.stop="closeFontSettings">
      <view class="settings-content" @tap.stop>
        <view class="settings-header">
          <text class="settings-title">字体设置</text>
          <view class="settings-close" @tap="closeFontSettings">×</view>
        </view>

        <view class="settings-body">
          <view class="font-preview">
            <text class="preview-text" :style="{ fontFamily: currentFont }">
              家是最温暖的港湾
            </text>
          </view>

          <view class="font-options">
            <view
              v-for="font in fontList"
              :key="font.id"
              class="font-option"
              :class="{ selected: fontClass === font.class }"
              @tap="selectFont(font)"
            >
              <text class="font-name" :class="font.class">{{ font.name }}</text>
              <view v-if="fontClass === font.class" class="font-check">✓</view>
            </view>
          </view>

          <view class="upload-handwrite" @tap="uploadHandwrite">
            <view class="upload-icon">+</view>
            <view class="upload-text">
              <text class="upload-title">上传我的手写体</text>
              <text class="upload-desc">拍照上传手写样本，AI 生成专属字体</text>
            </view>
          </view>

          <view class="privacy-notice">
            <text class="notice-icon">🔒</text>
            <text class="notice-text">仅本地渲染，不上传云端，保护您的隐私</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 家庭名称弹窗 -->
    <family-name-modal
      :visible="showFamilyNameModal"
      mode="edit"
      :initial-name="familyInfo.name"
      @close="closeFamilyNameModal"
      @submit="saveFamilyName"
    />
  </view>
</template>

<script>
import TabBar from '@/components/tab-bar/tab-bar.vue'
import RecordModal from '@/components/record-modal/record-modal.vue'
import FamilyNameModal from '@/components/family-name-modal/family-name-modal.vue'

export default {
  components: {
    TabBar,
    RecordModal,
    FamilyNameModal
  },
  data() {
    return {
      statusBarHeight: 20,
      menuButtonTop: 0,
      menuButtonHeight: 32,
      showRecordModal: false,
      showFontSettings: false,
      showFamilyNameModal: false,
      soundEnabled: true,
      currentFont: 'system',
      fontClass: 'font-system',
      familyInfo: {
        name: '温馨小窝',
        slogan: '记录每一个温柔的瞬间',
        coverImage: '',
        createdDate: '2024年1月'
      },
      familyMembers: [
        { id: '1', name: '爸爸', role: '家庭支柱', avatar: '', online: true },
        { id: '2', name: '妈妈', role: '温暖港湾', avatar: '', online: true },
        { id: '3', name: '我', role: '快乐源泉', avatar: '', online: true }
      ],
      stats: {
        memoriesCount: 127,
        parallelCount: 43,
        resonanceCount: 256,
        lettersCount: 12
      },
      fontList: [
        { id: 'system', name: '系统默认', value: 'system', class: 'font-system' },
        { id: 'round', name: '圆润可爱', value: '"PingFang SC", sans-serif', class: 'font-round' },
        { id: 'handwrite', name: '手写楷书', value: '"Kaiti SC", serif', class: 'font-handwrite' },
        { id: 'songti', name: '宋体经典', value: '"Songti SC", serif', class: 'font-songti' },
        { id: 'heiti', name: '黑体稳重', value: '"Heiti SC", sans-serif', class: 'font-heiti' },
        { id: 'light', name: '纤细优雅', value: '"PingFang SC", sans-serif', class: 'font-light' },
        { id: 'bold', name: '醒目粗体', value: '"PingFang SC", sans-serif', class: 'font-bold' },
        { id: 'wide', name: '宽松舒适', value: '"PingFang SC", sans-serif', class: 'font-wide' }
      ]
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 20

    // 获取胶囊按钮位置信息
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    this.menuButtonTop = menuButtonInfo.top
    this.menuButtonHeight = menuButtonInfo.height
    // #endif

    // 加载音效设置
    this.soundEnabled = uni.getStorageSync('soundEnabled') !== false

    // 加载字体设置
    this.loadFontSettings()

    // 加载家庭信息
    this.loadFamilyInfo()
  },
  onShow() {
    // 每次显示页面时刷新字体设置
    this.loadFontSettings()
    // 刷新家庭信息
    this.loadFamilyInfo()
  },
  methods: {
    loadFamilyInfo() {
      const familyData = uni.getStorageSync('familyData')
      if (familyData && familyData.familyName) {
        this.familyInfo.name = familyData.familyName
      }
    },
    openEditFamilyName() {
      this.showFamilyNameModal = true
    },
    closeFamilyNameModal() {
      this.showFamilyNameModal = false
    },
    saveFamilyName(name) {
      this.familyInfo.name = name
      const familyData = uni.getStorageSync('familyData') || {}
      familyData.familyName = name
      uni.setStorageSync('familyData', familyData)

      this.showFamilyNameModal = false
      uni.showToast({
        title: '已保存',
        icon: 'success'
      })
    },
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出当前账号吗？',
        confirmColor: '#5C4F42',
        success: (res) => {
          if (res.confirm) {
            // 清除登录信息
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')

            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            })

            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/login/login'
              })
            }, 1500)
          }
        }
      })
    },
    loadFontSettings() {
      const savedFontClass = uni.getStorageSync('fontClass') || 'font-system'
      this.fontClass = savedFontClass
      const font = this.fontList.find(f => f.class === savedFontClass)
      if (font) {
        this.currentFont = font.value
      }
    },
    applyGlobalFont(fontClass) {
      // 存储 fontClass 供其他页面使用
      uni.setStorageSync('fontClass', fontClass)
      // 设置全局字体
      const app = getApp()
      if (app && app.globalData) {
        app.globalData.currentFont = this.currentFont
        app.globalData.fontClass = fontClass
      }
    },
    changeCover() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.familyInfo.coverImage = res.tempFilePaths[0]
        }
      })
    },
    inviteMember() {
      uni.showToast({
        title: '邀请功能开发中',
        icon: 'none'
      })
    },
    viewMember(member) {
      uni.showToast({
        title: `查看 ${member.name} 的资料`,
        icon: 'none'
      })
    },
    generateBook() {
      uni.showToast({
        title: '纪念册功能开发中',
        icon: 'none'
      })
    },
    openSettings(type) {
      if (type === 'font') {
        this.showFontSettings = true
      } else {
        uni.showToast({
          title: `${type} 设置开发中`,
          icon: 'none'
        })
      }
    },
    closeFontSettings() {
      this.showFontSettings = false
    },
    selectFont(font) {
      this.currentFont = font.value
      this.fontClass = font.class
      uni.setStorageSync('fontFamily', font.value)
      uni.setStorageSync('fontClass', font.class)
      this.applyGlobalFont(font.class)

      // 提示用户
      uni.showToast({
        title: '字体已更换',
        icon: 'success'
      })
    },
    uploadHandwrite() {
      uni.showToast({
        title: '手写体上传功能开发中',
        icon: 'none'
      })
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      uni.setStorageSync('soundEnabled', this.soundEnabled)

      // 开启时播放提示音效
      if (this.soundEnabled) {
        this.playSound('switch')
        // 震动反馈
        // #ifdef MP-WEIXIN
        uni.vibrateShort({ type: 'light' })
        // #endif
      }

      // 显示提示
      uni.showToast({
        title: this.soundEnabled ? '音效已开启' : '音效已关闭',
        icon: 'none',
        duration: 1500
      })
    },
    // 播放音效
    playSound(type) {
      if (!this.soundEnabled && type !== 'switch') return

      const soundMap = {
        switch: '/static/audio/switch.mp3',
        page: '/static/audio/page-flip.mp3',
        bell: '/static/audio/wind-bell.mp3'
      }

      const audioContext = uni.createInnerAudioContext()
      audioContext.src = soundMap[type] || soundMap.switch
      audioContext.volume = 0.5
      audioContext.play()

      // 播放完成后销毁
      audioContext.onEnded(() => {
        audioContext.destroy()
      })
      audioContext.onError(() => {
        audioContext.destroy()
      })
    },
    openRecord() {
      this.showRecordModal = true
    },
    closeRecord() {
      this.showRecordModal = false
    },
    submitRecord(data) {
      console.log('提交记录', data)
      this.stats.memoriesCount++
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  background-color: #FAF7F2;
  min-height: 100vh;
}

.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.profile-scroll {
  height: 100vh;
}

// 家庭封面
.family-cover {
  position: relative;
  height: 400rpx;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #E07A5F 0%, #8A9A5B 50%, #C4B8A8 100%);
  opacity: 0.8;
}

.cover-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 48rpx 32rpx;
  background: linear-gradient(180deg, transparent 0%, rgba(92, 79, 66, 0.6) 100%);
}

.family-name {
  display: block;
  font-size: 44rpx;
  color: #FFFCF8;
  font-weight: 500;
  text-shadow: 0 2rpx 8rpx rgba(92, 79, 66, 0.3);
}

.family-slogan {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 252, 248, 0.9);
  margin-top: 8rpx;
}

.edit-cover-btn {
  position: absolute;
  top: 100rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  background-color: rgba(255, 252, 248, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(92, 79, 66, 0.2);
}

.edit-icon {
  font-size: 28rpx;
  color: #5C4F42;
}

// 成员区域
.members-section {
  padding: 32rpx;
  background-color: #FFFCF8;
  margin-top: -32rpx;
  border-radius: 32rpx 32rpx 0 0;
  position: relative;
  z-index: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  color: #5C4F42;
  font-weight: 500;
}

.add-member-btn {
  padding: 8rpx 20rpx;
  background-color: rgba(224, 122, 95, 0.1);
  border-radius: 24rpx;

  text {
    font-size: 24rpx;
    color: #E07A5F;
  }
}

.members-scroll {
  white-space: nowrap;
}

.member-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 32rpx;
}

.member-avatar-wrapper {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 48% 52% 53% 47% / 52% 46% 54% 48%;
  border: 4rpx solid #C4B8A8;
  overflow: hidden;

  &.online {
    border-color: #8A9A5B;
    animation: onlineBreath 2s ease-in-out infinite;
  }
}

@keyframes onlineBreath {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(138, 154, 91, 0.3);
  }
  50% {
    box-shadow: 0 0 16rpx 4rpx rgba(138, 154, 91, 0.2);
  }
}

.member-avatar {
  width: 100%;
  height: 100%;
}

.online-indicator {
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 20rpx;
  height: 20rpx;
  background-color: #8A9A5B;
  border-radius: 50%;
  border: 3rpx solid #FFFCF8;
}

.member-name {
  font-size: 26rpx;
  color: #5C4F42;
  margin-top: 12rpx;
}

.member-role {
  font-size: 20rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
}

// 数据统计区域
.stats-section {
  padding: 32rpx;
  background-color: #FAF7F2;
}

.stats-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.stat-card {
  background-color: #FFFCF8;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(196, 184, 168, 0.1);
}

.stat-info {
  margin-top: 16rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
}

.stat-value {
  font-size: 44rpx;
  color: #5C4F42;
  font-weight: 500;
}

.stat-unit {
  font-size: 24rpx;
  color: #9E8F7D;
  margin-left: 4rpx;
}

// 信纸堆积效果
.paper-stack {
  position: relative;
}

.paper-layers {
  position: relative;
  height: 80rpx;
}

.paper-layer {
  position: absolute;
  width: 100%;
  height: 60rpx;
  background-color: #FAF7F2;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(196, 184, 168, 0.15);

  &.layer-1 {
    bottom: 0;
    transform: rotate(-2deg);
  }

  &.layer-2 {
    bottom: 8rpx;
    transform: rotate(1deg);
  }

  &.layer-3 {
    bottom: 16rpx;
    background-color: #FFFCF8;
    padding: 12rpx;
  }
}

.paper-preview {
  height: 100%;
}

.preview-line {
  height: 6rpx;
  background-color: #E8E4DF;
  border-radius: 3rpx;
  margin-bottom: 8rpx;

  &.short {
    width: 60%;
  }
}

// 平行时刻插画
.parallel-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
}

.illust-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 3rpx solid #FFFCF8;
  box-shadow: 0 4rpx 12rpx rgba(196, 184, 168, 0.2);

  image {
    width: 100%;
    height: 100%;
  }

  &.left {
    transform: translateX(16rpx);
  }

  &.right {
    transform: translateX(-16rpx);
  }
}

.illust-heart {
  font-size: 28rpx;
  z-index: 1;
}

// 共鸣插画
.resonance-illustration {
  position: relative;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resonance-wave {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border: 2rpx solid rgba(224, 122, 95, 0.3);
  border-radius: 50%;
  animation: waveExpand 2s ease-out infinite;

  &.delay-1 {
    animation-delay: 0.5s;
  }

  &.delay-2 {
    animation-delay: 1s;
  }
}

@keyframes waveExpand {
  0% {
    width: 30rpx;
    height: 30rpx;
    opacity: 1;
  }
  100% {
    width: 100rpx;
    height: 100rpx;
    opacity: 0;
  }
}

.resonance-heart {
  font-size: 32rpx;
  z-index: 1;
}

// 信件插画
.letters-illustration {
  position: relative;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-icon {
  font-size: 48rpx;
}

.letter-sparkle {
  position: absolute;
  top: 8rpx;
  right: 30%;
  font-size: 20rpx;
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

// 实体书区域
.book-section {
  padding: 32rpx;
  background-color: #FFFCF8;
}

.book-preview {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FAF7F2;
  border-radius: 20rpx;
}

.book-3d {
  perspective: 500px;
  margin-right: 32rpx;
}

.book-cover {
  position: relative;
  width: 120rpx;
  height: 160rpx;
  transform: rotateY(-15deg);
  transform-style: preserve-3d;
}

.book-spine {
  position: absolute;
  left: -16rpx;
  top: 0;
  width: 16rpx;
  height: 100%;
  background: linear-gradient(90deg, #B8956E 0%, #8B7355 100%);
  transform: rotateY(90deg);
  transform-origin: right center;
  border-radius: 2rpx 0 0 2rpx;
}

.book-front {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #E8DCC4 0%, #D4C8B0 100%);
  border-radius: 4rpx 8rpx 8rpx 4rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 4rpx 4rpx 12rpx rgba(92, 79, 66, 0.2);
}

.book-title {
  font-size: 22rpx;
  color: #5C4F42;
  font-weight: 500;
  text-align: center;
}

.book-year {
  font-size: 32rpx;
  color: #8B7355;
  font-weight: bold;
  margin: 8rpx 0;
}

.book-decoration {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
}

.decor-line {
  width: 16rpx;
  height: 2rpx;
  background-color: #B8956E;
}

.decor-text {
  font-size: 14rpx;
  color: #9E8F7D;
  margin: 0 8rpx;
}

.book-info {
  flex: 1;
  margin-left: 10rpx;
}

.book-hint {
  display: block;
  font-size: 30rpx;
  color: #5C4F42;
  font-weight: 500;
}

.book-desc {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 8rpx;
}

// 功能列表
.feature-list {
  padding: 16rpx 32rpx;
  background-color: #FAF7F2;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background-color: #FFFCF8;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.feature-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-size: 32rpx;

  &.font-icon {
    background-color: rgba(224, 122, 95, 0.1);
    color: #E07A5F;
  }

  &.sound-icon {
    background-color: rgba(138, 154, 91, 0.1);
    color: #8A9A5B;
  }

  &.privacy-icon {
    background-color: rgba(196, 184, 168, 0.2);
  }

  &.about-icon {
    background-color: rgba(224, 122, 95, 0.1);
    color: #E07A5F;
  }

  &.logout-icon {
    background-color: rgba(158, 143, 125, 0.1);
    color: #9E8F7D;
  }
}

.logout-item {
  background-color: rgba(158, 143, 125, 0.05);
}

.feature-content {
  flex: 1;
}

.feature-title {
  display: block;
  font-size: 30rpx;
  color: #5C4F42;
}

.feature-desc {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
}

.feature-arrow {
  font-size: 36rpx;
  color: #C4B8A8;
}

// 音效开关
.sound-switch {
  position: relative;
  width: 100rpx;
  height: 48rpx;
  background: linear-gradient(135deg, #E8E4DF 0%, #D4CFC7 100%);
  border-radius: 24rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2rpx 4rpx rgba(92, 79, 66, 0.1);

  &.on {
    background: linear-gradient(135deg, #8A9A5B 0%, #7A8A4B 100%);
    box-shadow: 0 4rpx 12rpx rgba(138, 154, 91, 0.3);

    .switch-thumb {
      left: 56rpx;
      background: linear-gradient(135deg, #FFFCF8 0%, #F5F1ED 100%);
    }

    .on-icon {
      opacity: 1;
    }

    .off-icon {
      opacity: 0;
    }
  }
}

.switch-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12rpx;
}

.switch-icon {
  font-size: 24rpx;
  transition: opacity 0.3s ease;

  &.off-icon {
    opacity: 0.6;
  }

  &.on-icon {
    opacity: 0;
  }
}

.switch-thumb {
  position: absolute;
  top: 50%;
  left: 4rpx;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #FFFCF8 0%, #F0EBE5 100%);
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(92, 79, 66, 0.25), 0 1rpx 3rpx rgba(92, 79, 66, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

// 底部签名
.footer-signature {
  padding: 48rpx;
  text-align: center;
}

.signature-text {
  display: block;
  font-size: 26rpx;
  color: #9E8F7D;
  font-style: italic;
}

.signature-date {
  display: block;
  font-size: 22rpx;
  color: #C4B8A8;
  margin-top: 8rpx;
}

.bottom-space {
  height: 200rpx;
}

// 字体设置弹窗
.settings-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(230, 222, 212, 0.9);
  backdrop-filter: blur(10rpx);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
  padding-bottom: 10rpx;
}

.settings-content {
  width: 100%;
  max-height: 80vh;
  background-color: #FFFCF8;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.settings-title {
  font-size: 34rpx;
  color: #5C4F42;
  font-weight: 500;
}

.settings-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: #9E8F7D;
}

.settings-body {
  padding: 32rpx;
  padding-bottom: calc(32rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.font-preview {
  padding: 32rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
  text-align: center;
  margin-bottom: 24rpx;
}

.preview-text {
  font-size: 36rpx;
  color: #5C4F42;
}

.font-options {
  margin-bottom: 24rpx;
}

.font-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;

  &.selected {
    border-color: #E07A5F;
    background-color: rgba(224, 122, 95, 0.05);
  }
}

.font-name {
  font-size: 30rpx;
  color: #5C4F42;
}

.font-check {
  color: #E07A5F;
  font-size: 28rpx;
}

.upload-handwrite {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
  border: 2rpx dashed #C4B8A8;
  margin-bottom: 24rpx;
}

.upload-icon {
  width: 72rpx;
  height: 72rpx;
  background-color: rgba(224, 122, 95, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #E07A5F;
  margin-right: 20rpx;
}

.upload-text {
  flex: 1;
}

.upload-title {
  display: block;
  font-size: 28rpx;
  color: #5C4F42;
}

.upload-desc {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
}

.privacy-notice {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: rgba(138, 154, 91, 0.1);
  border-radius: 12rpx;
}

.notice-icon {
  margin-right: 12rpx;
}

.notice-text {
  font-size: 24rpx;
  color: #8A9A5B;
}
</style>
