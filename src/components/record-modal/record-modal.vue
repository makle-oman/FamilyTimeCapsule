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
            <image
              class="type-icon-img"
              :src="recordType === 'photo' ? '/static/icons/record/photo-active.svg' : '/static/icons/record/photo.svg'"
              mode="aspectFit"
            />
          </view>
          <text class="type-label">Photo</text>
        </view>

        <view
          class="type-item"
          :class="{ active: recordType === 'voice' }"
          @tap="selectType('voice')"
        >
          <view class="type-icon-wrapper" :class="{ active: recordType === 'voice' }">
            <image
              class="type-icon-img"
              :src="recordType === 'voice' ? '/static/icons/record/voice-active.svg' : '/static/icons/record/voice.svg'"
              mode="aspectFit"
            />
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
              <image
                class="voice-icon-img"
                src="/static/icons/record/mic.svg"
                mode="aspectFit"
              />
            </view>
          </view>
          <text class="voice-hint">{{ isRecording ? recordingTime + '"' : 'Hold to record' }}</text>

          <!-- 录音结果 -->
          <view v-if="voiceRecorded" class="voice-result">
            <view class="voice-play" :class="{ playing: isPlaying }" @tap="playRecordedVoice">
              <text>{{ isPlaying ? '⏸' : '▶' }}</text>
            </view>
            <text class="voice-duration">{{ recordedDuration }}"</text>
            <view class="voice-delete" @tap="deleteVoice">Re-record</view>
          </view>
        </view>
      </view>

      <!-- 底部快捷标签 -->
      <view class="bottom-tags">
        <!-- 已有标签 -->
        <view
          v-for="tag in quickTags"
          :key="tag.id"
          class="bottom-tag"
          :class="{ selected: selectedTags.includes(tag.id) }"
          @tap="toggleTag(tag.id)"
          @longpress="showDeleteTag(tag)"
        >
          <text class="tag-text">{{ tag.name }}</text>
          <view v-if="editingTagId === tag.id" class="tag-delete" @tap.stop="deleteTag(tag.id)">×</view>
        </view>

        <!-- 添加标签按钮 -->
        <view class="bottom-tag add-tag-btn" @tap="showAddTagInput">
          <text class="add-tag-icon">+</text>
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

    <!-- 添加标签输入弹窗 - 放在最外层 -->
    <view v-if="showTagInput" class="tag-input-modal" @tap.stop="hideAddTagInput">
      <view class="tag-input-content" @tap.stop>
        <text class="tag-input-title">添加标签</text>
        <input
          class="tag-input"
          v-model="newTagName"
          placeholder="输入标签名称"
          placeholder-class="tag-input-placeholder"
          :maxlength="10"
          focus
          @confirm="confirmAddTag"
        />
        <view class="tag-input-actions">
          <view class="tag-action-btn cancel" @tap.stop="hideAddTagInput">取消</view>
          <view class="tag-action-btn confirm" @tap.stop="confirmAddTag">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { formatDate } from '@/utils/index.js'
