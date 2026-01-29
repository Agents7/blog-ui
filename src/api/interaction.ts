import request from '../utils/request'
import type { PageResult, ArticleVO } from './article'


// 关注用户
export function followUser(userId: number) {
  return request<null>({
    url: `/follows/${userId}`,
    method: 'post'
  })
}

// 取消关注用户
export function unfollowUser(userId: number) {
  return request<null>({
    url: `/follows/${userId}`,
    method: 'delete'
  })
}

// 关注文章
export function followArticle(articleId: number) {
  return request<null>({
    url: `/follows/articles/${articleId}`,
    method: 'post'
  })
}

// 取消关注文章
export function unfollowArticle(articleId: number) {
  return request<null>({
    url: `/follows/articles/${articleId}`,
    method: 'delete'
  })
}

// 获取文章关注状态
export function getArticleFollowStatus(articleId: number) {
  return request<boolean>({
    url: `/follows/articles/${articleId}/status`,
    method: 'get'
  })
}

export interface UserVO {
  id: number
  username: string
  nickname: string
  avatar: string
  summary?: string
  isFollowed?: boolean
}

// 获取我的关注列表（文章Feed流）
export function getFollowList(params: { pageNum: number; pageSize: number }) {
  return request<PageResult<ArticleVO>>({
    url: '/article/follow-feed',
    method: 'post',
    data: {
      page: params.pageNum,
      size: params.pageSize
    }
  })
}

export function reportUser(data: { targetUserId: number; reason: string }) {
  return request<null>({
    url: '/interaction/report/user',
    method: 'post',
    data
  })
}
