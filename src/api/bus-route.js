import request from '@/utils/request'

// 添加车次
export function addBusRoute(data) {
  return request({
    url: '/busRoute/add',
    method: 'post',
    data
  })
}

// 查询车次
export function searchBusRoutes(data) {
  return request({
    url: '/busRoute/search',
    method: 'post',
    data
  })
}

// 删除车次
export function deleteBusRoute(id) {
  return request({
    url: '/busRoute/delete',
    method: 'delete',
    params: { id }
  })
}

// 批量删除车次
export function deleteBusRoutes(data) {
  return request({
    url: '/busRoute/batchDelete',
    method: 'delete',
    data
  })
}

// 修改车次
export function updateBusRoute(data) {
  return request({
    url: '/busRoute/update',
    method: 'put',
    data
  })
}
