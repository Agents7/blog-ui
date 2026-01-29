<template>
  <div class="bg-white rounded-lg shadow-sm p-4">
    <div class="flex items-center justify-between gap-3">
      <div class="text-base font-bold text-gray-900">
        搜索：{{ keyword }}
      </div>
      <div class="text-sm text-gray-500">
        共 {{ total }} 条
      </div>
    </div>

    <div class="mt-4">
      <div v-if="loading" class="py-8 text-center text-gray-400">加载中...</div>
      <div v-else-if="records.length === 0" class="py-10 text-center text-gray-400">暂无结果</div>
      <div v-else class="space-y-4">
        <div
          v-for="item in records"
          :key="item.id"
          class="p-4 border border-gray-100 rounded-lg hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer"
          @click="router.push(`/article/${item.id}`)"
        >
          <div
            class="text-lg font-bold text-gray-900 leading-snug"
            v-html="safeHighlight(item.highlightTitle || item.title)"
          ></div>
          <div
            class="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3"
            v-html="safeHighlight(item.highlightContent || item.content)"
          ></div>
          <div class="mt-3 text-xs text-gray-400">
            {{ item.createTime }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="total > pageSize" class="mt-6 flex justify-center">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="fetch"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchArticles, type ArticleSearchResult } from '../api/article'

const route = useRoute()
const router = useRouter()

const keyword = computed(() => (route.query.q as string) || '')
const page = ref(1)
const pageSize = 10
const total = ref(0)
const records = ref<ArticleSearchResult[]>([])
const loading = ref(false)

const safeHighlight = (html: string) => {
  const escaped = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
  return escaped
    .replace(/&lt;em&gt;/g, '<em class="text-orange-600 font-bold not-italic">')
    .replace(/&lt;\/em&gt;/g, '</em>')
}

const fetch = async () => {
  if (!keyword.value) {
    total.value = 0
    records.value = []
    return
  }
  loading.value = true
  try {
    const res = await searchArticles({ q: keyword.value, page: page.value, size: pageSize })
    total.value = res.data?.total || 0
    records.value = res.data?.records || []
  } finally {
    loading.value = false
  }
}

watch(
  () => keyword.value,
  () => {
    page.value = 1
    fetch()
  },
  { immediate: true }
)
</script>
