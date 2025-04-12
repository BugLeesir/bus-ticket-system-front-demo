import request from '@/utils/request'

// 添加订单
export function addOrder(data) {
  return request({
    url: '/order/add',
    method: 'post',
    data
  })
}

// 查询订单
export function searchOrders(data) {
  return request({
    url: '/order/search',
    method: 'post',
    data
  })
}

// 查询单个订单
export function searchOrder(orderId) {
  return request({
    url: '/order/searchOrder',
    method: 'get',
    params: { orderId }
  })
}

// 删除订单
export function deleteOrder(id) {
  return request({
    url: '/order/delete',
    method: 'delete',
    params: { id }
  })
}

// 批量删除订单
export function deleteOrders(data) {
  return request({
    url: '/order/batchDelete',
    method: 'delete',
    data
  })
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'put',
    data
  })
}

// 支付订单
export function payOrder(orderId) {
  return request({
    url: '/order/payOrder',
    method: 'put',
    params: { orderId }
  })
}

// 取消订单
export function cancelOrder(orderId) {
  return request({
    url: '/order/cancelOrder',
    method: 'put',
    params: { orderId }
  })
}

// 重置订单
export function resetOrder(orderId) {
  return request({
    url: '/order/resetOrder',
    method: 'put',
    params: { orderId }
  })
}
