import request from '@/utils/request'

// 添加公告
export function addAnnouncement(data) {
  return request({
    url: '/announcement/add',
    method: 'post',
    data
  })
}

// 查询公告
export function searchAnnouncements(data) {
  return request({
    url: '/announcement/search',
    method: 'post',
    data
  })
}

// 删除公告
export function deleteAnnouncement(id) {
  return request({
    url: '/announcement/delete',
    method: 'delete',
    params: { id }
  })
}

// 批量删除公告
export function deleteAnnouncements(data) {
  return request({
    url: '/announcement/batchDelete',
    method: 'delete',
    data
  })
}

// 修改公告
export function updateAnnouncement(data) {
  return request({
    url: '/announcement/update',
    method: 'put',
    data
  })
}
