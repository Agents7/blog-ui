import request from '../utils/request'

export interface NotificationVO {
  id: number
  senderId: number
  senderName: string
  senderAvatar: string
  type: string
  content: string
  isRead: boolean
  createTime: string
}

export interface PageResult<T> {
  total: number
  records: T[]
}

// 获取未读数量
export function getUnreadCount() {
  return request<number>({
    url: '/notifications/unread-count',
    method: 'get'
  })
}

// 获取通知列表
export function getNotificationList(params: { page: number; size: number }) {
  return request<PageResult<NotificationVO>>({
    url: '/notifications',
    method: 'get',
    params
  })
}

// 标记所有为已读
export function markAsRead() {
  return request<null>({
    url: '/notifications/read',
    method: 'put'
  })
}
