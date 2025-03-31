import request from '@/utils/request'

// 添加留言
export function addMessage(data) {
  return request({
    url: '/message/add',
    method: 'post',
    data
  })
}

// 查询留言
export function searchMessages(data) {
  return request({
    url: '/message/search',
    method: 'post',
    data
  })
}

// 删除留言
export function deleteMessage(id) {
  return request({
    url: '/message/delete',
    method: 'delete',
    params: { id }
  })
}

// 批量删除留言
// export function deleteMessages(data) {
//   return request({
//     url: '/message/batchDelete',
//     method: 'delete',
//     data
//   })
// }

// 修改留言
export function updateMessage(data) {
  return request({
    url: '/message/update',
    method: 'put',
    data
  })
}
