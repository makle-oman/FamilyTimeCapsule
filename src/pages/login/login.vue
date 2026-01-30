<template>
  <view class="login-page" :class="fontClass">
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
            <text v-else class="btn-text">开启旅程  →</text>
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

<script>
import { login, register } from '../../utils/api.js';

export default {
  data() {
    return {
      statusBarHeight: 20,
      fontClass: 'font-system',
      currentTab: 'login',
      showLoginPwd: false,
      showRegPwd: false,
      isLoggingIn: false,
      isRegistering: false,
      loginForm: {
        phone: '',
        password: ''
      },
      registerForm: {
        nickname: '',
        phone: '',
        password: '',
        familyCode: ''
      }
    }
  },
  computed: {
    canLogin() {
      return this.loginForm.phone.length === 11 && this.loginForm.password.length >= 6
    },
    canRegister() {
      return (
        this.registerForm.nickname.length >= 2 &&
        this.registerForm.phone.length === 11 &&
        this.registerForm.password.length >= 6
      )
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 20

    // 加载字体设置
    this.fontClass = uni.getStorageSync('fontClass') || 'font-system'

    // 检查是否已登录
    this.checkLoginStatus()

    // 加载记住的账号
    const remembered = uni.getStorageSync('rememberedAccount')
    if (remembered) {
      this.loginForm.phone = remembered.phone || ''
    }
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      if (token && userInfo) {
        uni.reLaunch({
          url: '/pages/timeline/timeline'
        })
      }
    },
    switchTab(tab) {
      this.currentTab = tab
      this.showLoginPwd = false
      this.showRegPwd = false
    },
    async handleLogin() {
      if (!this.canLogin || this.isLoggingIn) return

      this.isLoggingIn = true

      try {
        const res = await login({
          phone: this.loginForm.phone,
          password: this.loginForm.password
        });

        // 保存 token 和用户信息
        uni.setStorageSync('token', res.data.token);
        uni.setStorageSync('userInfo', res.data.user);
        uni.setStorageSync('rememberedAccount', {
          phone: this.loginForm.phone
        });

        uni.showToast({
          title: '欢迎回家',
          icon: 'success'
        });

        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/timeline/timeline'
          });
        }, 1500);
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        this.isLoggingIn = false;
      }
    },
    async handleRegister() {
      if (!this.canRegister || this.isRegistering) return

      this.isRegistering = true

      try {
        const res = await register({
          nickname: this.registerForm.nickname,
          phone: this.registerForm.phone,
          password: this.registerForm.password,
          familyCode: this.registerForm.familyCode || undefined
        });

        // 注册成功，保存 token 和用户信息
        uni.setStorageSync('token', res.data.token);
        uni.setStorageSync('userInfo', res.data.user);

        uni.showToast({
          title: res.message || '注册成功',
          icon: 'success'
        });

        setTimeout(() => {
          // 如果用户没有家庭，跳转到创建/加入家庭页面
          if (!res.data.user.familyId) {
            uni.reLaunch({
              url: '/pages/timeline/timeline?needFamily=true'
            });
          } else {
            uni.reLaunch({
              url: '/pages/timeline/timeline'
            });
          }
        }, 1500);
      } catch (error) {
        console.error('注册失败:', error);
      } finally {
        this.isRegistering = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #FAF7F2 0%, #EDE6DC 100%);
  position: relative;
  overflow: hidden;
}

.status-bar {
  position: relative;
  z-index: 10;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;

  &.circle-1 {
    width: 500rpx;
    height: 500rpx;
    background: #C4B8A8;
    top: -150rpx;
    right: -150rpx;
  }

  &.circle-2 {
    width: 350rpx;
    height: 350rpx;
    background: #8A9A5B;
    bottom: 150rpx;
    left: -120rpx;
  }

  &.circle-3 {
    width: 250rpx;
    height: 250rpx;
    background: #C4B8A8;
    bottom: -60rpx;
    right: 60rpx;
  }
}

// 主内容
.login-content {
  position: relative;
  z-index: 1;
  padding: 0 48rpx;
}

// 头部区域
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0 40rpx;
}

.logo-wrapper {
  position: relative;
  margin-bottom: 20rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FFFCF8 0%, #F5F1ED 100%);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(196, 184, 168, 0.25);
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 56rpx;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160rpx;
  height: 160rpx;
  background: radial-gradient(circle, rgba(196, 184, 168, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.app-name {
  font-size: 44rpx;
  font-weight: 600;
  color: #5C4F42;
  letter-spacing: 8rpx;
  margin-bottom: 8rpx;
}

.app-slogan {
  font-size: 24rpx;
  color: #9E8F7D;
  letter-spacing: 2rpx;
}

// 表单卡片
.form-card {
  background-color: #FFFCF8;
  border-radius: 28rpx;
  padding: 36rpx 40rpx 44rpx;
  box-shadow: 0 12rpx 40rpx rgba(196, 184, 168, 0.15);
}

// 切换标签 - 胶囊样式
.tab-switcher {
  display: flex;
  background-color: #F5F1ED;
  border-radius: 40rpx;
  padding: 6rpx;
  margin-bottom: 44rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 36rpx;
  transition: all 0.3s ease;

  text {
    font-size: 28rpx;
    color: #9E8F7D;
    transition: all 0.3s ease;
  }

  &.active {
    background-color: #FFFCF8;
    box-shadow: 0 4rpx 16rpx rgba(196, 184, 168, 0.2);

    text {
      color: #5C4F42;
      font-weight: 500;
    }
  }
}

// 表单内容
.form-content {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #E8E4DF;
  padding: 24rpx 0;
  margin-bottom: 8rpx;
  transition: border-color 0.3s ease;

  &:focus-within {
    border-bottom-color: #C4B8A8;
  }
}

.input-icon-wrap {
  width: 48rpx;
  flex-shrink: 0;
}

.input-icon {
  font-size: 32rpx;
  color: #C4B8A8;
}

.input-field {
  flex: 1;
  height: 60rpx;
  font-size: 30rpx;
  color: #5C4F42;
  padding: 0;
  background: transparent;
}

.input-placeholder {
  color: #C4B8A8;
  font-size: 30rpx;
}

.toggle-pwd {
  font-size: 28rpx;
  padding: 8rpx;
  color: #C4B8A8;
}

// 提交按钮
.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #6B5D50 0%, #5C4F42 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  box-shadow: 0 12rpx 32rpx rgba(92, 79, 66, 0.25);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 8rpx 20rpx rgba(92, 79, 66, 0.3);
  }

  &.disabled {
    background: linear-gradient(135deg, #D4CFC7 0%, #C4B8A8 100%);
    box-shadow: none;
  }
}

.btn-text {
  font-size: 30rpx;
  color: #FFFCF8;
  font-weight: 500;
  letter-spacing: 4rpx;
  font-style: italic;
}

// 加载动画
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  background-color: #FFFCF8;
  border-radius: 50%;
  animation: dotPulse 1.4s ease-in-out infinite;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

// 底部提示
.footer-tips {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 36rpx 0;
}

.tips-text {
  font-size: 26rpx;
  color: #9E8F7D;
}

.tips-link {
  font-size: 26rpx;
  color: #5C4F42;
  font-weight: 500;
  margin-left: 8rpx;
}

// 底部装饰
.footer-decoration {
  position: absolute;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
}

.footer-text {
  font-size: 24rpx;
  color: #C4B8A8;
  letter-spacing: 4rpx;
  font-style: italic;
}
</style>
