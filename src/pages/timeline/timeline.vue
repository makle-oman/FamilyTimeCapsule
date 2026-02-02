<template>
  <view class="page-wrapper" :class="fontClass">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 家庭名称头部 -->
    <view class="family-header">
      <view class="family-info">
        <text class="family-name">{{ familyName }}</text>
        <text class="family-year">成立 {{ establishedYear }}</text>
      </view>
      <view class="edit-name-btn" @tap="openEditName">
        <text class="edit-icon">✎</text>
      </view>
    </view>

    <!-- 记忆唤醒条 -->
    <view
      v-if="todayMemory"
      class="memory-reminder"
      :class="{ 'slide-in': showReminder }"
      @tap="openMemoryDetail"
    >
      <view class="reminder-mark"></view>
      <view class="reminder-content">
        <text class="reminder-title">{{ todayMemory.title || '365天前的今天' }}</text>
        <text class="reminder-preview">{{ todayMemory.preview }}</text>
      </view>
      <view class="reminder-arrow">›</view>
    </view>

    <!-- 家庭头像栏 -->
    <view class="family-avatars">
      <scroll-view scroll-x class="avatars-scroll">
        <view
          v-for="member in familyMembers"
          :key="member.id"
          class="member-avatar"
          :class="{ online: member.online }"
        >
          <image
            :src="member.avatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
            class="avatar-img"
          />
          <text class="member-name">{{ member.name }}</text>
        </view>
        <view class="add-member" @tap="addMember">
          <text class="add-icon">+</text>
        </view>
      </scroll-view>
    </view>

    <!-- 日记卡片流 -->
    <scroll-view
      scroll-y
      class="timeline-scroll"
      @scrolltolower="loadMore"
      :scroll-top="scrollTop"
    >
      <!-- 日期分隔线 -->
      <view v-for="(group, date) in groupedMemories" :key="date">
        <view class="date-divider">
          <view class="date-line"></view>
          <text class="date-text">{{ date }}</text>
          <view class="date-line"></view>
        </view>

        <!-- 日记卡片 -->
        <ft-memory-card
          v-for="memory in group"
          :key="memory.id"
          :memory="memory"
          :is-old-memory="memory.isOldMemory"
          @resonance="handleResonance"
          @playVoice="handlePlayVoice"
        />
      </view>

      <!-- 空状态 -->
      <view v-if="!memories.length && !loading" class="empty-state">
        <view class="empty-illustration">
          <view class="empty-book"></view>
        </view>
        <text class="empty-text">这里还空着，等待第一个温柔的故事</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">正在唤醒记忆...</text>
      </view>

      <!-- 底部留白 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 悬浮问答按钮 -->
    <view
      v-if="hasUnansweredQuestion"
      class="float-question-btn pulse-glow"
      @tap="openQuestion"
    >
      <text class="question-icon">?</text>
    </view>

    <!-- 自定义底部导航 -->
    <ft-tab-bar current-tab="timeline" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <ft-record-modal
      :visible="showRecordModal"
      @close="closeRecord"
      @submit="submitRecord"
    />

    <!-- 家庭名称弹窗 -->
    <ft-family-name-modal
      :visible="showFamilyNameModal"
      :mode="familyNameModalMode"
      :initial-name="familyName"
      @close="closeFamilyNameModal"
      @submit="saveFamilyName"
    />

    <!-- 记忆详情弹窗 -->
    <view v-if="showMemoryPopup" class="memory-popup" @tap.self="closeMemoryPopup">
      <view class="popup-card">
        <view class="popup-header">
          <text class="popup-date">{{ todayMemory?.date }}</text>
          <text class="popup-close" @tap="closeMemoryPopup">Close</text>
        </view>
        <view class="popup-image-wrapper">
          <image
            v-if="todayMemory?.images?.length"
            :src="todayMemory.images[0]"
            mode="aspectFill"
            class="popup-image"
          />
          <view v-else class="popup-image-placeholder"></view>
          <text class="popup-image-hint">Do you remember this?</text>
        </view>
        <view class="popup-quote">
          <text class="popup-text">"{{ todayMemory?.content }}"</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { formatDate } from '@/utils/index.js'
