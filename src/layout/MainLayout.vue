<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Menu as IconMenu, 
  Trophy, 
  VideoCamera, 
  Coffee, 
  Monitor,
  Search,
  Bell,
  Message,
  User
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// Header 显示控制
const showStickyHeader = ref(false)

// 监听滚动事件
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  // 当滚动超过 Hero 区域高度（假设为 200px）时显示 Header
  showStickyHeader.value = scrollTop > 200
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 左侧大类导航
const mainNavs = [
  { path: '/recommend', name: '热门推荐', icon: IconMenu },
  { path: '/rank', name: '热门榜单', icon: Trophy },
  { path: '/entertainment', name: '娱乐', icon: VideoCamera },
  { path: '/life', name: '生活', icon: Coffee },
  { path: '/game', name: '游戏', icon: Monitor },
]

// 顶部二级导航配置
const subNavsMap: Record<string, string[]> = {
  '/recommend': ['全部', '视频', '文章', '讨论'],
  '/rank': ['总榜', '飙升榜', '新歌榜', '原创榜'],
  '/entertainment': ['全部', '明星', '电影', '音乐', '演出'],
  '/life': ['全部', '美食', '旅行', '时尚', '家居'],
  '/game': ['全部', '手游', '端游', '主机', '电竞'],
}

// 当前选中的二级导航
const currentSubNav = ref('全部')

// 获取当前路由对应的二级导航列表
const currentSubNavs = computed(() => {
  // 匹配当前路由路径，找到对应的二级菜单
  const path = route.path
  // 简单匹配，实际可能需要更复杂的逻辑
  const key = Object.keys(subNavsMap).find(k => path.startsWith(k))
  return key ? subNavsMap[key] : []
})

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#f1f2f5] text-[#333]">
    <!-- Hero 区域 (大背景视频 + 搜索框) -->
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
      <div class="absolute inset-0 bg-black/30"></div>

      <!-- 居中内容 -->
      <div class="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-8" v-if="!showStickyHeader">
          <div class="text-orange-500 text-5xl font-black italic drop-shadow-lg">LUOYU</div>
          <span class="text-3xl font-bold drop-shadow-lg tracking-wide">博客</span>
        </div>

        <!-- 大搜索框 -->
        <div class="w-full max-w-[600px] px-4" v-if="!showStickyHeader">
          <div class="relative flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 h-[50px] shadow-lg transition-all hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-400">
            <el-icon class="text-gray-500 text-xl mr-3"><Search /></el-icon>
            <input 
              type="text" 
              placeholder="搜索感兴趣的内容" 
              class="flex-1 bg-transparent text-gray-800 text-base placeholder-gray-500 focus:outline-none"
            >
            <button class="bg-orange-500 text-white px-6 py-1.5 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors ml-2">
              搜索
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 顶部通栏 Sticky Header (滚动后显示) -->
    <header 
      class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-[60px] flex items-center justify-center px-4 transition-transform duration-300"
      :class="showStickyHeader ? 'translate-y-0' : '-translate-y-full'"
    >
      <div class="w-full max-w-[1200px] flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
          <div class="text-orange-500 text-3xl font-black italic">LUOYU</div>
          <span class="text-xl font-bold">博客</span>
        </div>

        <!-- 搜索框 -->
        <div class="flex-1 max-w-[500px] mx-8">
          <div class="relative flex items-center bg-[#f0f2f5] rounded-full px-4 h-[36px] focus-within:ring-1 focus-within:ring-orange-400 transition-all">
            <el-icon class="text-gray-400 text-lg mr-2"><Search /></el-icon>
            <input 
              type="text" 
              placeholder="搜索感兴趣的内容" 
              class="flex-1 bg-transparent text-sm focus:outline-none"
            >
          </div>
        </div>

        <!-- 右侧操作区 -->
        <div class="flex items-center gap-6 text-gray-600">
          <el-icon class="text-xl cursor-pointer hover:text-orange-500"><Bell /></el-icon>
          <el-icon class="text-xl cursor-pointer hover:text-orange-500"><Message /></el-icon>
          <el-dropdown trigger="click">
            <div class="flex items-center gap-2 cursor-pointer hover:text-orange-500">
              <el-icon class="text-xl"><User /></el-icon>
              <span class="text-sm">用户</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主体内容区 -->
    <div class="w-full max-w-[1200px] mx-auto pt-6 flex gap-5">
      <!-- 左侧大类导航 Sidebar -->
      <aside class="w-[200px] flex-shrink-0 sticky top-[84px] h-[calc(100vh-84px)]">
        <div class="bg-white rounded-lg shadow-sm overflow-hidden py-2">
          <div class="px-4 py-2 text-gray-500 text-xs font-medium">热门导航</div>
          <nav class="space-y-1">
            <router-link 
              v-for="nav in mainNavs" 
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

      <!-- 中间主要内容区 -->
      <main class="flex-1 min-w-0">
        <!-- 顶部二级分类导航 -->
        <div v-if="currentSubNavs && currentSubNavs.length > 0" class="bg-white rounded-lg shadow-sm px-4 py-3 mb-4 flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            v-for="sub in currentSubNavs" 
            :key="sub"
            @click="currentSubNav = sub"
            class="text-sm font-medium px-2 py-1 rounded hover:text-orange-500 transition-colors relative"
            :class="currentSubNav === sub ? 'text-orange-600 font-bold' : 'text-gray-600'"
          >
            {{ sub }}
            <!-- 选中下划线 -->
            <div v-if="currentSubNav === sub" class="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-[3px] bg-orange-500 rounded-full"></div>
          </button>
        </div>

        <!-- 路由出口 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 右侧推荐区 (可选) -->
      <aside class="w-[280px] flex-shrink-0 hidden xl:block">
        <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 class="font-bold text-gray-800 mb-4">微博热搜</h3>
          <ul class="space-y-3">
            <li v-for="i in 5" :key="i" class="flex items-center justify-between text-sm cursor-pointer group">
              <div class="flex items-center gap-2">
                <span :class="i <= 3 ? 'text-orange-500' : 'text-gray-400'" class="font-bold w-4">{{ i }}</span>
                <span class="text-gray-700 group-hover:text-orange-500 truncate max-w-[160px]">这是一个热门的话题示例 {{ i }}</span>
              </div>
              <span class="text-gray-400 text-xs">hot</span>
            </li>
          </ul>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h3 class="font-bold text-gray-800 mb-4">可能感兴趣的人</h3>
          <div class="space-y-4">
             <div v-for="j in 3" :key="j" class="flex items-center gap-3">
               <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
               <div class="flex-1 min-w-0">
                 <div class="font-medium text-sm text-gray-800 truncate">推荐用户 {{ j }}</div>
                 <div class="text-xs text-gray-500 truncate">知名博主</div>
               </div>
               <button class="text-orange-500 border border-orange-500 rounded-full px-3 py-1 text-xs hover:bg-orange-50 flex-shrink-0">+ 关注</button>
             </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
