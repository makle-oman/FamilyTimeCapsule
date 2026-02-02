<template>
  <view class="page-wrapper mailbox-page" :class="fontClass">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">时光信箱</text>
      <text class="page-subtitle">给未来的自己写一封信</text>
    </view>

    <scroll-view scroll-y class="mailbox-scroll">
      <!-- 待开启区域 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">待开启的信</text>
          <text class="section-count">{{ pendingLetters.length }}封</text>
        </view>

        <view v-if="pendingLetters.length" class="pending-letters">
          <ft-envelope
            v-for="letter in pendingLetters"
            :key="letter.id"
            :letter="letter"
            @open="handleOpenLetter"
          />
        </view>

        <view v-else class="empty-pending">
          <text class="empty-text">还没有待开启的信</text>
          <text class="empty-hint">写一封信给未来的自己吧</text>
        </view>
      </view>

      <!-- 默契问答区域 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">默契问答</text>
          <view v-if="hasNewQuestion" class="new-badge">新</view>
        </view>

        <view class="qa-cards">
          <view
            v-for="qa in questionList"
            :key="qa.id"
            class="qa-card"
            :class="{ answered: qa.allAnswered, 'flower-bloom': qa.showBloom }"
            @tap="openQA(qa)"
          >
            <view class="qa-question">
              <text class="question-text">{{ qa.question }}</text>
            </view>

            <view v-if="!qa.allAnswered" class="qa-status">
              <view
                v-for="member in qa.members"
                :key="member.id"
                class="member-status"
                :class="{ done: member.answered }"
              >
                <image :src="member.avatar || '/static/images/default-avatar.png'" class="status-avatar" />
                <view v-if="member.answered" class="check-mark">✓</view>
              </view>
            </view>

            <view v-else class="qa-answers flower-layout">
              <view
                v-for="(answer, index) in qa.answers"
                :key="index"
                class="answer-petal"
                :style="{ '--petal-index': index }"
              >
                <view class="answer-avatar">
                  <image :src="answer.avatar || '/static/images/default-avatar.png'" />
                </view>
                <text class="answer-text">{{ answer.content }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-if="!questionList.length" class="empty-qa">
          <text class="empty-text">今日问答还没出炉</text>
        </view>
      </view>

      <!-- 已封存列表 - 书架样式 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">已封存</text>
        </view>

        <view class="bookshelf">
          <view
            v-for="year in yearsList"
            :key="year"
            class="book-spine"
            @tap="openYearLetters(year)"
          >
            <view class="spine-content">
              <text class="spine-year">{{ year }}</text>
              <text class="spine-title">年度信件集</text>
              <text class="spine-count">{{ getYearCount(year) }}封</text>
            </view>
            <view class="spine-decoration"></view>
          </view>
        </view>

        <view v-if="!yearsList.length" class="empty-bookshelf">
          <text class="empty-text">书架空空如也</text>
        </view>
      </view>

      <!-- 写信入口 -->
      <view class="write-letter-section">
        <view class="write-letter-btn" @tap="writeLetter">
          <view class="btn-icon">
            <image class="btn-icon-img" src="/static/icons/extra/write.png" mode="aspectFit" />
          </view>
          <view class="btn-text">
            <text class="btn-title">写一封慢递信</text>
            <text class="btn-desc">选择一个日期，信会在那天送达</text>
          </view>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部导航 -->
    <ft-tab-bar current-tab="mailbox" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <ft-record-modal :visible="showRecordModal" @close="closeRecord" @submit="submitRecord" />

    <!-- 信件内容弹窗 -->
    <view v-if="showLetterPopup" class="letter-popup" @tap.self="closeLetterPopup">
      <view class="letter-content-wrapper" :class="{ 'letter-open': letterOpened }">
        <view class="envelope-animation" :class="{ opening: isOpening }">
          <view class="envelope-back"></view>
          <view class="envelope-front">
            <view class="wax-seal breaking">
              <text>封</text>
            </view>
          </view>
          <view class="envelope-flap-anim"></view>
        </view>

        <view class="letter-paper" :class="{ show: letterOpened }">
          <view class="paper-header">
            <text class="letter-date">{{ currentLetter?.formattedDate }}</text>
            <view class="close-letter" @tap="closeLetterPopup">×</view>
          </view>
          <scroll-view scroll-y class="paper-body">
            <text class="letter-content">{{ currentLetter?.content }}</text>
            <view v-if="currentLetter?.images?.length" class="letter-images">
              <image
                v-for="(img, index) in currentLetter.images"
                :key="index"
                :src="img"
                mode="aspectFill"
                class="letter-image"
              />
            </view>
          </scroll-view>
          <view class="paper-footer">
            <text class="letter-sender">—— {{ currentLetter?.senderName }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 写信弹窗 -->
    <view v-if="showWritePopup" class="write-popup" @tap.stop="closeWritePopup">
      <view class="write-content" @tap.stop>
        <view class="write-header">
          <text class="write-title">写给未来的信</text>
          <view class="write-close" @tap="closeWritePopup">×</view>
        </view>

        <view class="write-body">
          <view class="form-item">
            <text class="form-label">收件人</text>
            <view class="receiver-options">
              <view
                v-for="member in familyMembers"
                :key="member.id"
                class="receiver-option"
                :class="{ selected: selectedReceiver === member.id }"
                @tap="selectedReceiver = member.id"
              >
                <image :src="member.avatar || '/static/images/default-avatar.png'" class="receiver-avatar" />
                <text class="receiver-name">{{ member.name }}</text>
              </view>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label">送达日期</text>
            <picker mode="date" :value="deliveryDate" :start="minDate" @change="onDateChange">
              <view class="date-picker">
                <text class="date-value">{{ deliveryDate || '选择日期' }}</text>
                <text class="date-arrow">›</text>
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">写下你想说的话</text>
            <view class="letter-input-area">
              <textarea
                v-model="letterContent"
                class="letter-textarea"
                placeholder="亲爱的......"
                placeholder-class="textarea-placeholder"
                :maxlength="1000"
              />
            </view>
          </view>
        </view>

        <view class="write-footer">
          <view class="seal-btn" @tap="sealLetter">
            <text class="seal-text">封存这封信</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 问答回答弹窗 -->
    <view v-if="showAnswerPopup" class="answer-popup" @tap.self="closeAnswerPopup">
      <view class="answer-content" @tap.stop>
        <view class="answer-header">
          <text class="answer-title">回答问题</text>
          <view class="answer-close" @tap="closeAnswerPopup">×</view>
        </view>

        <view class="answer-body">
          <view class="question-display">
            <text class="question-label">今日问题</text>
            <text class="question-content">{{ currentQuestion?.question }}</text>
          </view>

          <view class="answer-input-area">
            <textarea
              v-model="answerContent"
              class="answer-textarea"
              placeholder="写下你的答案..."
              placeholder-class="textarea-placeholder"
              :maxlength="500"
            />
          </view>

          <view class="answer-hint">
            <text>回答后需等待所有家人回答才能查看答案</text>
          </view>
        </view>

        <view class="answer-footer">
          <view class="submit-answer-btn" @tap="submitAnswer">
            <text class="submit-answer-text">提交答案</text>
          </view>
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
  getPendingLetters, getOpenedLetters, getLetterYears, createLetter, openLetter,
  getTodayQuestion, answerQuestion, getMyFamily
} from '@/utils/api.js'

const statusBarHeight = ref(20)
const showRecordModal = ref(false)
const showLetterPopup = ref(false)
const showWritePopup = ref(false)
const showAnswerPopup = ref(false)
const isOpening = ref(false)
const letterOpened = ref(false)
const currentLetter = ref(null)
const currentQuestion = ref(null)
const answerContent = ref('')
const pendingLetters = ref([])
const yearsList = ref([])
const questionList = ref([])
const hasNewQuestion = ref(false)
const fontClass = ref('font-system')
const familyMembers = ref([])
const selectedReceiver = ref('')
const deliveryDate = ref('')
const letterContent = ref('')
const loading = ref(false)

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return formatDate(tomorrow.getTime(), 'YYYY-MM-DD')
})

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'
  loadData()
})