import {
  getMyFamily, createFamily, getMemories, getYearAgoMemories,
  createMemory, addResonance, updateFamily
} from '@/utils/api.js'

const statusBarHeight = ref(20)
const scrollTop = ref(0)
const showReminder = ref(false)
const showRecordModal = ref(false)
const showMemoryPopup = ref(false)
const showFamilyNameModal = ref(false)
const familyNameModalMode = ref('welcome')
const loading = ref(false)
const fontClass = ref('font-system')
const familyName = ref('')
const familyId = ref('')
const inviteCode = ref('')
const establishedYear = ref(new Date().getFullYear())
const familyMembers = ref([])
const memories = ref([])
const todayMemory = ref(null)
const hasUnansweredQuestion = ref(false)
const pageNo = ref(1)
const hasMore = ref(true)

const groupedMemories = computed(() => {
  const groups = {}
  memories.value.forEach(memory => {
    const date = formatDate(memory.createTime || memory.createdAt, 'MM月DD日')
    if (!groups[date]) groups[date] = []
    groups[date].push(memory)
  })
  return groups
})

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'
  loadFamilyInfo(options?.needFamily === 'true')
})

onShow(() => {
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'
})

const loadFamilyInfo = async (needFamily = false) => {
  try {
    const res = await getMyFamily()
    if (res.data) {
      familyName.value = res.data.name
      familyId.value = res.data.id
      inviteCode.value = res.data.inviteCode
      establishedYear.value = res.data.establishedYear || new Date().getFullYear()
      familyMembers.value = (res.data.members || []).map(m => ({
        id: m.id, name: m.nickname, avatar: m.avatar || '', online: true
      }))
      loadMemories()
      checkTodayMemory()
      setTimeout(() => { showReminder.value = true }, 500)
    } else {
      familyNameModalMode.value = 'welcome'
      showFamilyNameModal.value = true
    }
  } catch (error) {
    if (needFamily) {
      familyNameModalMode.value = 'welcome'
      showFamilyNameModal.value = true
    }
    console.error('加载家庭信息失败:', error)
  }
}

const openEditName = () => {
  familyNameModalMode.value = 'edit'
  showFamilyNameModal.value = true
}

const closeFamilyNameModal = () => { showFamilyNameModal.value = false }

const saveFamilyName = async (name) => {
  try {
    if (familyId.value) {
      await updateFamily(familyId.value, { name })
      familyName.value = name
    } else {
      const res = await createFamily({ name, establishedYear: new Date().getFullYear() })
      familyName.value = res.data.name
      familyId.value = res.data.id
      inviteCode.value = res.data.inviteCode
      establishedYear.value = res.data.establishedYear
      familyMembers.value = (res.data.members || []).map(m => ({
        id: m.id, name: m.nickname, avatar: m.avatar || '', online: true
      }))
      uni.showModal({
        title: '家庭创建成功',
        content: `邀请码: ${res.data.inviteCode}\n请将邀请码分享给家人，他们可以在注册时填写邀请码加入家庭。`,
        showCancel: false, confirmText: '我知道了', confirmColor: '#5C4F42'
      })
    }
    showFamilyNameModal.value = false
    if (familyNameModalMode.value === 'edit') {
      uni.showToast({ title: '已保存', icon: 'success' })
    }
  } catch (error) {
    console.error('保存家庭名称失败:', error)
  }
}

