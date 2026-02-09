<template>
  <view class="login-page" :class="fontClass" :style="themeStyle">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle circle-1"></view>
      <view class="bg-circle circle-2"></view>
      <view class="bg-circle circle-3"></view>
    </view>

    <!-- 主内容区 -->
    <view class="login-content">
      <!-- Logo 和标题 -->
      <view class="header-section">
        <view class="logo-wrapper">
          <view class="logo">
            <text class="logo-icon">🏠</text>
          </view>
          <view class="logo-glow"></view>
        </view>
        <text class="app-name">家的时光</text>
        <text class="app-slogan">记录每一个温柔的瞬间</text>
      </view>

      <!-- 表单卡片 -->
      <view class="form-card">
        <!-- 切换标签 - 胶囊样式 -->
        <view class="tab-switcher">
          <view
            class="tab-item"
            :class="{ active: currentTab === 'login' }"
            @tap="switchTab('login')"
          >
            <text>打开日记</text>
          </view>
          <view
            class="tab-item"
            :class="{ active: currentTab === 'register' }"
            @tap="switchTab('register')"
          >
            <text>新的篇章</text>
          </view>
        </view>

        <!-- 登录表单 -->
        <view v-if="currentTab === 'login'" class="form-content">
          <view class="input-group">
            <view class="input-icon-wrap">
              <text class="input-icon">✉</text>
            </view>
            <input
              v-model="loginForm.phone"
              type="number"
              placeholder="家庭手机号"
              maxlength="11"
              class="input-field"
              placeholder-class="input-placeholder"
            />
          </view>

          <view class="input-group">
            <view class="input-icon-wrap">
              <text class="input-icon">🔑</text>
            </view>
            <input
              v-model="loginForm.password"
              :password="!showLoginPwd"
              placeholder="家庭密码"
              class="input-field"
              placeholder-class="input-placeholder"
            />
            <text class="toggle-pwd" @tap="showLoginPwd = !showLoginPwd">
              {{ showLoginPwd ? '🙈' : '👁️‍🗨️' }}
            </text>
          </view>

          <view
            class="submit-btn"
            :class="{ disabled: !canLogin, loading: isLoggingIn }"
            @tap="handleLogin"
          >
            <view v-if="isLoggingIn" class="btn-loading">
              <view class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
            <text v-else class="btn-text">打开时光  →</text>
          </view>
        </view>

        <!-- 注册表单 -->
        <view v-if="currentTab === 'register'" class="form-content">
          <view class="input-group">
            <view class="input-icon-wrap">
              <text class="input-icon">👤</text>
            </view>
            <input
              v-model="registerForm.nickname"
              placeholder="你的昵称"
              maxlength="12"
              class="input-field"
              placeholder-class="input-placeholder"
            />
          </view>

          <view class="input-group">
            <view class="input-icon-wrap">
              <text class="input-icon">✉</text>
            </view>
            <input
              v-model="registerForm.phone"
              type="number"
              placeholder="家庭手机号"
              maxlength="11"
              class="input-field"
              placeholder-class="input-placeholder"
            />
          </view>

          <view class="input-group">
            <view class="input-icon-wrap">
              <text class="input-icon">🔑</text>
            </view>
            <input
              v-model="registerForm.password"
              :password="!showRegPwd"
              placeholder="设置密码"
              maxlength="16"
              class="input-field"
              placeholder-class="input-placeholder"
            />
            <text class="toggle-pwd" @tap="showRegPwd = !showRegPwd">
              {{ showRegPwd ? '🙈' : '👁️‍🗨️' }}
            </text>
          </view>

          <view class="input-group">
            <view class="input-icon-wrap">
              <text class="input-icon">♡</text>
            </view>
            <input
              v-model="registerForm.familyCode"
              placeholder="家庭邀请码（选填）"
              maxlength="8"
              class="input-field"
              placeholder-class="input-placeholder"
            />
          </view>

          <view
            class="submit-btn"
            :class="{ disabled: !canRegister, loading: isRegistering }"
            @tap="handleRegister"
          >
            <view v-if="isRegistering" class="btn-loading">
              <view class="loading-dots">
                <view class="dot"></view>
                <view class="dot"></view>
                <view class="dot"></view>
              </view>
            </view>
            <text v-else class="btn-text">开启旅程  </text>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="footer-tips">
        <text class="tips-text">
          {{ currentTab === 'login' ? '还没有账号？' : '已有账号？' }}
        </text>
        <text
          class="tips-link"
          @tap="switchTab(currentTab === 'login' ? 'register' : 'login')"
        >
          {{ currentTab === 'login' ? '创建新篇章' : '回到登录' }}
        </text>
      </view>
    </view>

    <!-- 底部装饰 -->
    <view class="footer-decoration">
      <text class="footer-text">用心记录，温柔以待</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTheme } from '@/composables/useTheme.js'
