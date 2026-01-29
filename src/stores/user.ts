import { defineStore } from 'pinia'
import { getUserInfo, type UserInfo } from '../api/auth'
import { getUnreadCount } from '../api/notification'

const DEFAULT_AVATAR =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    avatarUrl: DEFAULT_AVATAR,
    unreadCount: 0,
    loadingUserInfo: false,
  }),
  actions: {
    async fetchUserInfo(force = false) {
      if (this.loadingUserInfo) return this.userInfo
      if (this.userInfo && !force) return this.userInfo

      this.loadingUserInfo = true
      try {
        const res = await getUserInfo()
        const data = (res as any)?.data ?? null
        this.userInfo = data
        const avatar = data?.avatar ?? (data as any)?.userAvatar
        if (avatar) this.avatarUrl = avatar
        return this.userInfo
      } finally {
        this.loadingUserInfo = false
      }
    },
    setAvatar(url: string) {
      this.avatarUrl = url
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, avatar: url }
      }
    },
    async fetchUnreadCount() {
      const res = await getUnreadCount()
      const count = typeof res === 'number' ? res : ((res as any)?.data ?? 0)
      this.unreadCount = Number(count) || 0
      return this.unreadCount
    },
    setUnreadCount(count: number) {
      this.unreadCount = Number(count) || 0
    },
    reset() {
      this.userInfo = null
      this.avatarUrl = DEFAULT_AVATAR
      this.unreadCount = 0
    },
  },
})
