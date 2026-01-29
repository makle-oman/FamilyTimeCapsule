<template>
  <view class="record-modal" :class="{ show: visible }" @tap.self="handleClose">
    <!-- 半透明遮罩 -->
    <view class="modal-overlay" @tap.stop="handleClose"></view>

    <!-- 模态内容 -->
    <view class="modal-content" :class="{ 'slide-up': visible }" @tap.stop>
      <!-- 拖动条 -->
      <view class="drag-bar-wrapper">
        <view class="drag-bar"></view>
      </view>

      <!-- 头部标题 -->
      <view class="modal-header">
        <text class="modal-title">New Memory</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <!-- 记录类型选择 -->
      <view class="record-types">
        <view
          class="type-item"
          :class="{ active: recordType === 'text' }"
          @tap="selectType('text')"
        >
          <view class="type-icon-wrapper" :class="{ active: recordType === 'text' }">
            <text class="type-icon-text">T</text>
          </view>
          <text class="type-label">Text</text>
        </view>

        <view
          class="type-item"
          :class="{ active: recordType === 'photo' }"
          @tap="selectType('photo')"
        >
          <view class="type-icon-wrapper" :class="{ active: recordType === 'photo' }">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-8c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
                :fill="recordType === 'photo' ? '#E07A5F' : '#9E8F7D'"
              />
              <rect x="3" y="14" width="18" height="8" rx="2" :fill="recordType === 'photo' ? '#E07A5F' : '#9E8F7D'" />
            </svg>
          </view>
          <text class="type-label">Photo</text>
        </view>

        <view
          class="type-item"
          :class="{ active: recordType === 'voice' }"
          @tap="selectType('voice')"
        >
          <view class="type-icon-wrapper" :class="{ active: recordType === 'voice' }">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                :fill="recordType === 'voice' ? '#E07A5F' : '#9E8F7D'"
              />
            </svg>
          </view>
          <text class="type-label">Voice</text>
        </view>
      </view>

      <!-- 输入区域 - 信纸纹理背景 -->
      <view class="input-area">
        <!-- 日期显示 -->
        <view class="date-display">
          <text class="date-text">{{ currentDate }}</text>
        </view>

        <!-- 信纸横线 -->
        <view class="paper-lines">
          <view v-for="i in 8" :key="i" class="paper-line"></view>
        </view>

        <!-- 文字输入 -->
        <view v-if="recordType === 'text'" class="text-input-wrapper">
          <textarea
            class="text-input"
            v-model="textContent"
            placeholder="Write down the moment..."
            placeholder-class="input-placeholder"
            :maxlength="500"
            @focus="onInputFocus"
            @blur="onInputBlur"
          />
        </view>

        <!-- 图片预览 -->
        <view v-if="recordType === 'photo'" class="photo-area">
          <view class="photo-grid">
            <view
              v-for="(img, index) in selectedImages"
              :key="index"
              class="photo-item"
            >
              <image :src="img" mode="aspectFill" class="photo-preview" />
              <view class="photo-delete" @tap="removeImage(index)">×</view>
            </view>
            <view v-if="selectedImages.length < 9" class="photo-add" @tap="chooseImage">
              <text class="add-icon">+</text>
            </view>
          </view>
          <textarea
            class="text-input photo-desc"
            v-model="textContent"
            placeholder="Write down the moment..."
            placeholder-class="input-placeholder"
            :maxlength="200"
          />
        </view>

        <!-- 语音录制 -->
        <view v-if="recordType === 'voice'" class="voice-area">
          <view
            class="voice-record-btn"
            :class="{ recording: isRecording, ripple: isRecording }"
            @touchstart="startRecording"
            @touchend="stopRecording"
          >
            <view class="voice-inner">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path
                  d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  fill="#FFFCF8"
                />
              </svg>
            </view>
          </view>
          <text class="voice-hint">{{ isRecording ? recordingTime + '"' : 'Hold to record' }}</text>

          <!-- 录音结果 -->
          <view v-if="voiceRecorded" class="voice-result">
            <view class="voice-play" @tap="playRecordedVoice">
              <text>▶</text>
            </view>
            <text class="voice-duration">{{ recordedDuration }}"</text>
            <view class="voice-delete" @tap="deleteVoice">Re-record</view>
          </view>
        </view>
      </view>

      <!-- 底部快捷标签 -->
      <view class="bottom-tags">
        <view
          v-for="tag in quickTags"
          :key="tag.id"
          class="bottom-tag"
          :class="{ selected: selectedTags.includes(tag.id) }"
          @tap="toggleTag(tag.id)"
        >
          #{{ tag.name }}
        </view>
      </view>

      <!-- 记录按钮 -->
      <view class="submit-section">
        <view
          class="submit-btn"
          :class="{ disabled: !canPublish() }"
          @tap="handleSubmit"
        >
          <text class="submit-text">记录此刻</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDate } from '@/utils/index.js'

