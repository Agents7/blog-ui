<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationFrameId: number | undefined
let width = 0
let height = 0

// 鼠标位置，用于实现视差效果
let mouseX = 0
let mouseY = 0

const STAR_COUNT = 200 // 星星数量
const METEOR_COUNT = 5 // 同时出现的流星数量
const PARALLAX_STRENGTH = 0.05 // 视差移动强度

interface Star {
  x: number
  y: number
  z: number // 深度，用于计算视差
  radius: number // 半径
  opacity: number // 透明度
  twinkleSpeed: number // 闪烁速度
  twinklePhase: number // 闪烁相位
}

interface Meteor {
  x: number
  y: number
  length: number // 尾巴长度
  speed: number // 移动速度
  angle: number // 移动角度
  opacity: number // 透明度
}

const stars: Star[] = []
const meteors: Meteor[] = []

// 初始化星星
const initStars = () => {
  stars.length = 0
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.5 + 0.5, // 0.5 到 1.0 之间
      radius: Math.random() * 1.5,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    })
  }
}

// 创建流星
const createMeteor = (): Meteor => ({
  x: Math.random() * width,
  y: Math.random() * height * 0.5, // 从上半部分开始
  length: Math.random() * 80 + 20,
  speed: Math.random() * 5 + 2,
  angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // 约 45 度角
  opacity: 1,
})

// 绘制星星
const drawStars = () => {
  const context = ctx
  if (!context) return

  const centerX = width / 2
  const centerY = height / 2
  // 计算视差偏移量
  // 背景向鼠标相反方向移动以产生深度感
  const offsetX = (mouseX - centerX) * PARALLAX_STRENGTH
  const offsetY = (mouseY - centerY) * PARALLAX_STRENGTH

  context.fillStyle = 'white'

  for (const star of stars) {
    // 更新闪烁效果
    star.twinklePhase += star.twinkleSpeed
    const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5 // 0 到 1 之间
    const alpha = 0.2 + twinkle * 0.8 // 最小透明度 0.2

    // 应用视差位置
    const px = star.x + offsetX * star.z
    const py = star.y + offsetY * star.z

    context.beginPath()
    context.globalAlpha = alpha * star.opacity
    context.arc(px, py, star.radius, 0, Math.PI * 2)
    context.fill()
  }
}

// 绘制流星
const drawMeteors = () => {
  const context = ctx
  if (!context) return

  // 更新并绘制现有流星
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]
    if (!m) continue

    // 移动流星
    m.x += Math.cos(m.angle) * m.speed
    m.y += Math.sin(m.angle) * m.speed
    m.opacity -= 0.01 // 尾迹逐渐消失

    // 计算尾巴坐标
    const tailX = m.x - Math.cos(m.angle) * m.length
    const tailY = m.y - Math.sin(m.angle) * m.length

    // 绘制渐变尾巴
    const gradient = context.createLinearGradient(m.x, m.y, tailX, tailY)
    gradient.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    context.strokeStyle = gradient
    context.lineWidth = 2
    context.lineCap = 'round'
    context.beginPath()
    context.moveTo(m.x, m.y)
    context.lineTo(tailX, tailY)
    context.stroke()

    // 移除超出屏幕或不可见的流星
    if (m.x > width || m.y > height || m.opacity <= 0) {
      meteors.splice(i, 1)
    }
  }

  // 随机生成新流星
  if (meteors.length < METEOR_COUNT && Math.random() < 0.01) {
    meteors.push(createMeteor())
  }
}

// 动画循环
const animate = () => {
  const context = ctx
  if (!context || !canvasRef.value) return

  context.clearRect(0, 0, width, height)
  // 重置全局透明度，避免影响下一帧
  context.globalAlpha = 1

  drawStars()
  drawMeteors()

  animationFrameId = requestAnimationFrame(animate)
}

const handleResize = () => {
  if (!canvasRef.value) return
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = width
  canvasRef.value.height = height
  initStars()
}

const handleMouseMove = (e: MouseEvent) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
  animate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

</script>

<template>
  <div class="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-b from-[#020617] via-[#1e1b4b] to-[#000000]">
    <canvas ref="canvasRef" class="block w-full h-full opacity-80"></canvas>
  </div>
</template>

<style scoped>
div {
  pointer-events: none;
}
</style>
