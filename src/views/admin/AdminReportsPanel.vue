<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { adminHandleReport, adminListReports, type ReportVO } from '../../api/admin'

const loading = ref(false)
const status = ref<number | undefined>(0)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const records = ref<ReportVO[]>([])

const statusText = (s: number) => {
  if (s === 1) return '已处理(封禁)'
  if (s === 2) return '已驳回'
  return '待处理'
}

const statusType = (s: number) => {
  if (s === 1) return 'danger'
  if (s === 2) return 'info'
  return 'warning'
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminListReports({ status: status.value, page: page.value, size: size.value })
    const data = (res as any).data
    total.value = data?.total || 0
    records.value = data?.records || []
  } finally {
    loading.value = false
  }
}

const handleStatusChange = async () => {
  page.value = 1
  await fetchList()
}

const statusOptions = computed(() => [
  { label: '待处理', value: 0 },
  { label: '已处理(封禁)', value: 1 },
  { label: '已驳回', value: 2 },
])

const handleBan = async (row: ReportVO) => {
  const result = await ElMessageBox.prompt('请输入处理说明（可选）', '确认封禁并处理举报', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：经核实存在违规行为，封禁 30 天',
  })
  await adminHandleReport(row.id, { action: 'BAN', result: result.value })
  await fetchList()
}

const handleReject = async (row: ReportVO) => {
  const result = await ElMessageBox.prompt('请输入驳回原因（可选）', '确认驳回举报', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPlaceholder: '例如：证据不足，暂不处理',
  })
  await adminHandleReport(row.id, { action: 'REJECT', result: result.value })
  await fetchList()
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <el-select v-model="status" placeholder="状态" class="w-[200px]" @change="handleStatusChange">
        <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </div>

    <el-table :data="records" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column label="举报人" min-width="140">
        <template #default="{ row }">
          <div>{{ row.reporterName || row.reporterId }}</div>
        </template>
      </el-table-column>
      <el-table-column label="被举报用户" min-width="160">
        <template #default="{ row }">
          <div>{{ row.targetUserName || row.targetUserId }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" min-width="220" />
      <el-table-column label="状态" width="140">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="举报时间" min-width="170" />
      <el-table-column label="处理" min-width="220">
        <template #default="{ row }">
          <div v-if="row.status !== 0">
            <div class="text-sm text-gray-600">{{ row.handleAdminName || row.handleAdminId }}</div>
            <div class="text-xs text-gray-400">{{ row.handleTime }}</div>
            <div class="text-xs text-gray-500">{{ row.handleResult }}</div>
          </div>
          <div v-else class="text-gray-400 text-sm">未处理</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 0" type="danger" size="small" @click="handleBan(row)">封禁</el-button>
          <el-button v-if="row.status === 0" size="small" @click="handleReject(row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center mt-4" v-if="total > 0">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @current-change="fetchList"
        @size-change="fetchList"
        background
      />
    </div>
  </div>
</template>
