<template>
  <aside class="w-[200px] flex-shrink-0 sticky top-[84px] h-[calc(100vh-84px)]">
    <div class="bg-white rounded-lg shadow-sm overflow-hidden py-2">
      <div class="px-4 py-2 text-gray-500 text-xs font-medium">热门导航</div>
      <nav class="space-y-1">
        <router-link 
          v-for="nav in MAIN_NAVS" 
          :key="nav.path" 
          :to="nav.path"
          class="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
          active-class="bg-orange-50 text-orange-600 border-r-4 border-orange-500"
        >
          <el-icon class="text-lg"><component :is="nav.icon" /></el-icon>
          {{ nav.name }}
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { MAIN_NAVS } from '../../constants/menus'
</script>
