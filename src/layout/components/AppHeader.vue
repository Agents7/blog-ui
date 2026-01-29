<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search, Bell, Message, Edit } from '@element-plus/icons-vue'
import { uploadAvatar } from '../../api/auth'
import { publishArticle } from '../../api/article'
import { getNotificationList, markAsRead, type NotificationVO } from '../../api/notification'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'

defineProps<{
  visible: boolean
}>()

defineEmits<{
  (e: 'open-user-center'): void
  (e: 'logout'): void
}>()

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const avatarUrl = computed(() => userStore.avatarUrl)
const dialogVisible = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const searchKeyword = ref('')

const handleSearch = () => {
  const q = searchKeyword.value.trim()
  if (!q) return
  router.push({ path: '/search', query: { q } })
}

// 通知相关
const unreadCount = computed(() => userStore.unreadCount)
const notifications = ref<NotificationVO[]>([])
const notificationLoading = ref(false)

// 获取通知列表
const fetchNotifications = async () => {
  notificationLoading.value = true
  try {
    const res = await getNotificationList({ page: 1, size: 5 })
    // @ts-ignore
    notifications.value = res.data?.records || res.records || []
  } catch (error) {
    console.error('获取通知列表失败', error)
  } finally {
    notificationLoading.value = false
  }
}

