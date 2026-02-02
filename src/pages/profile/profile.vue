<template>
  <view class="page-wrapper profile-page" :class="fontClass">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <scroll-view scroll-y class="profile-scroll">
      <!-- 家庭封面图 -->
      <view class="family-cover">
        <image v-if="familyInfo.coverImage" :src="familyInfo.coverImage" mode="aspectFill" class="cover-image" />
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
          <view v-for="member in familyMembers" :key="member.id" class="member-item" @tap="viewMember(member)">
            <view class="member-avatar-wrapper" :class="{ online: member.online }">
              <!-- 默认头像显示emoji -->
              <view
                v-if="member.avatarInfo && member.avatarInfo.type === 'default'"
                class="member-avatar-default"
                :style="{ backgroundColor: member.avatarInfo.color }"
              >
                <text class="avatar-emoji">{{ member.avatarInfo.emoji }}</text>
              </view>
              <!-- 自定义头像显示图片 -->
              <image
                v-else
                :src="member.avatar || '/static/images/default-avatar.png'"
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

          <view class="stat-card parallel-moments">
            <view class="parallel-illustration">
              <view class="illust-avatar left">
                <image :src="familyMembers[0]?.avatar || '/static/images/default-avatar.png'" />
              </view>
              <view class="illust-heart">💕</view>
              <view class="illust-avatar right">
                <image :src="familyMembers[1]?.avatar || '/static/images/default-avatar.png'" />
              </view>
            </view>
            <view class="stat-info">
              <text class="stat-label">平行时刻</text>
              <text class="stat-value">{{ stats.parallelCount }}</text>
              <text class="stat-unit">次同频</text>
            </view>
          </view>

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
        <view class="feature-item" @tap="openProfileSettings">
          <view class="feature-icon about-icon"><text>👤</text></view>
          <view class="feature-content">
            <text class="feature-title">个人设置</text>
            <text class="feature-desc">修改昵称、更换头像</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item" @tap="openSettings('font')">
          <view class="feature-icon font-icon"><text>文</text></view>
          <view class="feature-content">
            <text class="feature-title">字体设置</text>
            <text class="feature-desc">上传手写体，让记录更有温度</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item">
          <view class="feature-icon sound-icon"><text>♪</text></view>
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
          <view class="feature-icon privacy-icon"><text>🔒</text></view>
          <view class="feature-content">
            <text class="feature-title">隐私设置</text>
            <text class="feature-desc">管理数据存储与分享权限</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item" @tap="openSettings('about')">
          <view class="feature-icon about-icon"><text>♡</text></view>
          <view class="feature-content">
            <text class="feature-title">关于我们</text>
            <text class="feature-desc">家的时光 v1.0.0</text>
          </view>
          <text class="feature-arrow">›</text>
        </view>

        <view class="feature-item logout-item" @tap="handleLogout">
          <view class="feature-icon logout-icon"><text>↪</text></view>
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
    <ft-tab-bar current-tab="profile" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <ft-record-modal :visible="showRecordModal" @close="closeRecord" @submit="submitRecord" />

    <!-- 字体设置弹窗 -->
    <view v-if="showFontSettings" class="settings-popup" @tap.stop="closeFontSettings">
      <view class="settings-content" @tap.stop>
        <view class="settings-header">
          <text class="settings-title">字体设置</text>
          <view class="settings-close" @tap="closeFontSettings">×</view>
        </view>

        <view class="settings-body">
          <view class="font-preview">
            <text class="preview-text" :style="{ fontFamily: currentFont }">家是最温暖的港湾</text>
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
    <ft-family-name-modal
      :visible="showFamilyNameModal"
      mode="edit"
      :initial-name="familyInfo.name"
      @close="closeFamilyNameModal"
      @submit="saveFamilyName"
    />

    <!-- 个人设置弹窗 -->
    <ft-profile-settings
      :visible="showProfileSettings"
      :user-info="currentUserInfo"
      @close="closeProfileSettings"
      @updated="onProfileUpdated"
    />

    <!-- 邀请海报弹窗 -->
    <ft-invite-poster
      :visible="showInvitePoster"
      :family-info="{ name: familyInfo.name, inviteCode: inviteCode }"
      @close="closeInvitePoster"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMyFamily, getFamilyStats, updateFamily, getCurrentUser } from '@/utils/api.js'
