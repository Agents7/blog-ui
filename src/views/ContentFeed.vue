<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, reactive, onMounted, watch } from 'vue'
import { ChatDotRound, View, StarFilled } from '@element-plus/icons-vue'
import { getArticleList, type ArticleVO } from '../api/article'
import { followUser, unfollowUser } from '../api/interaction'
import { ElMessage } from 'element-plus'


const DEFAULT_AVATAR = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
const ANONYMOUS_NAME = '匿名用户'

const router = useRouter()
const route = useRoute()
const categoryName = computed(() => route.meta.title || '推荐')

const loading = ref(false)
const articleList = ref<ArticleVO[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  categoryId: undefined as number | undefined
})

const categoryMap: Record<string, number> = {
  '文学': 1, '小说': 2, '散文': 3, '诗歌': 4,
  '娱乐': 5, '明星': 6, '电影': 7, '音乐': 8, '演出': 9,
  '生活': 10, '美食': 11, '旅行': 12, '时尚': 13, '家居': 14,
  '游戏': 15, '手游': 16, '端游': 17, '主机': 18, '电竞': 19
}

const handleFollow = async (article: ArticleVO, event: Event) => {
  event.stopPropagation()
  const targetUserId = article.userId || article.createBy || article.user_id
  
  if (!targetUserId) {
     ElMessage.warning('无法关注匿名用户')
     return
  }
  
  try {
    if (article.isFollowed) {
      await unfollowUser(targetUserId)
      article.isFollowed = false
      // Update other articles by same user in the list
      articleList.value.forEach(item => {
        const uid = item.userId || item.createBy || item.user_id
        if (uid === targetUserId) {
          item.isFollowed = false
          item.userFollowerCount = (item.userFollowerCount || 0) - 1
        }
      })
      ElMessage.success('取消关注成功')
    } else {
      await followUser(targetUserId)
      article.isFollowed = true
       // Update other articles by same user in the list
      articleList.value.forEach(item => {
        const uid = item.userId || item.createBy || item.user_id
        if (uid === targetUserId) {
          item.isFollowed = true
          item.userFollowerCount = (item.userFollowerCount || 0) + 1
        }
      })
      ElMessage.success('关注成功')
    }
  } catch (error) {
    console.error('操作失败', error)
  }
}



const fetchArticles = async () => {
  loading.value = true
  try {
    // 根据当前分类名获取 ID
    const name = route.meta.title as string
    const subName = route.query.sub as string
    
    if (subName && subName !== '全部' && categoryMap[subName]) {
      queryParams.categoryId = categoryMap[subName]
    } else {
      queryParams.categoryId = categoryMap[name]
    }
    
    const res = await getArticleList(queryParams)
    console.log('Article List Response:', res) // Debug log

    // @ts-ignore
    if (res.code === 200 || (res.records !== undefined)) { // 兼容不同返回结构
       // @ts-ignore
       const data = res.data || res
       articleList.value = data.records || []
       total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取文章列表失败', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  queryParams.pageNum = page
  fetchArticles()
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  fetchArticles()
}

watch(() => [route.path, route.query.sub], () => {
  queryParams.pageNum = 1
  fetchArticles()
})

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-4 min-h-[500px]">
    <h2 class="text-xl font-bold mb-4">{{ categoryName }}</h2>
    
    <div v-loading="loading" class="space-y-4">
      <div v-if="articleList.length === 0 && !loading" class="text-center py-10 text-gray-400">
        暂无内容
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
              <span class="hover:text-orange-500 cursor-pointer flex items-center gap-1"
                    :class="{ 'text-orange-500': article.isFollowed }"
                    @click="handleFollow(article, $event)">
                <el-icon><StarFilled /></el-icon> {{ article.userFollowerCount || 0 }}
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
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        size="small"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        background
      />
    </div>
  </div>
</template>
