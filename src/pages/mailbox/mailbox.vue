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
          <envelope-card
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

            <!-- 未全部回答时显示状态 -->
            <view v-if="!qa.allAnswered" class="qa-status">
              <view
                v-for="member in qa.members"
                :key="member.id"
                class="member-status"
                :class="{ done: member.answered }"
              >
                <image :src="member.avatar || '/static/images/default-avatar.svg'" class="status-avatar" />
                <view v-if="member.answered" class="check-mark">✓</view>
              </view>
            </view>

            <!-- 全部回答后展示答案 -->
            <view v-else class="qa-answers flower-layout">
              <view
                v-for="(answer, index) in qa.answers"
                :key="index"
                class="answer-petal"
                :style="{ '--petal-index': index }"
              >
                <view class="answer-avatar">
                  <image :src="answer.avatar || '/static/images/default-avatar.svg'" />
                </view>
                <text class="answer-text">{{ answer.content }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空问答状态 -->
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
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#E07A5F"/>
            </svg>
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
    <tab-bar current-tab="mailbox" @openRecord="openRecord" />

    <!-- 记录弹窗 -->
    <record-modal :visible="showRecordModal" @close="closeRecord" @submit="submitRecord" />

    <!-- 信件内容弹窗 -->
    <view v-if="showLetterPopup" class="letter-popup" @tap.self="closeLetterPopup">
      <view class="letter-content-wrapper" :class="{ 'letter-open': letterOpened }">
        <!-- 信封动画层 -->
        <view class="envelope-animation" :class="{ opening: isOpening }">
          <view class="envelope-back"></view>
          <view class="envelope-front">
            <view class="wax-seal breaking">
              <text>封</text>
            </view>
          </view>
          <view class="envelope-flap-anim"></view>
        </view>

        <!-- 信纸内容 -->
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
          <!-- 收件人选择 -->
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
                <image :src="member.avatar || '/static/images/default-avatar.svg'" class="receiver-avatar" />
                <text class="receiver-name">{{ member.name }}</text>
              </view>
            </view>
          </view>

          <!-- 送达日期 -->
          <view class="form-item">
            <text class="form-label">送达日期</text>
            <picker mode="date" :value="deliveryDate" :start="minDate" @change="onDateChange">
              <view class="date-picker">
                <text class="date-value">{{ deliveryDate || '选择日期' }}</text>
                <text class="date-arrow">›</text>
              </view>
            </picker>
          </view>

          <!-- 信件内容 -->
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

<script>
import { formatDate, generateId } from '@/utils/index.js'
import {
  getPendingLetters,
  getOpenedLetters,
  getLetterYears,
  createLetter,
  openLetter,
  getTodayQuestion,
  answerQuestion,
  getQuestionHistory,
  getMyFamily
} from '@/utils/api.js'
import TabBar from '@/components/tab-bar/tab-bar.vue'
import RecordModal from '@/components/record-modal/record-modal.vue'
import EnvelopeCard from '@/components/envelope/envelope.vue'

export default {
  components: {
    TabBar,
    RecordModal,
    EnvelopeCard
  },
  data() {
    return {
      statusBarHeight: 20,
      showRecordModal: false,
      showLetterPopup: false,
      showWritePopup: false,
      showAnswerPopup: false,
      isOpening: false,
      letterOpened: false,
      currentLetter: null,
      currentQuestion: null,
      answerContent: '',
      pendingLetters: [],
      archivedLetters: [],
      yearsList: [],
      questionList: [],
      hasNewQuestion: false,
      fontClass: 'font-system',
      familyMembers: [],
      selectedReceiver: '',
      deliveryDate: '',
      letterContent: '',
      loading: false
    }
  },
  computed: {
    minDate() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return formatDate(tomorrow.getTime(), 'YYYY-MM-DD')
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight || 20

    // 加载字体设置
    this.fontClass = uni.getStorageSync('fontClass') || 'font-system'

    this.loadData()
  },
  onShow() {
    // 每次显示页面时刷新字体设置
    this.fontClass = uni.getStorageSync('fontClass') || 'font-system'
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadPendingLetters(),
          this.loadLetterYears(),
          this.loadTodayQuestion(),
          this.loadFamilyMembers()
        ])
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    async loadFamilyMembers() {
      try {
        const res = await getMyFamily()
        if (res.data && res.data.members) {
          this.familyMembers = res.data.members.map(m => ({
            id: m.id,
            name: m.nickname,
            avatar: m.avatar || ''
          }))
          // 默认选择第一个家庭成员
          if (this.familyMembers.length > 0) {
            this.selectedReceiver = this.familyMembers[0].id
          }
        }
      } catch (error) {
        console.error('加载家庭成员失败:', error)
      }
    },

    async loadPendingLetters() {
      try {
        const res = await getPendingLetters()
        if (res.data) {
          this.pendingLetters = res.data.map(letter => ({
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
    },

    async loadLetterYears() {
      try {
        const res = await getLetterYears()
        if (res.data) {
          this.yearsList = res.data
        }
      } catch (error) {
        console.error('加载信件年份失败:', error)
      }
    },

    async loadTodayQuestion() {
      try {
        const res = await getTodayQuestion()
        if (res.data) {
          const q = res.data
          // 检查是否有新问题未回答
          this.hasNewQuestion = !q.hasAnswered

          // 构建问答列表（当前只显示今日问题，后续可加载历史）
          this.questionList = [{
            id: q.id,
            question: q.content,
            members: q.answeredUsers?.map(u => ({
              id: u.id,
              name: u.nickname,
              avatar: u.avatar || '',
              answered: true
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
    },

    getYearCount(year) {
      // 这里需要异步获取，暂时返回占位符
      return '?'
    },

    async handleOpenLetter(letter) {
      if (!letter.canOpen && letter.unlockTime > Date.now()) {
        return
      }

      try {
        // 调用后端打开信件
        const res = await openLetter(letter.id)
        if (res.data) {
          this.currentLetter = {
            ...letter,
            content: res.data.content,
            formattedDate: formatDate(letter.createTime, 'YYYY年MM月DD日')
          }
          this.showLetterPopup = true
          this.isOpening = true

          // 播放开启动画
          setTimeout(() => {
            this.letterOpened = true
          }, 1500)

          // 刷新信件列表
          this.loadPendingLetters()
          this.loadLetterYears()
        }
      } catch (error) {
        console.error('打开信件失败:', error)
      }
    },

    closeLetterPopup() {
      this.showLetterPopup = false
      this.isOpening = false
      this.letterOpened = false
      this.currentLetter = null
    },

    openQA(qa) {
      if (qa.allAnswered) {
        // 显示开花动画
        qa.showBloom = true
      } else if (!qa.hasAnswered) {
        // 打开回答弹窗
        this.currentQuestion = qa
        this.answerContent = ''
        this.showAnswerPopup = true
      } else {
        uni.showToast({
          title: '等待其他家人回答',
          icon: 'none'
        })
      }
    },

    closeAnswerPopup() {
      this.showAnswerPopup = false
      this.currentQuestion = null
      this.answerContent = ''
    },

    async submitAnswer() {
      if (!this.answerContent.trim()) {
        uni.showToast({
          title: '请输入你的答案',
          icon: 'none'
        })
        return
      }

      try {
        await answerQuestion(this.currentQuestion.id, this.answerContent.trim())
        uni.showToast({
          title: '回答成功',
          icon: 'success'
        })
        this.closeAnswerPopup()
        // 刷新问题
        this.loadTodayQuestion()
      } catch (error) {
        console.error('回答失败:', error)
      }
    },

    async openYearLetters(year) {
      try {
        const res = await getOpenedLetters(year)
        if (res.data && res.data.length > 0) {
          // TODO: 显示年度信件列表弹窗
          uni.showToast({
            title: `${year}年有 ${res.data.length} 封信`,
            icon: 'none'
          })
        } else {
          uni.showToast({
            title: `${year}年暂无信件`,
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载年度信件失败:', error)
      }
    },

    writeLetter() {
      if (this.familyMembers.length === 0) {
        uni.showToast({
          title: '请先加入一个家庭',
          icon: 'none'
        })
        return
      }
      this.showWritePopup = true
    },

    closeWritePopup() {
      this.showWritePopup = false
      this.resetWriteForm()
    },

    resetWriteForm() {
      this.selectedReceiver = this.familyMembers.length > 0 ? this.familyMembers[0].id : ''
      this.deliveryDate = ''
      this.letterContent = ''
    },

    onDateChange(e) {
      this.deliveryDate = e.detail.value
    },

    async sealLetter() {
      if (!this.letterContent.trim()) {
        uni.showToast({
          title: '请写下你想说的话',
          icon: 'none'
        })
        return
      }

      if (!this.deliveryDate) {
        uni.showToast({
          title: '请选择送达日期',
          icon: 'none'
        })
        return
      }

      if (!this.selectedReceiver) {
        uni.showToast({
          title: '请选择收件人',
          icon: 'none'
        })
        return
      }

      try {
        await createLetter({
          content: this.letterContent.trim(),
          receiverId: this.selectedReceiver,
          unlockTime: new Date(this.deliveryDate + 'T00:00:00').toISOString()
        })

        this.closeWritePopup()
        uni.showToast({
          title: '信已封存',
          icon: 'success'
        })

        // 刷新信件列表
        this.loadPendingLetters()
      } catch (error) {
        console.error('封存信件失败:', error)
      }
    },

    openRecord() {
      this.showRecordModal = true
    },

    closeRecord() {
      this.showRecordModal = false
    },

    submitRecord(data) {
      console.log('提交记录', data)
    }
  }
}
</script>

<style lang="scss" scoped>
.mailbox-page {
  background: radial-gradient(ellipse at center, #FAF7F2 0%, #E6DED4 100%);
  height: 100vh;
  padding-top: 20rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: transparent;
}

.page-header {
  padding: 32rpx 32rpx 24rpx;
  text-align: center;
}

.page-title {
  display: block;
  font-size: 40rpx;
  color: #5C4F42;
  font-weight: 500;
}

.page-subtitle {
  display: block;
  font-size: 26rpx;
  color: #9E8F7D;
  margin-top: 8rpx;
}

.mailbox-scroll {
  flex: 1;
  overflow: hidden;
}

// 区块样式
.section {
  margin: 24rpx;
  padding: 24rpx;
  background-color: rgba(255, 252, 248, 0.8);
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(196, 184, 168, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  color: #5C4F42;
  font-weight: 500;
}

.section-count {
  margin-left: 12rpx;
  font-size: 24rpx;
  color: #9E8F7D;
}

.new-badge {
  margin-left: 12rpx;
  padding: 4rpx 12rpx;
  background-color: #E07A5F;
  color: #FFFCF8;
  font-size: 20rpx;
  border-radius: 16rpx;
}

// 空状态
.empty-pending,
.empty-qa,
.empty-bookshelf {
  padding: 40rpx;
  text-align: center;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #9E8F7D;
}

.empty-hint {
  display: block;
  font-size: 24rpx;
  color: #C4B8A8;
  margin-top: 8rpx;
}

// 默契问答卡片
.qa-cards {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.qa-card {
  padding: 24rpx;
  background-color: rgba(138, 154, 91, 0.1);
  border: 2rpx solid rgba(138, 154, 91, 0.3);
  border-radius: 20rpx;
}

.qa-question {
  margin-bottom: 16rpx;
}

.question-text {
  font-size: 30rpx;
  color: #5C4F42;
  line-height: 1.5;
}

// 回答状态
.qa-status {
  display: flex;
  gap: 16rpx;
}

.member-status {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  overflow: hidden;
  opacity: 0.5;

  &.done {
    opacity: 1;
  }
}

.status-avatar {
  width: 100%;
  height: 100%;
}

.check-mark {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24rpx;
  height: 24rpx;
  background-color: #8A9A5B;
  color: #FFFCF8;
  font-size: 16rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 答案花瓣布局
.qa-answers {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16rpx;
  padding-top: 16rpx;
}

.answer-petal {
  width: 45%;
  padding: 16rpx;
  background-color: rgba(255, 252, 248, 0.8);
  border-radius: 16rpx;
  text-align: center;
  animation: petalAppear 0.5s ease-out forwards;
  animation-delay: calc(var(--petal-index) * 0.1s);
  opacity: 0;
  transform: scale(0.8);
}

@keyframes petalAppear {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.answer-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 8rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.answer-text {
  font-size: 24rpx;
  color: #5C4F42;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 书架样式
.bookshelf {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding: 8rpx 0;
}

.book-spine {
  flex-shrink: 0;
  width: 80rpx;
  height: 200rpx;
  background: linear-gradient(90deg, #E8DCC4 0%, #D4C8B0 50%, #C4B8A0 100%);
  border-radius: 4rpx 8rpx 8rpx 4rpx;
  box-shadow: 4rpx 4rpx 12rpx rgba(92, 79, 66, 0.2);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 8rpx;
}

.spine-content {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  text-align: center;
}

.spine-year {
  font-size: 28rpx;
  color: #8B7355;
  font-weight: bold;
}

.spine-title {
  font-size: 20rpx;
  color: #9E8F7D;
  margin-top: 8rpx;
}

.spine-count {
  font-size: 18rpx;
  color: #B8A898;
  margin-top: 4rpx;
}

.spine-decoration {
  position: absolute;
  left: 4rpx;
  top: 20%;
  bottom: 20%;
  width: 4rpx;
  background: linear-gradient(180deg, #B8956E 0%, #8B7355 100%);
  border-radius: 2rpx;
}

// 写信入口
.write-letter-section {
  padding: 24rpx;
}

.write-letter-btn {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background-color: #FFFCF8;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(196, 184, 168, 0.15);
}

.btn-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(224, 122, 95, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.btn-text {
  flex: 1;
}

.btn-title {
  display: block;
  font-size: 30rpx;
  color: #5C4F42;
  font-weight: 500;
}

.btn-desc {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-top: 4rpx;
}

.bottom-space {
  height: 200rpx;
}

// 信件弹窗
.letter-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(92, 79, 66, 0.8);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-content-wrapper {
  width: 90%;
  max-width: 600rpx;
  position: relative;
}

// 信封动画
.envelope-animation {
  position: absolute;
  width: 100%;
  height: 400rpx;
  perspective: 1000px;

  &.opening {
    .envelope-flap-anim {
      animation: flapOpenAnim 0.8s ease-out forwards;
    }

    .wax-seal {
      animation: sealCrack 0.6s ease-out 0.3s forwards;
    }
  }
}

.envelope-back,
.envelope-front {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #E8DCC4 0%, #D4C8B0 100%);
  border-radius: 16rpx;
}

.envelope-flap-anim {
  position: absolute;
  top: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(180deg, #D4C8B0 0%, #C4B8A0 100%);
  clip-path: polygon(0 0, 50% 100%, 100% 0);
  transform-origin: top center;
}

@keyframes flapOpenAnim {
  to {
    transform: rotateX(-180deg);
  }
}

.wax-seal {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #E07A5F 0%, #C4534A 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFCF8;
  font-size: 28rpx;
  z-index: 2;
}

@keyframes sealCrack {
  50% {
    transform: translateX(-50%) scale(1.2);
  }
  100% {
    transform: translateX(-50%) scale(0);
    opacity: 0;
  }
}

// 信纸
.letter-paper {
  background-color: #FFFCF8;
  border-radius: 0 0 16rpx 16rpx;
  box-shadow: 0 8rpx 32rpx rgba(92, 79, 66, 0.3);
  opacity: 0;
  transform: translateY(100rpx);
  transition: all 0.5s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.letter-date {
  font-size: 26rpx;
  color: #9E8F7D;
}

.close-letter {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #9E8F7D;
}

.paper-body {
  max-height: 60vh;
  padding: 32rpx;
}

.letter-content {
  font-size: 32rpx;
  color: #5C4F42;
  line-height: 1.8;
}

.letter-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}

.letter-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

.paper-footer {
  padding: 24rpx 32rpx;
  text-align: right;
  border-top: 1rpx solid #E8E4DF;
}

.letter-sender {
  font-size: 28rpx;
  color: #9E8F7D;
  font-style: italic;
}

// 写信弹窗
.write-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(230, 222, 212, 0.9);
  backdrop-filter: blur(10rpx);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
}

.write-content {
  width: 100%;
  max-height: 90vh;
  background-color: #FFFCF8;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
}

.write-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.write-title {
  font-size: 34rpx;
  color: #5C4F42;
  font-weight: 500;
}

.write-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: #9E8F7D;
}

.write-body {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #5C4F42;
  margin-bottom: 16rpx;
}

.receiver-options {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.receiver-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.receiver-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-bottom: 8rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;

  .receiver-option.selected & {
    border-color: #E07A5F;
  }
}

.receiver-name {
  font-size: 24rpx;
  color: #9E8F7D;
  transition: all 0.3s ease;

  .receiver-option.selected & {
    color: #E07A5F;
  }
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #FAF7F2;
  border-radius: 16rpx;
}

.date-value {
  font-size: 30rpx;
  color: #5C4F42;
}

.date-arrow {
  font-size: 32rpx;
  color: #C4B8A8;
}

.letter-input-area {
  background-color: #FAF7F2;
  border-radius: 16rpx;
  padding: 24rpx;
  min-height: 300rpx;
}

.letter-textarea {
  width: 100%;
  min-height: 260rpx;
  font-size: 30rpx;
  color: #5C4F42;
  line-height: 1.7;
  background: transparent;
}

.textarea-placeholder {
  color: #C4B8A8;
}

.write-footer {
  padding: 16rpx 32rpx 48rpx;
  padding-bottom: calc(48rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.seal-btn {
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
}

.seal-text {
  font-size: 32rpx;
  color: #FFFCF8;
  font-weight: 500;
}

// 问答回答弹窗
.answer-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(230, 222, 212, 0.9);
  backdrop-filter: blur(10rpx);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-content {
  width: 90%;
  max-width: 640rpx;
  background-color: #FFFCF8;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(92, 79, 66, 0.2);
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E8E4DF;
}

.answer-title {
  font-size: 34rpx;
  color: #5C4F42;
  font-weight: 500;
}

.answer-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: #9E8F7D;
}

.answer-body {
  padding: 32rpx;
}

.question-display {
  margin-bottom: 32rpx;
}

.question-label {
  display: block;
  font-size: 24rpx;
  color: #9E8F7D;
  margin-bottom: 12rpx;
}

.question-content {
  display: block;
  font-size: 32rpx;
  color: #5C4F42;
  line-height: 1.6;
  font-weight: 500;
}

.answer-input-area {
  background-color: #FAF7F2;
  border-radius: 16rpx;
  padding: 24rpx;
  min-height: 200rpx;
}

.answer-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 30rpx;
  color: #5C4F42;
  line-height: 1.7;
  background: transparent;
}

.answer-hint {
  margin-top: 16rpx;
  text-align: center;

  text {
    font-size: 24rpx;
    color: #C4B8A8;
  }
}

.answer-footer {
  padding: 16rpx 32rpx 32rpx;
}

.submit-answer-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #8A9A5B 0%, #7A8A4B 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(138, 154, 91, 0.3);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(138, 154, 91, 0.3);
  }
}

.submit-answer-text {
  font-size: 32rpx;
  color: #FFFCF8;
  font-weight: 500;
}
</style>
