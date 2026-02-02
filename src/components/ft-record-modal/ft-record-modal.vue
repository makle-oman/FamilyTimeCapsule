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
              :src="recordType === 'photo' ? '/static/icons/record/photo-active.png' : '/static/icons/record/photo.png'"
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
              :src="recordType === 'voice' ? '/static/icons/record/voice-active.png' : '/static/icons/record/voice.png'"
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
                src="/static/icons/record/mic.png"
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
          <view v-if="editingTagId === tag.id" class="tag-delete" @tap.stop="handleDeleteTag(tag.id)">×</view>
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
          :class="{ disabled: !canPublish }"
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

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { formatDate } from '@/utils/index.js'
import { getTags, createTag, deleteTag as deleteTagApi } from '@/utils/api.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const recordType = ref('text')
const textContent = ref('')
const selectedImages = ref([])
const selectedTags = ref([])
const quickTags = ref([])
const isTyping = ref(false)
const isRecording = ref(false)
const recordingTime = ref(0)
let recordingTimer = null
const voiceRecorded = ref(false)
const recordedDuration = ref(0)
const voiceTempFilePath = ref('')
let recorderManager = null
let innerAudioContext = null
const isPlaying = ref(false)
const showTagInput = ref(false)
const newTagName = ref('')
const editingTagId = ref(null)

const currentDate = computed(() => formatDate(Date.now(), 'YYYY/MM/DD'))

const canPublish = computed(() => {
  if (recordType.value === 'text' && textContent.value.trim()) return true
  if (recordType.value === 'photo' && selectedImages.value.length > 0) return true
  if (recordType.value === 'voice' && voiceRecorded.value) return true
  return false
})

watch(() => props.visible, (val) => {
  if (val) {
    loadTags()
    editingTagId.value = null
    initRecorder()
  } else {
    destroyAudio()
  }
})

onMounted(() => {
  initRecorder()
})

onBeforeUnmount(() => {
  destroyAudio()
  if (recordingTimer) {
    clearInterval(recordingTimer)
  }
})

const initRecorder = () => {
  if (recorderManager) return

  recorderManager = uni.getRecorderManager()

  recorderManager.onStop((res) => {
    if (res.tempFilePath && recordingTime.value >= 1) {
      voiceTempFilePath.value = res.tempFilePath
      voiceRecorded.value = true
      recordedDuration.value = recordingTime.value
    }
  })

  recorderManager.onError((err) => {
    console.error('录音错误:', err)
    isRecording.value = false
    clearInterval(recordingTimer)
    uni.showToast({ title: '录音失败，请检查权限', icon: 'none' })
  })
}

const destroyAudio = () => {
  if (innerAudioContext) {
    innerAudioContext.stop()
    innerAudioContext.destroy()
    innerAudioContext = null
  }
  isPlaying.value = false
}

const loadTags = async () => {
  try {
    const res = await getTags()
    if (res.data) {
      quickTags.value = res.data.map(tag => ({ id: tag.id, name: tag.name }))
    }
  } catch (error) {
    console.error('加载标签失败:', error)
  }
}

const showAddTagInput = () => {
  showTagInput.value = true
  newTagName.value = ''
}

const hideAddTagInput = () => {
  showTagInput.value = false
  newTagName.value = ''
}

const confirmAddTag = async () => {
  const name = newTagName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入标签名称', icon: 'none' })
    return
  }

  if (quickTags.value.some(t => t.name === name)) {
    uni.showToast({ title: '标签已存在', icon: 'none' })
    return
  }

  try {
    const res = await createTag({ name })
    if (res.data) {
      quickTags.value.push({ id: res.data.id, name: res.data.name })
      hideAddTagInput()
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
  } catch (error) {
    console.error('添加标签失败:', error)
  }
}

const showDeleteTag = (tag) => {
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'medium' })
  // #endif
  editingTagId.value = editingTagId.value === tag.id ? null : tag.id
}

