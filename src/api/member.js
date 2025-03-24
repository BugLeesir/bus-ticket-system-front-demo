import request from '@/utils/request'

// 获取会员信息
export function searchMember(data) {
  return request({
    url: '/member/search',
    method: 'post',
    data
  })
}