export default {
  name: 'RecordModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      recordType: 'text',
      textContent: '',
      selectedImages: [],
      selectedTags: [],
      quickTags: [
        { id: 'happy', name: 'Happy' },
        { id: 'firsttime', name: 'FirstTime' },
        { id: 'funny', name: 'Funny' },
        { id: 'together', name: 'Together' }
      ],
      isTyping: false,
      isRecording: false,
      recordingTime: 0,
      recordingTimer: null,
      voiceRecorded: false,
      recordedDuration: 0
    }
  },
  computed: {
    currentDate() {
      return formatDate(Date.now(), 'YYYY/MM/DD')
    }
  },
  watch: {
    visible(val) {
      if (val && this.canPublish()) {
        // 自动保存逻辑可在此添加
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
      this.resetForm()
    },
    handleSubmit() {
      if (!this.canPublish()) return
      this.submitRecord()
      this.$emit('close')
      this.resetForm()
    },
    selectType(type) {
      this.recordType = type
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'light' })
      // #endif
    },
    toggleTag(tagId) {
      const index = this.selectedTags.indexOf(tagId)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tagId)
      }
    },
    onInputFocus() {
      this.isTyping = true
    },
    onInputBlur() {
      this.isTyping = false
    },
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.selectedImages.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.selectedImages = [...this.selectedImages, ...res.tempFilePaths]
        }
      })
    },
    removeImage(index) {
      this.selectedImages.splice(index, 1)
    },
    startRecording() {
      this.isRecording = true
      this.recordingTime = 0
      this.voiceRecorded = false

      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'heavy' })
      // #endif

      this.recordingTimer = setInterval(() => {
        this.recordingTime++
        if (this.recordingTime >= 60) {
          this.stopRecording()
        }
      }, 1000)

      const recorderManager = uni.getRecorderManager()
      recorderManager.start({
        duration: 60000,
        format: 'mp3'
      })
    },
    stopRecording() {
      if (!this.isRecording) return
      this.isRecording = false
      clearInterval(this.recordingTimer)

      if (this.recordingTime >= 1) {
        this.voiceRecorded = true
        this.recordedDuration = this.recordingTime
      }

      const recorderManager = uni.getRecorderManager()
      recorderManager.stop()
    },
    playRecordedVoice() {
      // TODO: 播放录制的语音
    },
    deleteVoice() {
      this.voiceRecorded = false
      this.recordedDuration = 0
    },
    submitRecord() {
      if (!this.canPublish()) return

      const recordData = {
        type: this.recordType,
        content: this.textContent,
        images: this.selectedImages,
        tags: this.selectedTags.map(id => {
          const tag = this.quickTags.find(t => t.id === id)
          return tag ? tag.name : id
        }),
        voiceDuration: this.recordedDuration,
        createTime: Date.now()
      }

      this.$emit('submit', recordData)
    },
    canPublish() {
      if (this.recordType === 'text' && this.textContent.trim()) return true
      if (this.recordType === 'photo' && this.selectedImages.length > 0) return true
      if (this.recordType === 'voice' && this.voiceRecorded) return true
      return false
    },
    resetForm() {
      this.recordType = 'text'
      this.textContent = ''
      this.selectedImages = []
      this.selectedTags = []
      this.isRecording = false
      this.voiceRecorded = false
      this.recordedDuration = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.record-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.show {
    pointer-events: auto;
    opacity: 1;
  }
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(230, 222, 212, 0.6);
  backdrop-filter: blur(10rpx);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFCF8;
  border-radius: 40rpx 40rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.slide-up {
  transform: translateY(0);
}

// 拖动条
.drag-bar-wrapper {
  display: flex;
  justify-content: center;
  padding: 16rpx 0;
}

.drag-bar {
  width: 64rpx;
  height: 6rpx;
  background-color: #E8E4DF;
  border-radius: 3rpx;
}

// 头部
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 32rpx 24rpx;
}

.modal-title {
  font-size: 32rpx;
  color: #5C4F42;
  font-weight: 500;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 36rpx;
  color: #9E8F7D;
  line-height: 1;
}