onShow(() => {
  fontClass.value = uni.getStorageSync('fontClass') || 'font-system'
})

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadPendingLetters(),
      loadLetterYears(),
      loadTodayQuestion(),
      loadFamilyMembers()
    ])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadFamilyMembers = async () => {
  try {
    const res = await getMyFamily()
    if (res.data && res.data.members) {
      familyMembers.value = res.data.members.map(m => ({
        id: m.id, name: m.nickname, avatar: m.avatar || ''
      }))
      if (familyMembers.value.length > 0) {
        selectedReceiver.value = familyMembers.value[0].id
      }
    }
  } catch (error) {
    console.error('加载家庭成员失败:', error)
  }
}

const loadPendingLetters = async () => {
  try {
    const res = await getPendingLetters()
    if (res.data) {
      pendingLetters.value = res.data.map(letter => ({
        id: letter.id,
        senderName: letter.sender?.nickname || '未知',
        senderAvatar: letter.sender?.avatar || '',
        content: letter.content,
        createTime: new Date(letter.createdAt).getTime(),
        unlockTime: new Date(letter.unlockTime).getTime(),
        canOpen: letter.canOpen,
        daysUntilUnlock: letter.daysUntilUnlock
      }))
    }
  } catch (error) {
    console.error('加载待开启信件失败:', error)
  }
}

