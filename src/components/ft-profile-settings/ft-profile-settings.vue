<template>
  <view v-if="visible" class="profile-settings-popup" @tap="handleClose">
    <view class="settings-content" @tap.stop>
      <!-- 头部 -->
      <view class="settings-header">
        <text class="settings-title">个人设置</text>
        <view class="settings-close" @tap="handleClose">
          <text>×</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <scroll-view scroll-y class="settings-body">
        <!-- 当前头像预览 -->
        <view class="current-avatar-section">
          <view class="avatar-preview" :style="currentAvatarStyle">
            <text v-if="currentAvatarInfo.type === 'default'" class="avatar-emoji">
              {{ currentAvatarInfo.emoji }}
            </text>
            <image
              v-else
              :src="currentAvatarInfo.url"
              mode="aspectFill"
              class="avatar-image"
            />
          </view>
          <text class="avatar-hint">点击下方选择新头像</text>
        </view>

        <!-- 昵称输入 -->
        <view class="form-section">
          <view class="form-label">昵称</view>
          <view class="form-input-wrapper">
            <input
              v-model="nickname"
              type="text"
              class="form-input"
              placeholder="请输入昵称"
              maxlength="20"
            />
            <text class="char-count">{{ nickname.length }}/20</text>
          </view>
        </view>

        <!-- 默认头像选择 -->
        <view class="form-section">
          <view class="form-label">选择头像</view>
          <view class="avatar-grid">
            <view
              v-for="item in defaultAvatars"
              :key="item.id"
              class="avatar-option"
              :class="{ selected: selectedAvatar === item.id }"
              @tap="selectAvatar(item.id)"
            >
              <view class="avatar-circle" :style="{ backgroundColor: item.color }">
                <text class="avatar-emoji">{{ item.emoji }}</text>
              </view>
              <text class="avatar-name">{{ item.name }}</text>
              <view v-if="selectedAvatar === item.id" class="selected-check">✓</view>
            </view>
          </view>
        </view>

        <!-- 自定义上传 -->
        <view class="upload-section" @tap="chooseCustomAvatar">
          <view class="upload-icon-wrapper">
            <text class="upload-icon">+</text>
          </view>
          <view class="upload-text">
            <text class="upload-title">上传自定义头像</text>
            <text class="upload-desc">从相册选择一张照片</text>
          </view>
          <text class="upload-arrow">›</text>
        </view>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="settings-footer">
        <button class="cancel-btn" @tap="handleClose">取消</button>
        <button class="save-btn" :disabled="saving" @tap="handleSave">
          {{ saving ? '保存中...' : '保存' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DEFAULT_AVATARS, getAvatarInfo } from '@/utils/index.js'
import { updateProfile } from '@/utils/api.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'updated'])

const defaultAvatars = DEFAULT_AVATARS
const nickname = ref('')
const selectedAvatar = ref('')
const customAvatarUrl = ref('')
const saving = ref(false)

// 当前显示的头像信息
const currentAvatarInfo = computed(() => {
  if (customAvatarUrl.value) {
    return { type: 'custom', url: customAvatarUrl.value }
  }
  if (selectedAvatar.value) {
    return getAvatarInfo(selectedAvatar.value)
  }
  return getAvatarInfo(props.userInfo.avatar)
})

// 当前头像样式
const currentAvatarStyle = computed(() => {
  if (currentAvatarInfo.value.type === 'default') {
    return { backgroundColor: currentAvatarInfo.value.color }
  }
  return {}
})

// 监听visible和userInfo变化，初始化数据
watch([() => props.visible, () => props.userInfo], ([visible, userInfo]) => {
  if (visible && userInfo) {
    nickname.value = userInfo.nickname || ''
    selectedAvatar.value = userInfo.avatar || ''
    customAvatarUrl.value = ''
  }
}, { immediate: true })

// 选择默认头像
function selectAvatar(id) {
  selectedAvatar.value = id
  customAvatarUrl.value = ''
}

// 选择自定义头像
function chooseCustomAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      customAvatarUrl.value = res.tempFilePaths[0]
      selectedAvatar.value = ''
    }
  })
}

// 关闭弹窗
function handleClose() {
  emit('close')
}

// 保存
async function handleSave() {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  saving.value = true
  try {
    // 确定最终头像
    let avatar = selectedAvatar.value
    if (customAvatarUrl.value) {
      // TODO: 上传自定义头像到服务器，获取URL
      // 目前先用本地路径，实际需要实现图片上传
      avatar = customAvatarUrl.value
    }

    await updateProfile({
      nickname: nickname.value.trim(),
      avatar: avatar
    })

    uni.showToast({ title: '保存成功', icon: 'success' })
    emit('updated', {
      nickname: nickname.value.trim(),
      avatar: avatar
    })
    emit('close')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" src="./profile-settings.scss"></style>
