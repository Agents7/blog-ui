<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, reactive, onMounted } from 'vue'
import { ChatDotRound, View, StarFilled } from '@element-plus/icons-vue'
import { getFollowList, unfollowUser } from '../api/interaction'
import type { ArticleVO } from '../api/article'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const articleList = ref<ArticleVO[]>([])
const total = ref(0)
const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const ANONYMOUS_NAME = '匿名用户'

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
})

const fetchArticles = async () => {
  loading.value = true
  try {
    const res = await getFollowList(queryParams)
    // @ts-ignore
    if (res.code === 200 || (res.records !== undefined)) {
       // @ts-ignore
       const data = res.data || res
       articleList.value = data.records || []
       total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取关注文章列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleUnfollow = async (article: ArticleVO, event: Event) => {
  event.stopPropagation()
  
  const targetUserId = article.userId || article.createBy || article.user_id
  if (!targetUserId) return

  try {
    await ElMessageBox.confirm(
      `确定要取消关注作者 ${article.userNickname || article.nickName || '该用户'} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await unfollowUser(targetUserId)
    ElMessage.success('已取消关注')
    
    // 从列表中移除该作者的所有文章，或者重新加载列表
    // 简单起见，重新加载，因为可能有多篇文章属于同一个作者
    fetchArticles()
    
  } catch (error) {
    if (error !== 'cancel') {
        console.error('取消关注失败', error)
    }
  }
}

const handlePageChange = (page: number) => {
  queryParams.pageNum = page
  fetchArticles()
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-4 min-h-[500px]">
    <h2 class="text-xl font-bold mb-4">我的关注</h2>
    
    <div v-loading="loading" class="space-y-4">
      <div v-if="articleList.length === 0 && !loading" class="text-center py-10 text-gray-400">
        暂无关注内容
      </div>

      <div 
        v-for="article in articleList" 
        :key="article.id" 
        class="border-b border-gray-100 pb-4 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -mx-2"
        @click="router.push(`/article/${article.id}`)"
      >
        <div class="flex items-start gap-3">
          <el-avatar :size="40" :src="article.userAvatar || article.avatar || DEFAULT_AVATAR" class="flex-shrink-0" />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900">{{ article.userNickname || article.nickName || article.nickname || ANONYMOUS_NAME }}</span>
              <span class="text-xs text-gray-500">{{ article.createTime }}</span>
            </div>
            <h3 class="font-bold text-lg mb-1">{{ article.title }}</h3>
            <p class="text-gray-800 text-sm leading-relaxed mb-2 line-clamp-3">
              {{ article.content }}
            </p>
            <div class="flex items-center gap-6 mt-3 text-gray-500 text-sm">
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1">
                <el-icon><View /></el-icon> {{ article.viewCount || article.view_count || 0 }}
              </span>
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1 text-orange-500"
                    @click="handleUnfollow(article, $event)"
                    title="取消关注作者">
                <el-icon><StarFilled /></el-icon> 已关注
              </span>
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1">
                <el-icon><ChatDotRound /></el-icon> {{ article.commentCount || article.comment_count || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="flex justify-center mt-6" v-if="total > 0">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[20, 50]"
        :total="total"
        layout="total, prev, pager, next"
        size="small"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>
</template>
