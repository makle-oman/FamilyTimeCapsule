<template>
  <view class="record-modal" :class="{ show: visible }" @tap.self="handleClose">
    <!-- 半透明遮罩 -->
    <view class="modal-overlay" @tap="handleClose"></view>

    <!-- 模态内容 -->
    <view class="modal-content" :class="{ 'slide-up': visible }">
      <!-- 拖动条 -->
      <view class="drag-bar-wrapper">
        <view class="drag-bar"></view>
      </view>

      <!-- 头部标题 -->
      <view class="modal-header">
        <text class="modal-title">记录此刻</text>
        <view class="close-btn" @tap="handleClose">
          <text class="close-icon">×</text>
        </view>
      </view>

      <!-- 记录类型选择 -->
      <view class="record-types">
        <view
          class="type-item"
          :class="{ active: recordType === 'photo' }"
          @tap="selectType('photo')"
        >
          <view class="type-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path
                d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0-8c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm9 13.5V15c0-.55-.45-1-1-1h-1.5c-.55 0-1 .45-1 1v1h-3v-1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v1h-3v-1c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v2.5c0 1.93 1.57 3.5 3.5 3.5h13c1.93 0 3.5-1.57 3.5-3.5z"
                :fill="recordType === 'photo' ? '#E07A5F' : '#C4B8A8'"
              />
            </svg>
          </view>
          <text class="type-label">拍照</text>
        </view>

        <view
          class="type-item"
          :class="{ active: recordType === 'voice' }"
          @tap="selectType('voice')"
        >
          <view class="type-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path
                d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                :fill="recordType === 'voice' ? '#E07A5F' : '#C4B8A8'"
              />
            </svg>
          </view>
          <text class="type-label">语音</text>
        </view>

        <view
          class="type-item"
          :class="{ active: recordType === 'text' }"
          @tap="selectType('text')"
        >
          <view class="type-icon">
            <svg viewBox="0 0 24 24" width="48" height="48">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                :fill="recordType === 'text' ? '#E07A5F' : '#C4B8A8'"
              />
            </svg>
          </view>
          <text class="type-label">文字</text>
        </view>
      </view>

      <!-- 快捷标签 -->
      <view class="quick-tags">
        <scroll-view scroll-x class="tags-scroll">
          <view
            v-for="tag in quickTags"
            :key="tag"
            class="quick-tag"
            :class="{ selected: selectedTags.includes(tag) }"
            @tap="toggleTag(tag)"
          >
            {{ tag }}
          </view>
        </scroll-view>
      </view>

      <!-- 输入区域 - 信纸纹理背景 -->
      <view class="input-area" :class="{ 'candle-light': isTyping }">
        <!-- 信纸横线 -->
        <view class="paper-lines">
          <view v-for="i in 10" :key="i" class="paper-line"></view>
        </view>

        <!-- 文字输入 -->
        <view v-if="recordType === 'text'" class="text-input-wrapper">
          <textarea
            class="text-input"
            v-model="textContent"
            placeholder="写下这一刻的想法..."
            placeholder-class="input-placeholder"
            :maxlength="500"
            @focus="onInputFocus"
            @blur="onInputBlur"
          />
          <text class="char-count">{{ textContent.length }}/500</text>
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
            placeholder="说点什么..."
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
          <text class="voice-hint">{{ isRecording ? recordingTime + '"' : '按住录音' }}</text>

          <!-- 录音结果 -->
          <view v-if="voiceRecorded" class="voice-result">
            <view class="voice-play" @tap="playRecordedVoice">
              <text>▶</text>
            </view>
            <text class="voice-duration">{{ recordedDuration }}"</text>
            <view class="voice-delete" @tap="deleteVoice">重录</view>
          </view>
        </view>
      </view>

      <!-- 发布按钮 - 封存此刻 -->
      <view class="publish-area">
        <view
          class="publish-btn"
          :class="{ sealing: isSealing, 'envelope-closed': sealComplete }"
          @touchstart="startSeal"
          @touchend="cancelSeal"
        >
          <view class="envelope-body">
            <view class="envelope-flap" :style="{ transform: `rotateX(${flapAngle}deg)` }"></view>
            <view class="envelope-content">
              <text class="publish-text">{{ isSealing ? '封存中...' : '封存此刻' }}</text>
            </view>
          </view>
          <!-- 进度条 -->
          <view class="seal-progress" :style="{ width: sealProgress + '%' }"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
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
      quickTags: ['日常', '美食', '出行', '成长', '纪念日', '心情', '感恩'],
      isTyping: false,
      isRecording: false,
      recordingTime: 0,
      recordingTimer: null,
      voiceRecorded: false,
      recordedDuration: 0,
      isSealing: false,
      sealProgress: 0,
      sealTimer: null,
      sealComplete: false,
      flapAngle: 0
    }
  },
  methods: {
    handleClose() {
      if (this.isSealing) return
      this.$emit('close')
      this.resetForm()
    },
    selectType(type) {
      this.recordType = type
      // 轻震动反馈
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'light' })
      // #endif
    },
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag)
      if (index > -1) {
        this.selectedTags.splice(index, 1)
      } else {
        this.selectedTags.push(tag)
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

      // 播放开始录音音效
      // TODO: 播放风铃音效

      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'heavy' })
      // #endif

      this.recordingTimer = setInterval(() => {
        this.recordingTime++
        if (this.recordingTime >= 60) {
          this.stopRecording()
        }
      }, 1000)

      // 开始录音
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

      // 播放结束录音音效
      // TODO: 播放封蜡音效

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
    startSeal() {
      // 检查是否有内容
      if (!this.canPublish()) {
        uni.showToast({
          title: '请先记录点什么',
          icon: 'none'
        })
        return
      }

      this.isSealing = true
      this.sealProgress = 0
      this.flapAngle = 0

      // 长按1.5秒完成封存
      const startTime = Date.now()
      this.sealTimer = setInterval(() => {
        const elapsed = Date.now() - startTime
        this.sealProgress = Math.min((elapsed / 1500) * 100, 100)
        this.flapAngle = Math.min((elapsed / 1500) * 180, 180)

        if (this.sealProgress >= 100) {
          this.completeSeal()
        }
      }, 16)
    },
    cancelSeal() {
      if (this.sealProgress < 100) {
        clearInterval(this.sealTimer)
        this.isSealing = false
        this.sealProgress = 0
        this.flapAngle = 0
      }
    },
    completeSeal() {
      clearInterval(this.sealTimer)
      this.sealComplete = true

      // 震动反馈
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'heavy' })
      // #endif

      // 播放纸张摩擦声
      // TODO: 播放音效

      // 提交数据
      const recordData = {
        type: this.recordType,
        content: this.textContent,
        images: this.selectedImages,
        tags: this.selectedTags,
        voiceDuration: this.recordedDuration,
        createTime: Date.now()
      }

      this.$emit('submit', recordData)

      // 延迟关闭,显示飞走动画
      setTimeout(() => {
        this.handleClose()
        this.sealComplete = false
        uni.showToast({
          title: '已封存',
          icon: 'success'
        })
      }, 800)
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
      this.isSealing = false
      this.sealProgress = 0
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
  height: 85vh;
  background-color: #FAF7F2;
  border-radius: 40rpx 40rpx 0 0;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}

