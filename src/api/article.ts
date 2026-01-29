import request from '../utils/request'

export interface ArticleParams {
  title: string
  content: string
  categoryId: number
}

// 发布文章接口
export function publishArticle(data: ArticleParams) {
  return request<null>({
    url: '/article/publish',
    method: 'post',
    data,
  })
}

// 获取文章详情
export function getArticleDetail(id: number) {
  return request<ArticleVO>({
    url: `/article/${id}`,
    method: 'get'
  })
}

export interface ArticleQuery {
  pageNum: number
  pageSize: number
  categoryId?: number
}

export interface ArticleVO {
  id: number
  title: string
  content: string
  categoryId: number
  categoryName?: string
  createTime: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
  // 兼容下划线命名
  view_count?: number
  like_count?: number
  comment_count?: number
  userId?: number
  createBy?: number
  user_id?: number
  userNickname?: string
  userAvatar?: string
  userSummary?: string
  // 兼容可能的后端字段名
  nickName?: string // 后端返回的是 nickName
  nickname?: string
  avatar?: string
  isLiked?: boolean
  isFollowed?: boolean
  userFollowerCount?: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ArticleSearchResult {
  id: number
  title: string
  content: string
  userId: number
  categoryId: number
  tags?: string[]
  createTime: string
  highlightTitle?: string
  highlightContent?: string
}

// 获取文章列表（分页）
export function getArticleList(params: ArticleQuery) {
  return request<PageResult<ArticleVO>>({
    url: '/article/list',
    method: 'post',
    data: {
      page: params.pageNum,
      size: params.pageSize,
      categoryId: params.categoryId
    }
  })
}

export function searchArticles(params: { q: string; page?: number; size?: number }) {
  return request<{ total: number; records: ArticleSearchResult[] }>({
    url: '/article/search',
    method: 'get',
    params
  })
}