// 点击通知图标时处理
const handleNotificationClick = async () => {
  if (unreadCount.value > 0) {
    try {
      await markAsRead()
      userStore.setUnreadCount(0)
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }
  fetchNotifications()
}


const fetchUnreadCount = async () => {
  try {
    await userStore.fetchUnreadCount()
  } catch (error) {
    console.error('获取未读数量失败', error)
    userStore.setUnreadCount(0)
  }
}

// 发布相关
const publishDialogVisible = ref(false)
const publishFormRef = ref<FormInstance>()
const publishLoading = ref(false)

const publishForm = reactive({
  title: '',
  content: '',
  category: [] as number[]
})

const publishRules = reactive<FormRules>({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
})

const categoryOptions = [
  {
    value: 1,
    label: '文学',
    children: [
      { value: 2, label: '小说' },
      { value: 3, label: '散文' },
      { value: 4, label: '诗歌' },
    ]
  },
  {
    value: 5,
    label: '娱乐',
    children: [
      { value: 6, label: '明星' },
      { value: 7, label: '电影' },
      { value: 8, label: '音乐' },
      { value: 9, label: '演出' },
    ]
  },
  {
    value: 10,
    label: '生活',
    children: [
      { value: 11, label: '美食' },
      { value: 12, label: '旅行' },
      { value: 13, label: '时尚' },
      { value: 14, label: '家居' },
    ]
  },
  {
    value: 15,
    label: '游戏',
    children: [
      { value: 16, label: '手游' },
      { value: 17, label: '端游' },
      { value: 18, label: '主机' },
      { value: 19, label: '电竞' },
    ]
  }
]

const handlePublishClick = () => {
  publishDialogVisible.value = true
}

const handlePublishSubmit = async () => {
  if (!publishFormRef.value) return
  
  await publishFormRef.value.validate(async (valid) => {
    if (valid) {
      publishLoading.value = true
      try {
        // 取数组最后一个值作为 categoryId
        const categoryId = publishForm.category[publishForm.category.length - 1]
        
        await publishArticle({
          title: publishForm.title,
          content: publishForm.content,
          categoryId: categoryId!
        })
        
        ElMessage.success('发布成功')
        publishDialogVisible.value = false
        // 重置表单
        publishFormRef.value?.resetFields()
      } catch (error) {
        console.error('发布失败', error)
      } finally {
        publishLoading.value = false
      }
    }
  })
}

// 获取并更新头像
const fetchUserAvatar = async () => {
  try {
    await userStore.fetchUserInfo(true)
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// SSE 连接相关
let eventSource: EventSource | null = null

const initSSE = async (userInfo: any) => {
  try {
    authStore.hydrate()
    const token = authStore.token
    if (!token) return

    // 关闭旧连接
    if (eventSource) {
      eventSource.close()
    }

    // 建立新连接，通过 token 鉴权
    eventSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`)
    
    eventSource.onmessage = (event) => {
      console.log('收到 SSE 消息:', event.data)
      if (event.data === 'NEW_NOTIFICATION') {
        fetchUnreadCount()
        ElMessage.info('您有新的消息通知')
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE 连接错误，5秒后重试', error)
      eventSource?.close()
      // 简单的重连机制
      setTimeout(() => initSSE(userInfo), 5000)
    }
  } catch (error) {
    console.error('SSE 初始化失败', error)
  }
}

// 组件挂载时初始化 SSE 连接
onMounted(async () => {
  try {
    const userInfo = await userStore.fetchUserInfo()
    if (!userInfo) return
    initSSE(userInfo)
    fetchUnreadCount()
  } catch (error) {
    console.error('初始化失败', error)
  }
})

const handleAvatarClick = async () => {
  await fetchUserAvatar()
  dialogVisible.value = true
}

const handleUploadAvatar = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
     ElMessage.error('图片大小不能超过 2MB')
     return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await uploadAvatar(formData)
    // @ts-ignore
    if (res.code === 200) {
       ElMessage.success('头像上传成功')
       if (res.data) {
          userStore.setAvatar(res.data)
       }
    }
  } catch (error) {
    console.error('上传头像失败', error)
    ElMessage.error('上传头像失败')
  } finally {
    input.value = ''
  }
}

const handleConfirmAvatar = () => {
  dialogVisible.value = false
}
</script>



<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-[60px] flex items-center justify-center px-4 transition-transform duration-300"
    :class="visible ? 'translate-y-0' : '-translate-y-full'"
  >
    <div class="w-full max-w-[1200px] flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/')">
        <div class="text-orange-500 text-3xl font-black italic">LUOYU</div>
        <span class="text-xl font-bold">博客</span>
      </div>

      <!-- 搜索框 -->
      <div class="flex-1 max-w-[500px] mx-8">
        <div class="relative flex items-center bg-[#f0f2f5] rounded-full px-4 h-[36px] focus-within:ring-1 focus-within:ring-orange-400 transition-all">
          <el-icon class="text-gray-400 text-lg mr-2"><Search /></el-icon>
          <input 
            type="text" 
            placeholder="搜索感兴趣的内容" 
            class="flex-1 bg-transparent text-sm focus:outline-none"
            v-model="searchKeyword"
            @keydown.enter="handleSearch"
          >
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="flex items-center gap-6 text-gray-600">
        <el-popover
          placement="bottom"
          :width="300"
          trigger="click"
          @show="handleNotificationClick"
        >
        
          <template #reference>
            <div class="relative cursor-pointer">
              <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="flex items-center">
                <el-icon class="text-xl hover:text-orange-500"><Bell /></el-icon>
              </el-badge>
            </div>
          </template>
          
          <!-- 通知列表内容 -->
          <div class="max-h-[400px] overflow-y-auto">
            <h3 class="font-bold text-gray-900 mb-3 px-2">消息通知</h3>
            <div v-if="notificationLoading" class="py-4 text-center text-gray-400">加载中...</div>
            <div v-else-if="notifications.length === 0" class="py-8 text-center text-gray-400">暂无新消息</div>
            <div v-else class="space-y-2">
              <div 
                v-for="item in notifications" 
                :key="item.id"
                class="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <el-avatar :size="36" :src="item.senderAvatar" />
                <div class="flex-1">
                  <div class="text-sm">
                    <span class="font-bold text-gray-900">{{ item.senderName }}</span>
                    <span class="text-gray-600 ml-1">{{ item.content }}</span>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">{{ item.createTime }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-popover>
        
        <el-icon class="text-xl cursor-pointer hover:text-orange-500"><Message /></el-icon>
        <!-- 发布按钮 -->
        <el-button type="primary" round class="mr-2" @click="handlePublishClick">
          <el-icon class="mr-1"><Edit /></el-icon>
          发布
        </el-button>

        <!-- 头像框 -->
        <div @click="handleAvatarClick" class="cursor-pointer">
          <el-avatar :src="avatarUrl" />
        </div>
        <!-- 用户操作下拉菜单 -->
        <el-dropdown trigger="click">
          <div class="flex items-center gap-2 cursor-pointer hover:text-orange-500">
            <span class="text-sm">用户</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$emit('open-user-center')">个人中心</el-dropdown-item>
              <el-dropdown-item @click="router.push('/follow')">我的关注</el-dropdown-item>
              <el-dropdown-item divided @click="$emit('logout')">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>

  <!-- 修改头像弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    title="修改头像"
    width="400px"
    align-center
    append-to-body
  >
    <div class="flex flex-col items-center justify-center py-4">
      <el-avatar :size="100" :src="avatarUrl" class="mb-4" />
      <el-button type="primary" plain @click="handleUploadAvatar">更换头像</el-button>
      <input 
        type="file" 
        ref="fileInput" 
        style="display: none" 
        accept="image/*"
        @change="handleFileChange"
      >
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAvatar">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 发布文章弹窗 -->
  <el-dialog
    v-model="publishDialogVisible"
    title="发布文章"
    width="600px"
    align-center
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      ref="publishFormRef"
      :model="publishForm"
      :rules="publishRules"
      label-width="80px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="publishForm.title" placeholder="请输入文章标题" />
      </el-form-item>
      
      <el-form-item label="分类" prop="category">
        <el-cascader
          v-model="publishForm.category"
          :options="categoryOptions"
          :props="{ checkStrictly: true, value: 'value', label: 'label' }"
          placeholder="请选择文章分类"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <el-input
          v-model="publishForm.content"
          type="textarea"
          :rows="10"
          placeholder="请输入文章内容"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishLoading" @click="handlePublishSubmit">
          发布
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


