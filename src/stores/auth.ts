import { defineStore } from 'pinia'

const STORAGE_KEYS = {
  token: 'token',
  roleCode: 'roleCode',
  roleName: 'roleName',
} as const

type AuthPayload = {
  token: string
  roleCode?: string | null
  roleName?: string | null
}
// 安全的 localStorage 操作函数，避免在服务端渲染时出错
const safeGetItem = (key: string) => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}
// 安全的 localStorage 设置函数，避免在服务端渲染时出错
const safeSetItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, value)
}
// 安全的 localStorage 删除函数，避免在服务端渲染时出错
const safeRemoveItem = (key: string) => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}
// 认证状态管理 store，用于存储用户登录状态、角色信息等
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    roleCode: null as string | null,
    roleName: null as string | null,
    hydrated: false,
  }),
  getters: {
    // 是否已登录
    isLoggedIn: (state) => Boolean(state.token),
    // 是否为管理员
    isAdmin: (state) => state.roleCode === 'ROLE_ADMIN',
  },
  actions: {
    // 从 localStorage 中恢复认证状态
    hydrate() {
      if (this.hydrated) return
      this.token = safeGetItem(STORAGE_KEYS.token)
      this.roleCode = safeGetItem(STORAGE_KEYS.roleCode)
      this.roleName = safeGetItem(STORAGE_KEYS.roleName)
      this.hydrated = true
    },
    setAuth(payload: AuthPayload) {
      this.token = payload.token
      safeSetItem(STORAGE_KEYS.token, payload.token)

      const roleCode = payload.roleCode ?? null
      const roleName = payload.roleName ?? null

      this.roleCode = roleCode
      this.roleName = roleName

      if (roleCode) safeSetItem(STORAGE_KEYS.roleCode, roleCode)
      else safeRemoveItem(STORAGE_KEYS.roleCode)

      if (roleName) safeSetItem(STORAGE_KEYS.roleName, roleName)
      else safeRemoveItem(STORAGE_KEYS.roleName)
    },
    clearAuth() {
      // 清除认证状态
      this.token = null
      this.roleCode = null
      this.roleName = null

      // 清除 localStorage 中的认证信息
      safeRemoveItem(STORAGE_KEYS.token)
      safeRemoveItem(STORAGE_KEYS.roleCode)
      safeRemoveItem(STORAGE_KEYS.roleName)
    },
  },
})