import { getAvatarInfo } from '@/utils/index.js'

const statusBarHeight = ref(20)
const menuButtonTop = ref(0)
const menuButtonHeight = ref(32)
const showRecordModal = ref(false)
const showFontSettings = ref(false)
const showFamilyNameModal = ref(false)
const showProfileSettings = ref(false)
const showInvitePoster = ref(false)
const soundEnabled = ref(true)
const currentFont = ref('system')
const fontClass = ref('font-system')
const familyId = ref('')
const inviteCode = ref('')

const familyInfo = reactive({
  name: '',
  slogan: '记录每一个温柔的瞬间',
  coverImage: '',
  createdDate: ''
})

const familyMembers = ref([])

const currentUserInfo = reactive({
  nickname: '',
  avatar: ''
})

const stats = reactive({
  memoriesCount: 0,
  parallelCount: 0,
  resonanceCount: 0,
  lettersCount: 0
})

const fontList = [
  { id: 'system', name: '系统默认', value: 'system', class: 'font-system' },
  { id: 'round', name: '圆润可爱', value: '"PingFang SC", sans-serif', class: 'font-round' },
  { id: 'handwrite', name: '手写楷书', value: '"Kaiti SC", serif', class: 'font-handwrite' },
  { id: 'songti', name: '宋体经典', value: '"Songti SC", serif', class: 'font-songti' },
  { id: 'heiti', name: '黑体稳重', value: '"Heiti SC", sans-serif', class: 'font-heiti' },
  { id: 'light', name: '纤细优雅', value: '"PingFang SC", sans-serif', class: 'font-light' },
  { id: 'bold', name: '醒目粗体', value: '"PingFang SC", sans-serif', class: 'font-bold' },
  { id: 'wide', name: '宽松舒适', value: '"PingFang SC", sans-serif', class: 'font-wide' }
]

const currentYear = computed(() => new Date().getFullYear())

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  // #ifdef MP-WEIXIN
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
  menuButtonTop.value = menuButtonInfo.top
  menuButtonHeight.value = menuButtonInfo.height
  // #endif

  soundEnabled.value = uni.getStorageSync('soundEnabled') !== false
  loadFontSettings()
  loadFamilyInfo()
})

onShow(() => {
  loadFontSettings()
  loadFamilyInfo()
})

const loadFamilyInfo = async () => {
  try {
    const res = await getMyFamily()
    if (res.data) {
      familyInfo.name = res.data.name || ''
      familyInfo.slogan = res.data.slogan || '记录每一个温柔的瞬间'
      familyInfo.coverImage = res.data.coverImage || ''
      familyInfo.createdDate = res.data.establishedYear ? res.data.establishedYear + '年' : ''
      familyId.value = res.data.id
      inviteCode.value = res.data.inviteCode
      familyMembers.value = (res.data.members || []).map(m => ({
        id: m.id, name: m.nickname, role: '', avatar: m.avatar || '', online: true,
        avatarInfo: getAvatarInfo(m.avatar)
      }))

      if (res.data.id) {
        loadFamilyStats(res.data.id)
      }
    }
  } catch (error) {
    console.error('加载家庭信息失败:', error)
  }
}

const loadFamilyStats = async (id) => {
  try {
    const res = await getFamilyStats(id)
    if (res.data) {
      stats.memoriesCount = res.data.memoriesCount || 0
      stats.parallelCount = res.data.parallelMoments || 0
      stats.resonanceCount = res.data.resonanceCount || 0
      stats.lettersCount = res.data.lettersCount || 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const openEditFamilyName = () => { showFamilyNameModal.value = true }
const closeFamilyNameModal = () => { showFamilyNameModal.value = false }

const saveFamilyName = async (name) => {
  try {
    if (familyId.value) {
      await updateFamily(familyId.value, { name })
    }
    familyInfo.name = name
    showFamilyNameModal.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (error) {
    console.error('保存家庭名称失败:', error)
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出当前账号吗？',
    confirmColor: '#5C4F42',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('familyData')
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => { uni.reLaunch({ url: '/pages/login/login' }) }, 1500)
      }
    }
  })
}

