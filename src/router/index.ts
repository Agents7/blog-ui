import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import MainLayout from '../layout/MainLayout.vue'
import ContentFeed from '../views/ContentFeed.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import FollowList from '../views/FollowList.vue'
import SearchResult from '../views/SearchResult.vue'
import Login from '../components/Login.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import { pinia } from '../stores/pinia'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/recommend',
    children: [
      {
        path: 'recommend',
        name: 'Recommend',
        component: ContentFeed,
        meta: { title: '热门推荐' }
      },
      {
        path: 'literature',
        name: 'Literature',
        component: ContentFeed,
        meta: { title: '文学' }
      },
      {
        path: 'entertainment',
        name: 'Entertainment',
        component: ContentFeed,
        meta: { title: '娱乐' }
      },
      {
        path: 'life',
        name: 'Life',
        component: ContentFeed,
        meta: { title: '生活' }
      },
      {
        path: 'game',
        name: 'Game',
        component: ContentFeed,
        meta: { title: '游戏' }
      },
      {
        path: 'follow',
        name: 'FollowList',
        component: FollowList,
        meta: { title: '我的关注' }
      },
      {
        path: 'article/:id',
        name: 'ArticleDetail',
        component: ArticleDetail,
        meta: { title: '文章详情' }
      },
      {
        path: 'search',
        name: 'SearchResult',
        component: SearchResult,
        meta: { title: '搜索' }
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: '管理后台', requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const authStore = useAuthStore(pinia)

// 路由守卫
router.beforeEach((to, _from, next) => {

  authStore.hydrate()

  if (to.path !== '/login' && !authStore.isLoggedIn) {
    // 如果没有 token 且访问的不是登录页，重定向到登录页
    ElMessage({
      message: '请先登录',
      type: 'warning',
    })
    // 存储目标路由，登录后跳转回目标路由
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    // 如果已经有 token 且访问的是登录页，重定向到首页
    next({ path: '/' })
  } else if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) {
      ElMessage({
        message: '无权限访问管理后台',
        type: 'error',
      })
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
