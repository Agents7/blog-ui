<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ChatDotRound, StarFilled} from '@element-plus/icons-vue'
import { getArticleDetail, type ArticleVO } from '../api/article'
import { getCommentList, publishComment, type CommentVO } from '../api/comment'
import { followArticle, unfollowArticle, getArticleFollowStatus, reportUser } from '../api/interaction'

const route = useRoute()
const router = useRouter()
const articleId = ref<number>(Number(route.params.id))

const loading = ref(false)
const article = ref<ArticleVO | null>(null)
const comments = ref<CommentVO[]>([])
const commentContent = ref('')
const commentLoading = ref(false)
const isArticleFollowed = ref(false)
const reportDialogVisible = ref(false)
const reportReason = ref('')
const reportLoading = ref(false)

const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const fetchArticle = async () => {
  loading.value = true
  try {
    const res = await getArticleDetail(articleId.value)
    // @ts-ignore
    article.value = res.data || res
  } catch (error) {
    console.error('获取文章详情失败', error)
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}

const fetchComments = async () => {
  try {
    const res = await getCommentList(articleId.value)
    // @ts-ignore
    const list = res.data || res
    comments.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('获取评论列表失败', error)
    comments.value = []
  }
}

const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  commentLoading.value = true
  try {
    await publishComment({
      articleId: articleId.value,
      content: commentContent.value
    })
    ElMessage.success('评论发表成功')
    commentContent.value = ''
    fetchComments()
  } catch (error) {
    console.error('发表评论失败', error)
    ElMessage.error('发表评论失败')
  } finally {
    commentLoading.value = false
  }
}

const handleFollow = async () => {
  if (!articleId.value) return
  
  try {
    if (isArticleFollowed.value) {
      await unfollowArticle(articleId.value)
      isArticleFollowed.value = false
      ElMessage.success('已取消关注文章')
    } else {
      await followArticle(articleId.value)
      isArticleFollowed.value = true
      ElMessage.success('关注文章成功')
    }
  } catch (error) {
    console.error('操作失败', error)
  }
}

const openReportDialog = () => {
  reportReason.value = ''
  reportDialogVisible.value = true
}

const handleSubmitReport = async () => {
  if (!reportReason.value.trim()) {
    ElMessage.warning('请输入举报原因')
    return
  }
  const targetUserId =
    (article.value?.userId as number | undefined) ||
    (article.value?.createBy as number | undefined) ||
    (article.value?.user_id as number | undefined)
  if (!targetUserId) {
    ElMessage.error('无法获取被举报用户')
    return
  }
  reportLoading.value = true
  try {
    await reportUser({ targetUserId, reason: reportReason.value })
    ElMessage.success('举报已提交')
    reportDialogVisible.value = false
  } finally {
    reportLoading.value = false
  }
}

let commentEventSource: EventSource | null = null

const initCommentSse = () => {
  if (!articleId.value) return

  if (commentEventSource) {
    commentEventSource.close()
  }

  commentEventSource = new EventSource(`/api/comment/stream?articleId=${articleId.value}`)

  commentEventSource.onmessage = (event) => {
    if (!event?.data || event.data === 'PING') return
    try {
      const payload = JSON.parse(event.data)
      if (payload?.type === 'NEW_COMMENT' && Number(payload?.articleId) === articleId.value) {
        fetchComments()
      }
    } catch {
    }
  }

  commentEventSource.onerror = () => {
    commentEventSource?.close()
    commentEventSource = null
    setTimeout(() => initCommentSse(), 3000)
  }
}

const disposeCommentSse = () => {
  if (commentEventSource) {
    commentEventSource.close()
    commentEventSource = null
  }
}

const refreshByArticleId = async () => {
  if (!articleId.value) {
    ElMessage.error('文章ID不存在')
    router.push('/')
    return
  }

  fetchArticle()
  fetchComments()
  initCommentSse()

  getArticleFollowStatus(articleId.value).then(res => {
    // @ts-ignore
    isArticleFollowed.value = res.data || res
  })
}

onMounted(() => {
  refreshByArticleId()
})

watch(
  () => route.params.id,
  (val) => {
    const nextId = Number(val)
    if (Number.isNaN(nextId) || nextId <= 0) {
      articleId.value = 0
      disposeCommentSse()
      refreshByArticleId()
      return
    }
    if (nextId === articleId.value) return
    articleId.value = nextId
    disposeCommentSse()
    refreshByArticleId()
  }
)

onUnmounted(() => {
  disposeCommentSse()
})
</script>

<template>
  <div class="max-w-[800px] mx-auto py-8 px-4" v-loading="loading">
    <div v-if="article" class="bg-white rounded-lg shadow-sm p-8 mb-6">
      <!-- 标题 -->
      <h1 class="text-3xl font-bold text-gray-900 mb-6">{{ article.title }}</h1>
      
      <!-- 作者信息 -->
      <div class="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
        <el-avatar :size="50" :src="article.userAvatar || article.avatar || DEFAULT_AVATAR" />
        <div>
          <div class="font-bold text-lg text-gray-900">{{ article.userNickname || article.nickName || article.nickname || '匿名用户' }}</div>
          <div class="text-sm text-gray-500 mt-1" v-if="article.userSummary">{{ article.userSummary }}</div>
          <div class="text-xs text-gray-400 mt-1">
            发布于 {{ article.createTime }} · 阅读 {{ article.viewCount || 0 }}
          </div>
        </div>
      </div>

      <!-- 正文 -->
      <div class="prose max-w-none text-gray-800 leading-loose whitespace-pre-wrap text-lg">
        {{ article.content }}
      </div>

      <!-- 底部互动栏 -->
      <div class="flex items-center justify-end gap-6 mt-12 pt-6 border-t border-gray-100">
        <el-button 
          :type="isArticleFollowed ? 'primary' : 'default'" 
          :plain="!isArticleFollowed"
          round
          size="large"
          @click="handleFollow"
        >
          <el-icon class="mr-1"><StarFilled /></el-icon>
          {{ isArticleFollowed ? '已关注文章' : '关注文章' }}
        </el-button>
        <el-button type="warning" plain round size="large" @click="openReportDialog">
          举报作者
        </el-button>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="bg-white rounded-lg shadow-sm p-8">
      <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
        <el-icon><ChatDotRound /></el-icon>
        评论 ({{ comments.length }})
      </h2>

      <!-- 发表评论 -->
      <div class="mb-8">
        <el-input
          v-model="commentContent"
          type="textarea"
          :rows="3"
          placeholder="写下你的评论..."
          class="mb-3"
        />
        <div class="flex justify-end">
          <el-button type="primary" :loading="commentLoading" @click="handleSubmitComment">
            发表评论
          </el-button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="space-y-6">
        <div v-for="comment in comments" :key="comment.id" class="flex gap-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
          <el-avatar :size="40" :src="comment.userAvatar || DEFAULT_AVATAR" class="flex-shrink-0" />
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-gray-900">{{ comment.userNickname || '匿名用户' }}</span>
              <span class="text-xs text-gray-500">{{ comment.createTime }}</span>
            </div>
            <p class="text-gray-700 leading-relaxed">{{ comment.content }}</p>
          </div>
        </div>
        <div v-if="comments.length === 0" class="text-center text-gray-400 py-4">
          暂无评论，快来抢沙发吧~
        </div>
      </div>
    </div>

    <el-dialog v-model="reportDialogVisible" title="举报作者" width="520px" :close-on-click-modal="false">
      <el-input v-model="reportReason" type="textarea" :rows="4" placeholder="请输入举报原因（必填）" />
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="reportLoading" @click="handleSubmitReport">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
