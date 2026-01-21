import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

// 定义统一的接口响应结构
export interface Result<T = any> {
  code: number
  message: string
  data: T
}

export const setupInterceptors = (service: AxiosInstance) => {
  // 请求拦截器
  service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  service.interceptors.response.use(
    (response: AxiosResponse) => {
      const { code, message } = response.data as Result

      // 假设 200 为成功状态码
      if (code === 200) {
        return response.data
      } else {
        ElMessage.error(message || '系统错误')

        // 处理特定错误码，例如 401 未登录
        if (code === 401) {
          localStorage.removeItem('token')
          // 这里可以添加跳转到登录页的逻辑
        }

        return Promise.reject(new Error(message || 'Error'))
      }
    },
    (error: any) => {
      let message = error.message || '请求失败'
      if (error.response?.data?.message) {
        message = error.response.data.message
      }

      // 处理 HTTP 状态码
      const status = error.response?.status
      if (status === 401) {
        message = '未授权，请登录'
        localStorage.removeItem('token')
      } else if (status === 403) {
        message = '拒绝访问'
      } else if (status === 404) {
        message = '请求资源不存在'
      } else if (status === 500) {
        message = '服务器内部错误'
      }

      ElMessage.error(message)
      return Promise.reject(error)
    }
  )
}
