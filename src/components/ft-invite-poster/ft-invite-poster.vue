<template>
  <view v-if="visible" class="invite-poster-popup" @tap="handleClose">
    <view class="poster-content" @tap.stop>
      <!-- 头部 -->
      <view class="poster-header">
        <text class="poster-title">邀请家人</text>
        <view class="poster-close" @tap="handleClose">
          <text>×</text>
        </view>
      </view>

      <!-- 海报预览区域 -->
      <view class="poster-preview">
        <view class="poster-card">
          <!-- 渐变背景装饰 -->
          <view class="poster-bg">
            <view class="bg-circle circle-1"></view>
            <view class="bg-circle circle-2"></view>
            <view class="bg-circle circle-3"></view>
          </view>

          <!-- 海报内容 -->
          <view class="poster-body">
            <!-- 顶部装饰 -->
            <view class="poster-decoration">
              <text class="deco-emoji">🏠</text>
            </view>

            <!-- 家庭名称 -->
            <text class="family-name">{{ familyInfo.name || '我的家' }}</text>
            <text class="invite-text">邀请你加入我们的家庭时光</text>

            <!-- 邀请码区域 -->
            <view class="invite-code-section">
              <text class="code-label">邀请码</text>
              <view class="code-display">
                <text
                  v-for="(char, index) in inviteCodeChars"
                  :key="index"
                  class="code-char"
                >{{ char }}</text>
              </view>
            </view>

            <!-- 二维码占位（未来可以生成） -->
            <view class="qrcode-placeholder">
              <text class="qr-icon">📱</text>
              <text class="qr-hint">打开「家的时光」小程序</text>
              <text class="qr-hint">输入邀请码加入家庭</text>
            </view>

            <!-- 底部信息 -->
            <view class="poster-footer-info">
              <text class="footer-text">记录家的温暖时光</text>
              <view class="footer-line"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="poster-actions">
        <view class="action-btn copy-btn" @tap="copyInviteCode">
          <text class="action-icon"></text>
          <text class="action-text">复制邀请码</text>
        </view>
        <view class="action-btn save-btn" @tap="savePoster">
          <text class="action-icon"></text>
          <text class="action-text">保存海报</text>
        </view>
      </view>

      <!-- 提示文字 -->
      <view class="poster-tip">
        <text>分享邀请码给家人，一起记录美好时光</text>
      </view>
    </view>

    <!-- Canvas用于生成海报图片 -->
    <canvas
      canvas-id="posterCanvas"
      type="2d"
      class="poster-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    ></canvas>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { rpx2px } from '@/utils/index.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  familyInfo: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const canvasWidth = ref(300)
const canvasHeight = ref(450)

// 邀请码字符数组
const inviteCodeChars = computed(() => {
  const code = props.familyInfo.inviteCode || '------'
  return code.split('')
})

// 关闭弹窗
function handleClose() {
  emit('close')
}

// 复制邀请码
function copyInviteCode() {
  const code = props.familyInfo.inviteCode
  if (!code) {
    uni.showToast({ title: '暂无邀请码', icon: 'none' })
    return
  }

  uni.setClipboardData({
    data: code,
    success: () => {
      uni.showToast({ title: '邀请码已复制', icon: 'success' })
    }
  })
}

// 保存海报
async function savePoster() {
  uni.showLoading({ title: '生成海报中...' })

  try {
    // 获取canvas上下文
    const query = uni.createSelectorQuery()
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        if (!res[0]) {
          // 降级方案：直接截图
          uni.showToast({ title: '暂不支持保存海报', icon: 'none' })
          uni.hideLoading()
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = uni.getSystemInfoSync().pixelRatio

        canvas.width = canvasWidth.value * dpr
        canvas.height = canvasHeight.value * dpr
        ctx.scale(dpr, dpr)

        // 绘制海报背景
        drawPoster(ctx)

        // 导出图片
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvas,
            success: (res) => {
              uni.hideLoading()
              saveImageToAlbum(res.tempFilePath)
            },
            fail: () => {
              uni.hideLoading()
              uni.showToast({ title: '生成失败', icon: 'none' })
            }
          })
        }, 100)
      })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// 绘制海报
function drawPoster(ctx) {
  const w = canvasWidth.value
  const h = canvasHeight.value

  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, '#FAF7F2')
  gradient.addColorStop(0.5, '#FFF5EB')
  gradient.addColorStop(1, '#F5EFE6')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  // 装饰圆形
  ctx.fillStyle = 'rgba(224, 122, 95, 0.1)'
  ctx.beginPath()
  ctx.arc(w * 0.8, h * 0.15, 80, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(138, 154, 91, 0.1)'
  ctx.beginPath()
  ctx.arc(w * 0.2, h * 0.85, 60, 0, Math.PI * 2)
  ctx.fill()

  // 标题
  ctx.fillStyle = '#5C4F42'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(props.familyInfo.name || '我的家', w / 2, 80)

  // 副标题
  ctx.fillStyle = '#9E8F7D'
  ctx.font = '14px sans-serif'
  ctx.fillText('邀请你加入我们的家庭时光', w / 2, 110)

  // 邀请码标签
  ctx.fillStyle = '#9E8F7D'
  ctx.font = '12px sans-serif'
  ctx.fillText('邀请码', w / 2, 170)

  // 邀请码
  ctx.fillStyle = '#5C4F42'
  ctx.font = 'bold 32px monospace'
  ctx.fillText(props.familyInfo.inviteCode || '------', w / 2, 210)

  // 底部提示
  ctx.fillStyle = '#C4B8A8'
  ctx.font = '12px sans-serif'
  ctx.fillText('打开「家的时光」App', w / 2, h - 60)
  ctx.fillText('输入邀请码加入家庭', w / 2, h - 40)
}

// 保存图片到相册
function saveImageToAlbum(filePath) {
  uni.saveImageToPhotosAlbum({
    filePath,
    success: () => {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    },
    fail: (err) => {
      if (err.errMsg.includes('auth deny')) {
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting()
            }
          }
        })
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss" src="./invite-poster.scss"></style>