const loadFontSettings = () => {
  const savedFontClass = uni.getStorageSync('fontClass') || 'font-system'
  fontClass.value = savedFontClass
  const font = fontList.find(f => f.class === savedFontClass)
  if (font) {
    currentFont.value = font.value
  }
}

const applyGlobalFont = (fc) => {
  uni.setStorageSync('fontClass', fc)
  const app = getApp()
  if (app && app.globalData) {
    app.globalData.currentFont = currentFont.value
    app.globalData.fontClass = fc
  }
}

const changeCover = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => { familyInfo.coverImage = res.tempFilePaths[0] }
  })
}

const inviteMember = () => { showInvitePoster.value = true }
const closeInvitePoster = () => { showInvitePoster.value = false }
const viewMember = (member) => { uni.showToast({ title: `查看 ${member.name} 的资料`, icon: 'none' }) }
const generateBook = () => { uni.showToast({ title: '纪念册功能开发中', icon: 'none' }) }

const openProfileSettings = async () => {
  // 先加载当前用户信息，再显示弹窗
  await loadCurrentUser()
  showProfileSettings.value = true
}
const closeProfileSettings = () => { showProfileSettings.value = false }

const onProfileUpdated = (data) => {
  // 更新本地存储
  const userInfo = uni.getStorageSync('userInfo') || {}
  if (data.nickname) userInfo.nickname = data.nickname
  if (data.avatar) userInfo.avatar = data.avatar
  uni.setStorageSync('userInfo', userInfo)
  // 刷新成员列表
  loadFamilyInfo()
}

const loadCurrentUser = async () => {
  try {
    const res = await getCurrentUser()
    if (res.data) {
      currentUserInfo.nickname = res.data.nickname || ''
      currentUserInfo.avatar = res.data.avatar || ''
    }
  } catch (error) {
    // 从本地存储读取
    const userInfo = uni.getStorageSync('userInfo') || {}
    currentUserInfo.nickname = userInfo.nickname || ''
    currentUserInfo.avatar = userInfo.avatar || ''
  }
}

const openSettings = (type) => {
  if (type === 'font') {
    showFontSettings.value = true
  } else {
    uni.showToast({ title: `${type} 设置开发中`, icon: 'none' })
  }
}

const closeFontSettings = () => { showFontSettings.value = false }

const selectFont = (font) => {
  currentFont.value = font.value
  fontClass.value = font.class
  uni.setStorageSync('fontFamily', font.value)
  uni.setStorageSync('fontClass', font.class)
  applyGlobalFont(font.class)
  uni.showToast({ title: '字体已更换', icon: 'success' })
}

const uploadHandwrite = () => { uni.showToast({ title: '手写体上传功能开发中', icon: 'none' }) }

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  uni.setStorageSync('soundEnabled', soundEnabled.value)

  if (soundEnabled.value) {
    playSound('switch')
    // #ifdef MP-WEIXIN
    uni.vibrateShort({ type: 'light' })
    // #endif
  }

  uni.showToast({ title: soundEnabled.value ? '音效已开启' : '音效已关闭', icon: 'none', duration: 1500 })
}

const playSound = (type) => {
  if (!soundEnabled.value && type !== 'switch') return

  const soundMap = {
    switch: '/static/audio/switch.mp3',
    page: '/static/audio/page-flip.mp3',
    bell: '/static/audio/wind-bell.mp3'
  }

  const audioContext = uni.createInnerAudioContext()
  audioContext.src = soundMap[type] || soundMap.switch
  audioContext.volume = 0.5
  audioContext.play()

  audioContext.onEnded(() => { audioContext.destroy() })
  audioContext.onError(() => { audioContext.destroy() })
}

const openRecord = () => { showRecordModal.value = true }
const closeRecord = () => { showRecordModal.value = false }
const submitRecord = () => { stats.memoriesCount++ }
</script>

<style lang="scss" scoped>
@use './profile.scss';
</style>
