<template>
  <view v-if="visible" class="modal-overlay" @tap.self="handleClose">
    <view class="modal-container" :class="{ 'slide-up': visible }" @tap.stop>
      <!-- 顶部装饰条 -->
      <view class="top-decoration"></view>

      <!-- 关闭按钮（仅编辑模式显示） -->
      <view v-if="mode === 'edit'" class="close-btn" @tap="handleClose">
        <text>×</text>
      </view>

      <!-- Logo -->
      <view class="logo-wrapper">
        <view class="logo">
          <text class="logo-icon">🏠</text>
        </view>
      </view>

      <!-- 标题 -->
      <text class="modal-title">{{ mode === 'welcome' ? '欢迎回家' : '修改家庭名' }}</text>
      <text class="modal-subtitle">{{ mode === 'welcome' ? '给你的家庭故事起个名字' : '更新你的家庭名称' }}</text>

      <!-- 输入框 -->
      <view class="input-wrapper">
        <input
          v-model="familyName"
          :placeholder="mode === 'welcome' ? '例如：温馨小窝' : '请输入新的家庭名'"
          maxlength="12"
          class="name-input"
          placeholder-class="input-placeholder"
          @confirm="handleSubmit"
        />
        <view class="input-line"></view>
      </view>

      <!-- 提交按钮 -->
      <view
        class="submit-btn"
        :class="{ disabled: !familyName.trim() }"
        @tap="handleSubmit"
      >
        <text class="btn-text">
          {{ mode === 'welcome' ? '开启旅程' : '保存更改' }}
          {{ mode === 'welcome' ? ' →' : ' ✓' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FamilyNameModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'welcome' // welcome | edit
    },
    initialName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      familyName: ''
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.familyName = this.initialName || ''
      }
    },
    initialName(val) {
      if (this.visible) {
        this.familyName = val || ''
      }
    }
  },
  methods: {
    handleClose() {
      if (this.mode === 'edit') {
        this.$emit('close')
      }
    },
    handleSubmit() {
      const name = this.familyName.trim()
      if (!name) {
        uni.showToast({
          title: '请输入家庭名称',
          icon: 'none'
        })
        return
      }

      this.$emit('submit', name)
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(92, 79, 66, 0.4);
  backdrop-filter: blur(8rpx);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  background-color: #FFFCF8;
  border-radius: 32rpx;
  padding: 60rpx 48rpx 48rpx;
  box-shadow: 0 24rpx 64rpx rgba(92, 79, 66, 0.2);
  transform: translateY(40rpx);
  opacity: 0;
  transition: all 0.3s ease;

  &.slide-up {
    transform: translateY(0);
    opacity: 1;
  }
}

// 顶部装饰条
.top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8rpx;
  background: linear-gradient(90deg, #E07A5F 0%, #D4654A 50%, #C4B8A8 100%);
  border-radius: 32rpx 32rpx 0 0;
}

// 关闭按钮
.close-btn {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 44rpx;
    color: #C4B8A8;
    line-height: 1;
  }
}

// Logo
.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.logo {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #FFFCF8 0%, #F5F1ED 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(196, 184, 168, 0.25);
}

.logo-icon {
  font-size: 48rpx;
}

// 标题
.modal-title {
  display: block;
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #5C4F42;
  font-style: italic;
  margin-bottom: 12rpx;
}

.modal-subtitle {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: #9E8F7D;
  margin-bottom: 40rpx;
}

// 输入框
.input-wrapper {
  position: relative;
  margin-bottom: 40rpx;
}

.name-input {
  width: 100%;
  height: 80rpx;
  font-size: 32rpx;
  color: #5C4F42;
  text-align: center;
  background: transparent;
}

.input-placeholder {
  color: #C4B8A8;
  font-size: 32rpx;
  font-style: italic;
}

.input-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #C4B8A8 50%, transparent 100%);
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
  box-shadow: 0 12rpx 32rpx rgba(92, 79, 66, 0.25);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
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
}
</style>
