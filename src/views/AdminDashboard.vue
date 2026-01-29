<script setup lang="ts">
import { ref } from 'vue'
import AdminUsersPanel from './admin/AdminUsersPanel.vue'
import AdminReportsPanel from './admin/AdminReportsPanel.vue'
import AdminStatsPanel from './admin/AdminStatsPanel.vue'

const activeTab = ref<'users' | 'reports' | 'stats'>('users')
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="text-xl font-bold text-gray-900 mb-4">管理后台</div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="用户管理" name="users">
        <AdminUsersPanel />
      </el-tab-pane>
      <el-tab-pane label="举报审核" name="reports">
        <AdminReportsPanel />
      </el-tab-pane>
      <el-tab-pane label="发布统计" name="stats">
        <AdminStatsPanel />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

