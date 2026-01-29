<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { adminUserArticleCount, type UserArticleCountVO } from '../../api/admin'
import { getUserBatch } from '../../api/auth'

const loading = ref(false)
const topN = ref(20)
const stats = ref<UserArticleCountVO[]>([])

const chartEl = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const xLabels = ref<string[]>([])
const yValues = ref<number[]>([])

const initChart = () => {
  if (!chartEl.value) return
  chart = echarts.init(chartEl.value)
}

const ensureChart = () => {
  if (!chartEl.value) return
  if (!chart) {
    initChart()
  }
  chart?.resize()
}

const renderChart = () => {
  ensureChart()
  if (!chart) return
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 30, right: 30, top: 30, bottom: 80, containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels.value,
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: yValues.value,
      },
    ],
  })
  chart.resize()
}

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await adminUserArticleCount({ topN: topN.value })
    const list = (res as any).data || []
    stats.value = Array.isArray(list) ? list : []

    const userIds = stats.value.map(s => s.userId)
    const userRes = userIds.length > 0 ? await getUserBatch(userIds) : null
    const users = (userRes as any)?.data || []
    const userMap = new Map<number, string>()
    for (const u of users) {
      if (u?.id) userMap.set(u.id, u.nickname || u.username || String(u.id))
    }

    xLabels.value = stats.value.map(s => userMap.get(s.userId) || String(s.userId))
    yValues.value = stats.value.map(s => Number(s.count || 0))
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await fetchStats()
  await nextTick()
  ensureChart()
  renderChart()
}

const topNOptions = computed(() => [10, 20, 50, 100])

const handleResize = () => {
  chart?.resize()
}

onMounted(async () => {
  await refresh()
  window.addEventListener('resize', handleResize)
  if (chartEl.value && !resizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(chartEl.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
})

watch(topN, () => {
  refresh()
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <div class="text-sm text-gray-600">TopN</div>
      <el-select v-model="topN" class="w-[120px]" :disabled="loading">
        <el-option v-for="n in topNOptions" :key="n" :label="String(n)" :value="n" />
      </el-select>
      <el-button :loading="loading" @click="refresh">刷新</el-button>
    </div>

    <div class="w-full h-[420px]" ref="chartEl" v-loading="loading" />
  </div>
</template>
