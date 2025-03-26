import request from '@/utils/request'

// 获取会员信息
export function searchMember(data) {
  return request({
    url: '/member/search',
    method: 'post',
    data
  })
}

// 添加会员
export function addMember(data) {
  return request({
    url: '/member/add',
    method: 'post',
    data
  })
}
