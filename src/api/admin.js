import request from '@/utils/request'

// 获取会员信息
export function searchAdmin(data) {
  return request({
    url: '/admin/search',
    method: 'post',
    data
  })
}

// 添加会员
export function addAdmin(data) {
  return request({
    url: '/admin/add',
    method: 'post',
    data
  })
}