const loadMemories = async () => {
  if (loading.value || !familyId.value) return
  loading.value = true
  try {
    const res = await getMemories({ page: pageNo.value, limit: 20 })
    if (res.data && res.data.items) {
      const newMemories = res.data.items.map(m => ({
        id: m.id, authorId: m.author?.id,
        authorName: m.author?.nickname || '未知', authorAvatar: m.author?.avatar || '',
        authorOnline: true, content: m.content, images: m.images || [],
        tags: m.tags || [], createTime: new Date(m.createdAt).getTime(),
        resonanceCount: m.resonanceCount || 0, isOldMemory: m.isOldMemory || false,
        voice: m.type === 'VOICE' ? { duration: m.voiceDuration } : null,
        parallelViews: m.parallelViews?.map(v => ({
          authorId: v.author?.id, authorName: v.author?.nickname || '未知',
          avatar: v.author?.avatar || '', online: true, content: v.content,
          images: v.images || [], tags: v.tags || [], resonanceCount: v.resonanceCount || 0
        }))
      }))
      if (pageNo.value === 1) {
        memories.value = newMemories
      } else {
        memories.value = [...memories.value, ...newMemories]
      }
      hasMore.value = res.data.page < res.data.totalPages
      pageNo.value++
    }
  } catch (error) {
    console.error('加载记忆失败:', error)
  } finally {
    loading.value = false
  }
}

const checkTodayMemory = async () => {
  if (!familyId.value) return
  try {
    const res = await getYearAgoMemories()
    if (res.data && res.data.length > 0) {
      const memory = res.data[0]
      todayMemory.value = {
        title: '365天前的今天',
        preview: memory.content?.substring(0, 30) + '...',
        date: formatDate(new Date(memory.createdAt).getTime(), 'MMM DD, YYYY'),
        content: memory.content, images: memory.images || []
      }
    } else {
      todayMemory.value = null
    }
  } catch (error) {
    todayMemory.value = null
  }
}

const openMemoryDetail = () => { showMemoryPopup.value = true }
const closeMemoryPopup = () => { showMemoryPopup.value = false }
const openRecord = () => { showRecordModal.value = true }
const closeRecord = () => { showRecordModal.value = false }

const submitRecord = async (data) => {
  try {
    const res = await createMemory({
      type: (data.type || 'text').toUpperCase(), content: data.content,
      tags: data.tags || [], images: data.images || [],
      voiceDuration: data.voiceDuration, voiceUrl: data.voiceUrl
    })
    if (res.data) {
      const m = res.data
      memories.value.unshift({
        id: m.id, authorId: m.author?.id,
        authorName: m.author?.nickname || '我', authorAvatar: m.author?.avatar || '',
        authorOnline: true, content: m.content, images: m.images || [],
        tags: m.tags || [], createTime: new Date(m.createdAt).getTime(),
        resonanceCount: 0, voice: m.type === 'VOICE' ? { duration: m.voiceDuration } : null
      })
      scrollTop.value = 0
      uni.showToast({ title: '记录成功', icon: 'success' })
    }
  } catch (error) {
    console.error('提交记录失败:', error)
  }
}

const handleResonance = async (memoryId) => {
  try {
    const res = await addResonance(memoryId)
    const memory = memories.value.find(m => m.id === memoryId)
    if (memory) {
      if (res.data?.action === 'removed') {
        memory.resonanceCount = Math.max(0, (memory.resonanceCount || 0) - 1)
      } else {
        memory.resonanceCount = (memory.resonanceCount || 0) + 1
      }
    }
  } catch (error) {
    console.error('共鸣失败:', error)
  }
}

const handlePlayVoice = (voice) => { console.log('播放语音', voice) }

const openQuestion = () => { uni.showToast({ title: '问答功能开发中', icon: 'none' }) }

const addMember = () => {
  if (inviteCode.value) {
    uni.showModal({
      title: '邀请家人',
      content: `家庭邀请码: ${inviteCode.value}\n请将邀请码分享给家人，他们在注册时填写即可加入。`,
      showCancel: false, confirmText: '我知道了', confirmColor: '#5C4F42'
    })
  } else {
    uni.showToast({ title: '请先创建家庭', icon: 'none' })
  }
}

const loadMore = () => {
  if (loading.value || !hasMore.value) return
  loadMemories()
}
</script>

<style lang="scss" scoped>
@use './timeline.scss';
</style>
