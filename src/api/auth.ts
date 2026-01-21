import request from '../utils/request'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  roleId?: number
  roleCode?: string
  roleName?: string
}

// 登录接口
export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/user/auth/login',
    method: 'post',
    data,
  })
}

// 注册接口
export function register(data: RegisterParams) {
  return request<null>({
    url: '/user/auth/register',
    method: 'post',
    data,
  })
}
