import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import ContentFeed from '../views/ContentFeed.vue'
import Login from '../components/Login.vue'

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
        path: 'rank',
        name: 'Rank',
        component: ContentFeed,
        meta: { title: '热门榜单' }
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
