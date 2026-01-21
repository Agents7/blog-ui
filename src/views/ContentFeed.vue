<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const categoryName = computed(() => route.meta.title || '推荐')
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-4 min-h-[500px]">
    <h2 class="text-xl font-bold mb-4">{{ categoryName }}</h2>
    <div class="space-y-4">
      <!-- 模拟内容列表 -->
      <div v-for="i in 10" :key="i" class="border-b border-gray-100 pb-4 last:border-0">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900">用户名称</span>
              <span class="text-xs text-gray-500">2小时前</span>
            </div>
            <p class="text-gray-800 text-sm leading-relaxed mb-2">
              这是关于 {{ categoryName }} 的一条模拟动态内容。这里会有一些有趣的文字描述，吸引用户点击查看详情。
            </p>
            <div class="grid grid-cols-3 gap-2 max-w-[300px]">
              <div class="aspect-square bg-gray-100 rounded"></div>
              <div class="aspect-square bg-gray-100 rounded"></div>
              <div class="aspect-square bg-gray-100 rounded"></div>
            </div>
            <div class="flex items-center gap-6 mt-3 text-gray-500 text-sm">
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1">
                <i class="el-icon-chat-dot-square"></i> 转发
              </span>
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1">
                <i class="el-icon-chat-dot-round"></i> 评论
              </span>
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1">
                <i class="el-icon-thumb"></i> 点赞
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