// 记录类型选择
.record-types {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  padding: 16rpx 32rpx 32rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.type-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #FAF7F2;
  border: 2rpx solid #E8E4DF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &.active {
    background-color: rgba(224, 122, 95, 0.1);
    border-color: #E07A5F;
  }
}

.type-icon-text {
  font-size: 36rpx;
  font-weight: 500;
  color: #9E8F7D;
  font-family: serif;

  .type-icon-wrapper.active & {
    color: #E07A5F;
  }
}

.type-label {
  font-size: 24rpx;
  color: #9E8F7D;

  .type-item.active & {
    color: #E07A5F;
  }
}

// 输入区域 - 信纸效果
.input-area {
  margin: 0 32rpx;
  padding: 24rpx 28rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
  position: relative;
  min-height: 400rpx;
  flex: 1;
}

// 日期显示
.date-display {
  position: relative;
  z-index: 2;
  margin-bottom: 16rpx;
}

.date-text {
  font-size: 26rpx;
  color: #9E8F7D;
  font-style: italic;
}

// 信纸横线
.paper-lines {
  position: absolute;
  top: 90rpx;
  left: 28rpx;
  right: 28rpx;
  bottom: 28rpx;
  pointer-events: none;
}

.paper-line {
  height: 1rpx;
  background-color: #E8E4DF;
  margin-bottom: 52rpx;
}

// 文字输入
.text-input-wrapper {
  position: relative;
  z-index: 1;
}

.text-input {
  width: 100%;
  min-height: 320rpx;
  font-size: 30rpx;
  color: #5C4F42;
  line-height: 54rpx;
  background: transparent;
}

.input-placeholder {
  color: #C4B8A8;
  font-style: italic;
}

// 图片区域
.photo-area {
  position: relative;
  z-index: 1;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.photo-item {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}

.photo-preview {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  background-color: rgba(92, 79, 66, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFCF8;
  font-size: 28rpx;
}

.photo-add {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #C4B8A8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 56rpx;
  color: #C4B8A8;
}

.photo-desc {
  min-height: 120rpx;
}

// 语音区域
.voice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  position: relative;
  z-index: 1;
}

.voice-record-btn {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #E07A5F 0%, #D4654A 100%);
  box-shadow: 0 8rpx 24rpx rgba(224, 122, 95, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;

  &.recording {
    transform: scale(1.1);
    box-shadow: 0 12rpx 32rpx rgba(224, 122, 95, 0.4);
  }
}

// 水波纹效果
.ripple::before,
.ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4rpx solid #E07A5F;
  transform: translate(-50%, -50%);
  animation: rippleAnim 1s ease-out infinite;
}

.ripple::after {
  animation-delay: 0.5s;
}

@keyframes rippleAnim {
  0% {
    width: 100%;
    height: 100%;
    opacity: 0.6;
  }
  100% {
    width: 200%;
    height: 200%;
    opacity: 0;
  }
}

.voice-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-hint {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #9E8F7D;
}

.voice-result {
  display: flex;
  align-items: center;
  margin-top: 32rpx;
  padding: 20rpx 32rpx;
  background-color: rgba(224, 122, 95, 0.1);
  border-radius: 40rpx;
}

.voice-play {
  width: 48rpx;
  height: 48rpx;
  background-color: #E07A5F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFCF8;
  font-size: 20rpx;
}

.voice-duration {
  margin: 0 24rpx;
  font-size: 28rpx;
  color: #5C4F42;
}

.voice-delete {
  font-size: 26rpx;
  color: #9E8F7D;
}

// 底部标签
.bottom-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 32rpx;
  padding-bottom: 24rpx;
}

.bottom-tag {
  padding: 12rpx 24rpx;
  background-color: #FFFCF8;
  border: 2rpx solid #E8E4DF;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #9E8F7D;
  transition: all 0.3s ease;

  &.selected {
    background-color: rgba(224, 122, 95, 0.1);
    border-color: #E07A5F;
    color: #E07A5F;
  }
}

// 提交按钮
.submit-section {
  padding: 16rpx 32rpx 48rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #E07A5F 0%, #D4654A 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(224, 122, 95, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(224, 122, 95, 0.3);
  }

  &.disabled {
    background: #E8E4DF;
    box-shadow: none;
  }
}

.submit-text {
  font-size: 32rpx;
  color: #FFFCF8;
  font-weight: 500;
}
</style>
