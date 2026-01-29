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

export interface UserInfo {
  id?: number
  nickname: string
  email?: string
  mobile?: string
  summary?: string
  createTime?: string
  avatar?: string
}

export interface UpdateUserParams {
  nickname?: string
  email?: string
  mobile?: string
  summary?: string
  avatar?: string
}

// 登录接口
export function login(data: LoginParams) {
  return request<LoginResult>({
    url: '/user/login',
    method: 'post',
    data,
  })
}

// 注册接口
export function register(data: RegisterParams) {
  return request<null>({
    url: '/user/register',
    method: 'post',
    data,
  })
}

// 获取用户信息
export function getUserInfo() {
  return request<UserInfo>({
    url: '/user/getuser',
    method: 'get',
  })
}

export function getUserBatch(ids: number[]) {
  return request<UserInfo[]>({
    url: '/user/batch',
    method: 'get',
    params: { ids },
  })
}

// 更新用户信息
export function updateUserInfo(data: UpdateUserParams) {
  return request<UserInfo>({
    url: '/user/updateuser',
    method: 'put',
    data,
  })
}

// 上传头像
export function uploadAvatar(data: FormData) {
  return request<string>({
    url: '/user/upload',
    method: 'post',
    data,
  })
}
