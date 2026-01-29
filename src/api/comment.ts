import request from '../utils/request'

export interface CommentVO {
  id: number
  content: string
  createTime: string
  userId: number
  userNickname: string
  userAvatar: string
  parentId?: number
}

export interface CommentParams {
  articleId: number
  content: string
  parentId?: number
}

// 获取评论列表
export function getCommentList(articleId: number) {
  return request<CommentVO[]>({
    url: `/comment/list`,
    method: 'get',
    params: { articleId }
  })
}

// 发表评论
export function publishComment(data: CommentParams) {
  return request<null>({
    url: '/comment/publish',
    method: 'post',
    data
  })
}