import { login, register } from '@/utils/api.js'

const { themeStyle } = useTheme()

// 状态
const statusBarHeight = ref(20)
const fontClass = ref('font-system')
const currentTab = ref('login')
const showLoginPwd = ref(false)
const showRegPwd = ref(false)
const isLoggingIn = ref(false)
const isRegistering = ref(false)

// 表单数据
const loginForm = reactive({
  phone: '',
  password: ''
})

const registerForm = reactive({
  nickname: '',
  phone: '',
  password: '',
  familyCode: ''
})

// 计算属性
const canLogin = computed(() => {
  return loginForm.phone.length === 11 && loginForm.password.length >= 6
})

const canRegister = computed(() => {
  return (
    registerForm.nickname.length >= 2 &&
    registerForm.phone.length === 11 &&
    registerForm.password.length >= 6
  )
})

// 生命周期
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  // 加载字体设置
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'

  // 检查是否已登录
  checkLoginStatus()

  // 加载记住的账号
  const remembered = uni.getStorageSync('rememberedAccount')
  if (remembered) {
    loginForm.phone = remembered.phone || ''
  }
})

// 方法
const checkLoginStatus = () => {
  const token = uni.getStorageSync('token')
  const userInfo = uni.getStorageSync('userInfo')
  if (token && userInfo) {
    uni.reLaunch({
      url: '/pages/timeline/timeline'
    })
  }
}

const switchTab = (tab) => {
  currentTab.value = tab
  showLoginPwd.value = false
  showRegPwd.value = false
}

const handleLogin = async () => {
  if (!canLogin.value || isLoggingIn.value) return

  isLoggingIn.value = true

  try {
    const res = await login({
      phone: loginForm.phone,
      password: loginForm.password
    })

    // 保存 token 和用户信息
    uni.setStorageSync('token', res.data.token)
    uni.setStorageSync('userInfo', res.data.user)
    uni.setStorageSync('rememberedAccount', {
      phone: loginForm.phone
    })

    uni.showToast({
      title: '欢迎回家',
      icon: 'success'
    })

    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/timeline/timeline'
      })
    }, 1500)
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    isLoggingIn.value = false
  }
}

const handleRegister = async () => {
  if (!canRegister.value || isRegistering.value) return

  isRegistering.value = true

  try {
    const res = await register({
      nickname: registerForm.nickname,
      phone: registerForm.phone,
      password: registerForm.password,
      familyCode: registerForm.familyCode || undefined
    })

    // 注册成功，保存 token 和用户信息
    uni.setStorageSync('token', res.data.token)
    uni.setStorageSync('userInfo', res.data.user)

    uni.showToast({
      title: res.message || '注册成功',
      icon: 'success'
    })

    setTimeout(() => {
      // 如果用户没有家庭，跳转到创建/加入家庭页面
      if (!res.data.user.familyId) {
        uni.reLaunch({
          url: '/pages/timeline/timeline?needFamily=true'
        })
      } else {
        uni.reLaunch({
          url: '/pages/timeline/timeline'
        })
      }
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    isRegistering.value = false
  }
}
</script>

<style lang="scss" scoped>
@use './login.scss';
</style>
