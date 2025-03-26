import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

// 用户登出
export function logout() {
  return request({
    url: '/user/logout',
    method: 'get'
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 修改用户信息
export function updateInfo(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: '/user/delete',
    method: 'delete',
    params: { id }
  })
}

// 批量删除用户
export function deleteUsers(data) {
  return request({
    url: '/user/batchDelete',
    method: 'delete',
    data
  })
}

// 设置用户状态
export function setUserStatus(id, status) {
  return request({
    url: '/user/status',
    method: 'put',
    params: { id, status }
  })
}

// 批量设置用户状态
export function setUsersStatus(data) {
  return request({
    url: '/user/batchSetStatus',
    method: 'put',
    data
  })
}
