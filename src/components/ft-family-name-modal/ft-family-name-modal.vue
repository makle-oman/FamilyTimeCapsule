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
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
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
})

const emit = defineEmits(['close', 'submit'])

const familyName = ref('')

watch(() => props.visible, (val) => {
  if (val) {
    familyName.value = props.initialName || ''
  }
})

watch(() => props.initialName, (val) => {
  if (props.visible) {
    familyName.value = val || ''
  }
})

const handleClose = () => {
  if (props.mode === 'edit') {
    emit('close')
  }
}

const handleSubmit = () => {
  const name = familyName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入家庭名称', icon: 'none' })
    return
  }

  emit('submit', name)
}
</script>

<style lang="scss" scoped>
@use './family-name-modal.scss';
</style>
