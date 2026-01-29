<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UserCenterEdit from '../components/UserCenterEdit.vue'
import HeroSection from './components/HeroSection.vue'
import AppHeader from './components/AppHeader.vue'
import SideNavBar from './components/SideNavBar.vue'
import RightRecommends from './components/RightRecommends.vue'
import { SUB_NAVS_MAP } from '../constants/menus'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// Header 显示控制
const showStickyHeader = ref(false)

// 监听滚动事件
const handleScroll = () => {
  //获取当前滚动距离
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

// 当前选中的二级导航
const currentSubNav = ref('全部')

// 监听路由参数变化，同步选中状态
watch(() => route.query.sub, (newVal) => {
  if (newVal) {
    currentSubNav.value = newVal as string
  } else {
    currentSubNav.value = '全部'
  }
}, { immediate: true })

// 处理二级导航点击
const handleSubNavClick = (sub: string) => {
  currentSubNav.value = sub
  if (sub === '全部') {
    const query = { ...route.query }
    delete query.sub
    router.push({ query })
  } else {
    router.push({ query: { ...route.query, sub } })
  }
}

// 获取当前路由对应的二级导航列表
const currentSubNavs = computed(() => {
  // 匹配当前路由路径，找到对应的二级菜单
  const path = route.path
  // 简单匹配，实际可能需要更复杂的逻辑
  const key = Object.keys(SUB_NAVS_MAP).find(k => path.startsWith(k))
  return key ? SUB_NAVS_MAP[key] : []
})

// 个人中心弹窗控制
const showUserCenter = ref(false)

const handleLogout = () => {
  // 清除认证状态
  authStore.clearAuth()
  // 重置用户信息
  userStore.reset()
  // 显示退出登录成功消息
  ElMessage({
    message: '退出登录成功',
    type: 'success',
  })
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#f1f2f5] text-[#333]">
    <!-- Hero 区域 (大背景视频 + 搜索框) -->
    <HeroSection :visible="!showStickyHeader" />

    <!-- 顶部通栏 Sticky Header (滚动后显示) -->
    <AppHeader 
      :visible="showStickyHeader" 
      @open-user-center="showUserCenter = true"
      @logout="handleLogout"
    />

    <!-- 主体内容区 -->
    <div class="w-full max-w-[1200px] mx-auto pt-6 flex gap-5">
      <!-- 左侧大类导航 Sidebar -->
      <SideNavBar />

      <!-- 中间主要内容区 -->
      <main class="flex-1 min-w-0">
        <!-- 顶部二级分类导航 -->
        <div v-if="currentSubNavs && currentSubNavs.length > 0" class="bg-white rounded-lg shadow-sm px-4 py-3 mb-4 flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            v-for="sub in currentSubNavs" 
            :key="sub"
            @click="handleSubNavClick(sub)"
            class="text-sm font-medium px-2 py-1 rounded hover:text-orange-500 transition-colors relative"
            :class="currentSubNav === sub ? 'text-orange-600 font-bold' : 'text-gray-600'"
          >
            {{ sub }}
            <!-- 选中下划线 -->
            <div v-if="currentSubNav === sub" class="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-[3px] bg-orange-500 rounded-full"></div>
          </button>
        </div>

        <!-- 路由视图 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 右侧推荐区 -->
      <RightRecommends />
    </div>

    <!-- 个人中心编辑弹窗 -->
    <UserCenterEdit v-model="showUserCenter" />
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
