<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { adminBanUser, adminListUsers, adminUnbanUser, type AdminUserVO } from '../../api/admin'

const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const size = ref(10)
const total = ref(0)
const records = ref<AdminUserVO[]>([])

const statusLabel = (status?: number) => {
  if (status === 0) return '已封禁'
  return '正常'
}

const statusType = (status?: number) => {
  if (status === 0) return 'danger'
  return 'success'
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await adminListUsers({ page: page.value, size: size.value, keyword: keyword.value || undefined })
    const data = (res as any).data
    total.value = data?.total || 0
    records.value = data?.records || []
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  page.value = 1
  await fetchList()
}

const handleBan = async (row: AdminUserVO) => {
  await ElMessageBox.confirm(`确认封禁用户 ${row.username || row.id}？`, '提示', { type: 'warning' })
  await adminBanUser(row.id)
  await fetchList()
}

const handleUnban = async (row: AdminUserVO) => {
  await ElMessageBox.confirm(`确认解封用户 ${row.username || row.id}？`, '提示', { type: 'warning' })
  await adminUnbanUser(row.id)
  await fetchList()
}

const isBanned = computed(() => (row: AdminUserVO) => row.status === 0)

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3 mb-4">
      <el-input v-model="keyword" placeholder="搜索用户名/昵称" clearable class="max-w-[320px]" />
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <el-table :data="records" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="username" label="用户名" min-width="140" />
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column prop="roleCode" label="角色" width="130" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="注册时间" min-width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-if="!isBanned(row)" type="danger" size="small" @click="handleBan(row)">封禁</el-button>
          <el-button v-else type="primary" size="small" @click="handleUnban(row)">解封</el-button>
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