import { getTags, createTag, deleteTag as deleteTagApi } from '@/utils/api.js'

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
      quickTags: [],
      isTyping: false,
      isRecording: false,
      recordingTime: 0,
      recordingTimer: null,
      voiceRecorded: false,
      recordedDuration: 0,
      voiceTempFilePath: '', // 录音文件临时路径
      recorderManager: null, // 录音管理器
      innerAudioContext: null, // 音频播放器
      isPlaying: false, // 是否正在播放
      // 标签相关
      showTagInput: false,
      newTagName: '',
      editingTagId: null
    }
  },
  computed: {
    currentDate() {
      return formatDate(Date.now(), 'YYYY/MM/DD')
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadTags()
        this.editingTagId = null
        this.initRecorder()
      } else {
        this.destroyAudio()
      }
    }
  },
  mounted() {
    this.initRecorder()
  },
  beforeDestroy() {
    this.destroyAudio()
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer)
    }
  },
  methods: {
    // 初始化录音管理器
    initRecorder() {
      if (this.recorderManager) return

      this.recorderManager = uni.getRecorderManager()

      // 监听录音结束
      this.recorderManager.onStop((res) => {
        console.log('录音结束:', res)
        if (res.tempFilePath && this.recordingTime >= 1) {
          this.voiceTempFilePath = res.tempFilePath
          this.voiceRecorded = true
          this.recordedDuration = this.recordingTime
        }
      })

      // 监听录音错误
      this.recorderManager.onError((err) => {
        console.error('录音错误:', err)
        this.isRecording = false
        clearInterval(this.recordingTimer)
        uni.showToast({
          title: '录音失败，请检查权限',
          icon: 'none'
        })
      })
    },

    // 销毁音频播放器
    destroyAudio() {
      if (this.innerAudioContext) {
        this.innerAudioContext.stop()
        this.innerAudioContext.destroy()
        this.innerAudioContext = null
      }
      this.isPlaying = false
    },

    // 加载标签
    async loadTags() {
      try {
        const res = await getTags()
        if (res.data) {
          this.quickTags = res.data.map(tag => ({
            id: tag.id,
            name: tag.name
          }))
        }
      } catch (error) {
        console.error('加载标签失败:', error)
      }
    },

    // 显示添加标签输入框
    showAddTagInput() {
      this.showTagInput = true
      this.newTagName = ''
    },

    // 隐藏添加标签输入框
    hideAddTagInput() {
      this.showTagInput = false
      this.newTagName = ''
    },

    // 确认添加标签
    async confirmAddTag() {
      const name = this.newTagName.trim()
      if (!name) {
        uni.showToast({ title: '请输入标签名称', icon: 'none' })
        return
      }

      // 检查重复
      if (this.quickTags.some(t => t.name === name)) {
        uni.showToast({ title: '标签已存在', icon: 'none' })
        return
      }

      try {
        const res = await createTag({ name })
        if (res.data) {
          this.quickTags.push({
            id: res.data.id,
            name: res.data.name
          })
          this.hideAddTagInput()
          uni.showToast({ title: '添加成功', icon: 'success' })
        }
      } catch (error) {
        console.error('添加标签失败:', error)
      }
    },

    // 长按显示删除按钮
    showDeleteTag(tag) {
      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'medium' })
      // #endif
      this.editingTagId = this.editingTagId === tag.id ? null : tag.id
    },

    // 删除标签
    async deleteTag(tagId) {
      try {
        await deleteTagApi(tagId)
        this.quickTags = this.quickTags.filter(t => t.id !== tagId)
        this.selectedTags = this.selectedTags.filter(id => id !== tagId)
        this.editingTagId = null
        uni.showToast({ title: '已删除', icon: 'success' })
      } catch (error) {
        console.error('删除标签失败:', error)
      }
    },

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
      // 如果正在编辑模式，点击不切换选中状态
      if (this.editingTagId === tagId) {
        this.editingTagId = null
        return
      }

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
    startRecording(e) {
      // 阻止事件冒泡，防止触发其他元素
      if (e) e.stopPropagation()

      // 先授权录音权限
      uni.authorize({
        scope: 'scope.record',
        success: () => {
          this.doStartRecording()
        },
        fail: () => {
          uni.showModal({
            title: '需要录音权限',
            content: '请在设置中允许录音权限',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        }
      })
    },
    doStartRecording() {
      this.isRecording = true
      this.recordingTime = 0
      this.voiceRecorded = false
      this.voiceTempFilePath = ''

      // #ifdef MP-WEIXIN
      uni.vibrateShort({ type: 'heavy' })
      // #endif

      this.recordingTimer = setInterval(() => {
        this.recordingTime++
        if (this.recordingTime >= 60) {
          this.stopRecording()
        }
      }, 1000)

      // 确保录音管理器已初始化
      if (!this.recorderManager) {
        this.initRecorder()
      }

      this.recorderManager.start({
        duration: 60000,
        format: 'mp3',
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 128000
      })
    },
    stopRecording(e) {
      // 阻止事件冒泡
      if (e) e.stopPropagation()

      if (!this.isRecording) return
      this.isRecording = false
      clearInterval(this.recordingTimer)

      if (this.recorderManager) {
        this.recorderManager.stop()
      }
    },
    playRecordedVoice() {
      if (!this.voiceTempFilePath) {
        uni.showToast({ title: '没有录音文件', icon: 'none' })
        return
      }

      // 如果正在播放，则停止
      if (this.isPlaying) {
        this.destroyAudio()
        return
      }

      // 创建音频播放器
      this.innerAudioContext = uni.createInnerAudioContext()
      this.innerAudioContext.src = this.voiceTempFilePath

      this.innerAudioContext.onPlay(() => {
        this.isPlaying = true
      })

      this.innerAudioContext.onEnded(() => {
        this.isPlaying = false
      })

      this.innerAudioContext.onError((err) => {
        console.error('播放错误:', err)
        this.isPlaying = false
        uni.showToast({ title: '播放失败', icon: 'none' })
      })

      this.innerAudioContext.play()
    },
    deleteVoice() {
      this.destroyAudio()
      this.voiceRecorded = false
      this.recordedDuration = 0
      this.voiceTempFilePath = ''
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
        voiceFilePath: this.voiceTempFilePath, // 添加录音文件路径
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
      this.voiceTempFilePath = ''
      this.showTagInput = false
      this.newTagName = ''
      this.editingTagId = null
      this.destroyAudio()
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

.type-icon-img {
  width: 48rpx;
  height: 48rpx;
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

.voice-icon-img {
  width: 48rpx;
  height: 48rpx;
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
  transition: all 0.3s ease;

  &.playing {
    background-color: #D4654A;
    animation: pulse 1s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
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
  display: flex;
  align-items: center;
  position: relative;

  &.selected {
    background-color: rgba(224, 122, 95, 0.1);
    border-color: #E07A5F;
    color: #E07A5F;
  }
}

.tag-text {
  font-size: 26rpx;
}

.tag-delete {
  margin-left: 8rpx;
  width: 32rpx;
  height: 32rpx;
  background-color: #E07A5F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFCF8;
  font-size: 24rpx;
  line-height: 1;
}

.add-tag-btn {
  border-style: dashed;
  padding: 12rpx 20rpx;
}

.add-tag-icon {
  font-size: 32rpx;
  color: #C4B8A8;
}

// 标签输入弹窗
.tag-input-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(92, 79, 66, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.tag-input-content {
  min-width: 520rpx;
  background-color: #FFFCF8;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(92, 79, 66, 0.2);
}

.tag-input-title {
  display: block;
  font-size: 32rpx;
  color: #5C4F42;
  font-weight: 500;
  margin-bottom: 32rpx;
  text-align: center;
}

.tag-input {
  width: 90%;
  height: 80rpx;
  background-color: #FAF7F2;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #5C4F42;
}

.tag-input-placeholder {
  color: #C4B8A8;
}

.tag-input-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.tag-action-btn {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;

  &.cancel {
    background-color: #FAF7F2;
    color: #9E8F7D;
  }

  &.confirm {
    background-color: #E07A5F;
    color: #FFFCF8;
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
