<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StarryBackground from './StarryBackground.vue'
import { login, register } from '../api/auth'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
// 登录表单数据
const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const isRegister = ref(false) // 是否为注册模式

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为 3 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' },
  ],
})

const loading = ref(false)

// 切换登录/注册模式
const toggleMode = () => {
  isRegister.value = !isRegister.value
  formRef.value?.resetFields()
}

// 提交表单
const onSubmit = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isRegister.value) {
          // 注册逻辑
          await register({
            username: form.username,
            password: form.password
          })
          ElMessage({
            message: '注册成功，请登录',
            type: 'success',
          })
          isRegister.value = false // 切换回登录模式
        } else {
          // 登录逻辑
          const res = await login({
            username: form.username,
            password: form.password
          })
          
          const token = (res as any).data?.token
          const roleCode = (res as any).data?.roleCode
          const roleName = (res as any).data?.roleName
          
          if (token) {
            authStore.setAuth({ token, roleCode, roleName })
            ElMessage({
              message: '登录成功',
              type: 'success',
            })
            // 跳转到之前尝试访问的页面，或者主页
            const redirect = route.query.redirect as string
            router.push(redirect || '/')
          } else {
            // 如果 response 拦截器没有抛出错误，但也没有 token，可能需要处理
             ElMessage({
               message: '登录成功但未获取到 Token',
               type: 'warning',
             })
          }
        }
      } catch (error) {
        console.error(error)
        // 错误已经在 request.ts 拦截器中处理并提示了，这里可以不做额外提示
      } finally {
        loading.value = false
      }
    }
  })
}
</script>



<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <StarryBackground key="starry-background" />
    
    <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 transition-all duration-300 hover:shadow-blue-500/20">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-white tracking-wide">{{ isRegister ? '创建账号' : 'LuoYu博客' }}</h2>
        <p class="text-gray-300 text-sm mt-2 font-light">{{ isRegister ? '加入我们的社区' : '进入数据的宇宙' }}</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="space-y-4"
        size="large"
      >
        <el-form-item prop="username" label="用户名">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            class="glass-input"
          />
        </el-form-item>

        <el-form-item prop="password" label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
            class="glass-input"
          />
        </el-form-item>

        <div class="flex items-center justify-between mb-4" v-if="!isRegister">
          <el-checkbox v-model="form.remember" class="!text-gray-300">记住我</el-checkbox>
          <a href="#" class="text-sm text-blue-300 hover:text-blue-100 transition-colors">忘记密码？</a>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            class="w-full !bg-blue-600/80 !border-none hover:!bg-blue-500 !text-white !font-semibold !tracking-wide !h-12 !rounded-lg !shadow-lg hover:!shadow-blue-500/50 transition-all duration-300"
            :loading="loading"
            @click="onSubmit(formRef)"
          >
            {{ isRegister ? '创建账号' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="mt-6 text-center text-sm text-gray-400">
        {{ isRegister ? '已经有账号？' : "还没有账号？" }}
        <a href="#" class="text-blue-300 hover:text-blue-100 font-medium transition-colors" @click.prevent="toggleMode">
          {{ isRegister ? '登录' : '创建账号' }}
        </a>
      </div>
    </div>
  </div>
</template>



<style scoped>
/* Element Plus 的磨砂玻璃效果覆盖样式 */
:deep(.el-form-item__label) {
  color: #e2e8f0 !important; /* slate-200 */
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(147, 197, 253, 0.5) inset !important; /* blue-300 */
}

:deep(.el-input__inner) {
  color: white;
  height: 44px;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

:deep(.el-checkbox__label) {
  color: #d1d5db !important; /* gray-300 */
}

:deep(.el-checkbox__inner) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #3b82f6;
  border-color: #3b82f6;
}
</style>