const loadLetterYears = async () => {
  try {
    const res = await getLetterYears()
    if (res.data) {
      yearsList.value = res.data
    }
  } catch (error) {
    console.error('加载信件年份失败:', error)
  }
}

const loadTodayQuestion = async () => {
  try {
    const res = await getTodayQuestion()
    if (res.data) {
      const q = res.data
      hasNewQuestion.value = !q.hasAnswered
      questionList.value = [{
        id: q.id,
        question: q.content,
        members: q.answeredUsers?.map(u => ({
          id: u.id, name: u.nickname, avatar: u.avatar || '', answered: true
        })) || [],
        allAnswered: q.allAnswered,
        showBloom: false,
        answers: q.allAnswered ? q.answers?.map(a => ({
          avatar: a.user?.avatar || '',
          content: a.content,
          userName: a.user?.nickname || ''
        })) : [],
        hasAnswered: q.hasAnswered,
        totalMembers: q.totalMembers,
        answeredCount: q.answeredCount
      }]
    }
  } catch (error) {
    console.error('加载今日问题失败:', error)
  }
}

const getYearCount = (year) => '?'

const handleOpenLetter = async (letter) => {
  if (!letter.canOpen && letter.unlockTime > Date.now()) return

  try {
    const res = await openLetter(letter.id)
    if (res.data) {
      currentLetter.value = {
        ...letter,
        content: res.data.content,
        formattedDate: formatDate(letter.createTime, 'YYYY年MM月DD日')
      }
      showLetterPopup.value = true
      isOpening.value = true
      setTimeout(() => { letterOpened.value = true }, 1500)
      loadPendingLetters()
      loadLetterYears()
    }
  } catch (error) {
    console.error('打开信件失败:', error)
  }
}

const closeLetterPopup = () => {
  showLetterPopup.value = false
  isOpening.value = false
  letterOpened.value = false
  currentLetter.value = null
}

const openQA = (qa) => {
  if (qa.allAnswered) {
    qa.showBloom = true
  } else if (!qa.hasAnswered) {
    currentQuestion.value = qa
    answerContent.value = ''
    showAnswerPopup.value = true
  } else {
    uni.showToast({ title: '等待其他家人回答', icon: 'none' })
  }
}

const closeAnswerPopup = () => {
  showAnswerPopup.value = false
  currentQuestion.value = null
  answerContent.value = ''
}

const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    uni.showToast({ title: '请输入你的答案', icon: 'none' })
    return
  }
  try {
    await answerQuestion(currentQuestion.value.id, answerContent.value.trim())
    uni.showToast({ title: '回答成功', icon: 'success' })
    closeAnswerPopup()
    loadTodayQuestion()
  } catch (error) {
    console.error('回答失败:', error)
  }
}

const openYearLetters = async (year) => {
  try {
    const res = await getOpenedLetters(year)
    if (res.data && res.data.length > 0) {
      uni.showToast({ title: `${year}年有 ${res.data.length} 封信`, icon: 'none' })
    } else {
      uni.showToast({ title: `${year}年暂无信件`, icon: 'none' })
    }
  } catch (error) {
    console.error('加载年度信件失败:', error)
  }
}

const writeLetter = () => {
  if (familyMembers.value.length === 0) {
    uni.showToast({ title: '请先加入一个家庭', icon: 'none' })
    return
  }
  showWritePopup.value = true
}

const closeWritePopup = () => {
  showWritePopup.value = false
  resetWriteForm()
}

const resetWriteForm = () => {
  selectedReceiver.value = familyMembers.value.length > 0 ? familyMembers.value[0].id : ''
  deliveryDate.value = ''
  letterContent.value = ''
}

const onDateChange = (e) => { deliveryDate.value = e.detail.value }

const sealLetter = async () => {
  if (!letterContent.value.trim()) {
    uni.showToast({ title: '请写下你想说的话', icon: 'none' })
    return
  }
  if (!deliveryDate.value) {
    uni.showToast({ title: '请选择送达日期', icon: 'none' })
    return
  }
  if (!selectedReceiver.value) {
    uni.showToast({ title: '请选择收件人', icon: 'none' })
    return
  }
  try {
    await createLetter({
      content: letterContent.value.trim(),
      receiverId: selectedReceiver.value,
      unlockTime: new Date(deliveryDate.value + 'T00:00:00').toISOString()
    })
    closeWritePopup()
    uni.showToast({ title: '信已封存', icon: 'success' })
    loadPendingLetters()
  } catch (error) {
    console.error('封存信件失败:', error)
  }
}

const openRecord = () => { showRecordModal.value = true }
const closeRecord = () => { showRecordModal.value = false }
const submitRecord = (data) => { console.log('提交记录', data) }
</script>

<style lang="scss" scoped>
@use './mailbox.scss';
</style>