.slide-up {
  transform: translateY(0);
}

// 拖动条
.drag-bar-wrapper {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.drag-bar {
  width: 80rpx;
  height: 8rpx;
  background-color: #C4B8A8;
  border-radius: 4rpx;
}

// 头部
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx 24rpx;
}

.modal-title {
  font-size: 36rpx;
  color: #5C4F42;
  font-weight: 500;
}

.close-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(196, 184, 168, 0.2);
}

.close-icon {
  font-size: 40rpx;
  color: #9E8F7D;
  line-height: 1;
}

// 记录类型选择
.record-types {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 32rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  border-radius: 24rpx;
  transition: all 0.3s ease;

  &.active {
    background-color: rgba(224, 122, 95, 0.1);
  }
}

.type-icon {
  margin-bottom: 12rpx;
}

.type-label {
  font-size: 26rpx;
  color: #9E8F7D;

  .active & {
    color: #E07A5F;
  }
}

// 快捷标签
.quick-tags {
  padding: 0 32rpx 24rpx;
}

.tags-scroll {
  white-space: nowrap;
}

.quick-tag {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
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

// 输入区域 - 信纸效果
.input-area {
  margin: 0 32rpx;
  padding: 32rpx;
  background-color: #FFFCF8;
  border-radius: 24rpx;
  border: 2rpx solid #E8E4DF;
  position: relative;
  min-height: 300rpx;
  transition: all 0.3s ease;
}

// 烛光呼吸效果
.candle-light {
  animation: candleBreath 4s ease-in-out infinite;
}

@keyframes candleBreath {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.98; }
}

// 信纸横线
.paper-lines {
  position: absolute;
  top: 60rpx;
  left: 32rpx;
  right: 32rpx;
  bottom: 32rpx;
  pointer-events: none;
}

.paper-line {
  height: 2rpx;
  background-color: #F0EBE5;
  margin-bottom: 48rpx;
}

// 文字输入
.text-input-wrapper {
  position: relative;
  z-index: 1;
}

.text-input {
  width: 100%;
  min-height: 240rpx;
  font-size: 32rpx;
  color: #5C4F42;
  line-height: 50rpx;
  background: transparent;
}

.input-placeholder {
  color: #C4B8A8;
}

.char-count {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 24rpx;
  color: #C4B8A8;
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
  border-radius: 16rpx;
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
  border-radius: 16rpx;
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
  min-height: 80rpx;
}

// 语音区域
.voice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
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

// 发布区域
.publish-area {
  padding: 32rpx;
  position: absolute;
  bottom: 40rpx;
  left: 0;
  right: 0;
}

.publish-btn {
  position: relative;
  width: 100%;
  height: 100rpx;
  background-color: #E8DCC4;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(196, 184, 168, 0.3);
}

.envelope-body {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.envelope-flap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background-color: #D4C4A8;
  transform-origin: top center;
  border-radius: 16rpx 16rpx 0 0;
}

.envelope-content {
  position: relative;
  z-index: 1;
}

.publish-text {
  font-size: 32rpx;
  color: #5C4F42;
  font-weight: 500;
}

.seal-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #E07A5F 0%, #D4654A 100%);
  transition: width 0.05s linear;
}

.envelope-closed {
  animation: flyAway 0.8s ease-out forwards;
}

@keyframes flyAway {
  0% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-400rpx) rotate(-5deg) scale(0.8);
  }
}
</style>