const handleDeleteTag = async (tagId) => {
  try {
    await deleteTagApi(tagId)
    quickTags.value = quickTags.value.filter(t => t.id !== tagId)
    selectedTags.value = selectedTags.value.filter(id => id !== tagId)
    editingTagId.value = null
    uni.showToast({ title: '已删除', icon: 'success' })
  } catch (error) {
    console.error('删除标签失败:', error)
  }
}

const handleClose = () => {
  emit('close')
  resetForm()
}

const handleSubmit = () => {
  if (!canPublish.value) return
  submitRecord()
  emit('close')
  resetForm()
}

const selectType = (type) => {
  recordType.value = type
  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'light' })
  // #endif
}

const toggleTag = (tagId) => {
  if (editingTagId.value === tagId) {
    editingTagId.value = null
    return
  }

  const index = selectedTags.value.indexOf(tagId)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagId)
  }
}

const onInputFocus = () => { isTyping.value = true }
const onInputBlur = () => { isTyping.value = false }

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - selectedImages.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      selectedImages.value = [...selectedImages.value, ...res.tempFilePaths]
    }
  })
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
}

const startRecording = (e) => {
  if (e) e.stopPropagation()

  uni.authorize({
    scope: 'scope.record',
    success: () => { doStartRecording() },
    fail: () => {
      uni.showModal({
        title: '需要录音权限',
        content: '请在设置中允许录音权限',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) uni.openSetting()
        }
      })
    }
  })
}

const doStartRecording = () => {
  isRecording.value = true
  recordingTime.value = 0
  voiceRecorded.value = false
  voiceTempFilePath.value = ''

  // #ifdef MP-WEIXIN
  uni.vibrateShort({ type: 'heavy' })
  // #endif

  recordingTimer = setInterval(() => {
    recordingTime.value++
    if (recordingTime.value >= 60) {
      stopRecording()
    }
  }, 1000)

  if (!recorderManager) {
    initRecorder()
  }

  recorderManager.start({
    duration: 60000,
    format: 'mp3',
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 128000
  })
}

const stopRecording = (e) => {
  if (e) e.stopPropagation()
  if (!isRecording.value) return
  isRecording.value = false
  clearInterval(recordingTimer)

  if (recorderManager) {
    recorderManager.stop()
  }
}

const playRecordedVoice = () => {
  if (!voiceTempFilePath.value) {
    uni.showToast({ title: '没有录音文件', icon: 'none' })
    return
  }

  if (isPlaying.value) {
    destroyAudio()
    return
  }

  innerAudioContext = uni.createInnerAudioContext()
  innerAudioContext.src = voiceTempFilePath.value

  innerAudioContext.onPlay(() => { isPlaying.value = true })
  innerAudioContext.onEnded(() => { isPlaying.value = false })
  innerAudioContext.onError((err) => {
    console.error('播放错误:', err)
    isPlaying.value = false
    uni.showToast({ title: '播放失败', icon: 'none' })
  })

  innerAudioContext.play()
}

const deleteVoice = () => {
  destroyAudio()
  voiceRecorded.value = false
  recordedDuration.value = 0
  voiceTempFilePath.value = ''
}

const submitRecord = () => {
  if (!canPublish.value) return

  const recordData = {
    type: recordType.value,
    content: textContent.value,
    images: selectedImages.value,
    tags: selectedTags.value.map(id => {
      const tag = quickTags.value.find(t => t.id === id)
      return tag ? tag.name : id
    }),
    voiceDuration: recordedDuration.value,
    voiceFilePath: voiceTempFilePath.value,
    createTime: Date.now()
  }

  emit('submit', recordData)
}

const resetForm = () => {
  recordType.value = 'text'
  textContent.value = ''
  selectedImages.value = []
  selectedTags.value = []
  isRecording.value = false
  voiceRecorded.value = false
  recordedDuration.value = 0
  voiceTempFilePath.value = ''
  showTagInput.value = false
  newTagName.value = ''
  editingTagId.value = null
  destroyAudio()
}
</script>

<style lang="scss" scoped>
@use './record-modal.scss';
</style>
