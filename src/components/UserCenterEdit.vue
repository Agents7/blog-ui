<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getUserInfo, updateUserInfo, type UserInfo } from '../api/auth'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const loading = ref(false)


// 定义表单数据
const form = reactive<UserInfo>({
  nickname: '',
  email: '',
  mobile: '',
  summary: '',
})

// 监听弹窗打开，获取用户信息
watch(() => props.modelValue, (val) => {
  if (val) {
    fetchUserInfo()
  }
})
// 回显用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await getUserInfo()
    const userInfo = (res as any).data || {}
    
    form.nickname = userInfo.nickname || ''
    form.email = userInfo.email || ''
    form.mobile = userInfo.mobile || ''
    form.summary = userInfo.summary || ''
  } catch (error) {
    console.error('获取用户信息失败', error)
  } finally {
    loading.value = false
  }
}

const rules = reactive<FormRules>({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  mobile: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})


const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        await updateUserInfo({
          nickname: form.nickname,
          email: form.email,
          mobile: form.mobile,
          summary: form.summary,
        })
        ElMessage({
          message: '个人信息修改成功',
          type: 'success',
        })
        visible.value = false
      } catch (error) {
        console.error('更新失败', error)
      } finally {
        loading.value = false
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>



<template>
  <el-dialog
    v-model="visible"
    title="个人中心"
    width="500px"
    destroy-on-close
    :close-on-click-modal="false"
    align-center
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      label-position="right"
      class="mt-4"
    >
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="form.mobile" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="个人简介" prop="summary">
        <el-input
          v-model="form.summary"
          type="textarea"
          :rows="3"
          placeholder="请输入个人简介"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSave">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<style scoped>
.avatar-uploader .el-upload {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
</style>
