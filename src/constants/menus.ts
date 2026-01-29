import type { Component } from 'vue'
import {
  Menu as IconMenu,
  Platform,
  VideoCamera,
  Coffee,
  Monitor
} from '@element-plus/icons-vue'

export interface NavItem {
  path: string
  name: string
  icon: Component
}

// 左侧大类导航
export const MAIN_NAVS: NavItem[] = [
  { path: '/recommend', name: '热门推荐', icon: IconMenu },
  { path: '/literature', name: '文学', icon: Platform },
  { path: '/entertainment', name: '娱乐', icon: VideoCamera },
  { path: '/life', name: '生活', icon: Coffee },
  { path: '/game', name: '游戏', icon: Monitor },
]

// 顶部二级导航配置
export const SUB_NAVS_MAP: Record<string, string[]> = {
  '/recommend': ['热门榜单'],
  '/literature': ['全部', '小说', '散文', '诗歌'],
  '/entertainment': ['全部', '明星', '电影', '音乐', '演出'],
  '/life': ['全部', '美食', '旅行', '时尚', '家居'],
  '/game': ['全部', '手游', '端游', '主机', '电竞'],
}
