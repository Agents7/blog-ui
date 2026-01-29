import request from '../utils/request'

export interface PageResult<T> {
  total: number
  records: T[]
}

export interface AdminUserVO {
  id: number
  username?: string
  nickname?: string
  status?: number
  followerCount?: number
  createTime?: string
  roleCode?: string
}

export function adminListUsers(params: { page: number; size: number; keyword?: string }) {
  return request<PageResult<AdminUserVO>>({
    url: '/user/admin/users',
    method: 'get',
    params
  })
}

export function adminBanUser(id: number) {
  return request<null>({
    url: `/user/admin/users/${id}/ban`,
    method: 'put'
  })
}

export function adminUnbanUser(id: number) {
  return request<null>({
    url: `/user/admin/users/${id}/unban`,
    method: 'put'
  })
}

export interface ReportVO {
  id: number
  reporterId: number
  reporterName?: string
  targetUserId: number
  targetUserName?: string
  reason: string
  status: number
  createTime?: string
  handleAdminId?: number
  handleAdminName?: string
  handleResult?: string
  handleTime?: string
}

export function adminListReports(params: { status?: number; page: number; size: number }) {
  return request<PageResult<ReportVO>>({
    url: '/interaction/admin/reports',
    method: 'get',
    params
  })
}

export function adminHandleReport(id: number, data: { action: 'BAN' | 'REJECT'; result?: string }) {
  return request<null>({
    url: `/interaction/admin/reports/${id}/handle`,
    method: 'put',
    data
  })
}

export interface UserArticleCountVO {
  userId: number
  count: number
}

export function adminUserArticleCount(params: { topN: number }) {
  return request<UserArticleCountVO[]>({
    url: '/article/admin/stats/user-article-count',
    method: 'get',
    params
  })
}

