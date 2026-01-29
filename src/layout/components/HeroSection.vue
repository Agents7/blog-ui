<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

defineProps<{
  visible: boolean
}>()

const router = useRouter()
const keyword = ref('')

const handleSearch = () => {
  const q = keyword.value.trim()
  if (!q) return
  router.push({ path: '/search', query: { q } })
}
</script>


<template>
  <div class="relative w-full h-[400px] overflow-hidden">
    <!-- 背景视频 -->
    <video 
      autoplay 
      loop 
      muted 
      playsinline
      class="absolute top-0 left-0 w-full h-full object-cover"
      poster="https://w.tv.sohu.com/user/202105/20/W53a0604856f743c391746979.jpg"
    >
      <source src="https://a.sinaimg.cn/mintra/pic/2112130543/weibo_login.mp4" type="video/mp4">
    </video>
    
    <!-- 遮罩层，让文字更清晰 -->
    <div class="absolute inset-0 bg-black/20"></div>

    <!-- 居中内容 -->
    <div class="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
      <!-- Logo -->
      <div class="flex items-center gap-3 mb-8" v-if="visible">
        <div class="text-orange-500 text-5xl font-black italic drop-shadow-lg">LUOYU</div>
        <span class="text-3xl font-bold drop-shadow-lg tracking-wide">博客</span>
      </div>

      <!-- 大搜索框 -->
      <div class="w-full max-w-[600px] px-4" v-if="visible">
        <div class="relative flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 h-[50px] shadow-lg transition-all hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-400">
          <el-icon class="text-gray-500 text-xl mr-3"><Search /></el-icon>
          <input 
            type="text" 
            placeholder="搜索感兴趣的内容" 
            class="flex-1 bg-transparent text-gray-800 text-base placeholder-gray-500 focus:outline-none"
            v-model="keyword"
            @keydown.enter="handleSearch"
          >
          <button class="bg-orange-500 text-white px-6 py-1.5 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors ml-2" @click="handleSearch">
            搜索
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

