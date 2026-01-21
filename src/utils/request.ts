import axios, { type AxiosInstance } from 'axios'
import { setupInterceptors } from './interceptors'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 基础路径，配合 Vite 代理使用
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 设置拦截器
setupInterceptors(service)

export default service
