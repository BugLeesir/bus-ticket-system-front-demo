<template>
  <div class="dashboard-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card-title">订单统计</span>
      </div>

      <!-- 图表区域 -->
      <div class="charts">
        <div id="order-status-chart" class="chart" />
        <div id="route-orders-chart" class="chart" />
        <div id="order-trend-chart" class="chart" />
        <div id="seat-distribution-chart" class="chart" />
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { searchOrders } from '@/api/order'

export default {
  data() {
    return {
      orders: [] // 全部订单数据
    }
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    // 加载订单数据
    loadOrders() {
      const data = {
        pageNum: 1,
        pageSize: 9999 // 获取所有订单
      }
      searchOrders(data)
        .then((response) => {
          this.orders = response.data.list
          this.renderCharts()
        })
        .catch((error) => {
          console.error('加载订单数据失败:', error)
          this.$message.error('加载订单数据失败，请稍后重试')
        })
    },
    // 渲染图表
    renderCharts() {
      this.renderOrderStatusChart()
      this.renderRouteOrdersChart()
      this.renderOrderTrendChart()
      this.renderSeatDistributionChart()
    },
    // 订单状态分布图
    renderOrderStatusChart() {
      const statusCounts = { pending: 0, paid: 0, cancelled: 0 }
      this.orders.forEach((order) => {
        if (order.orderStatus === '0') statusCounts.pending++
        else if (order.orderStatus === '1') statusCounts.paid++
        else if (order.orderStatus === '2') statusCounts.cancelled++
      })

      const chart = echarts.init(document.getElementById('order-status-chart'))
      const option = {
        title: {
          text: '订单状态分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: '10%',
          left: 'center'
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '50%',
            data: [
              { value: statusCounts.pending, name: '待支付' },
              { value: statusCounts.paid, name: '已支付' },
              { value: statusCounts.cancelled, name: '已取消' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
    },
    // 车次订单分布图
    renderRouteOrdersChart() {
      const routeCounts = {}
      this.orders.forEach((order) => {
        const routeName = order.routeName || '未知车次'
        routeCounts[routeName] = (routeCounts[routeName] || 0) + 1
      })

      const chart = echarts.init(document.getElementById('route-orders-chart'))
      const option = {
        title: {
          text: '车次订单分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: Object.keys(routeCounts),
          axisLabel: {
            interval: 0, // 强制显示所有车次名称
            rotate: 30 // 旋转车次名称，避免重叠
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '订单数量',
            type: 'bar',
            data: Object.values(routeCounts)
          }
        ]
      }
      chart.setOption(option)
    },
    // 订单创建时间趋势图
    renderOrderTrendChart() {
      const dateCounts = {}
      this.orders.forEach((order) => {
        const date = order.createTime.split(' ')[0] // 提取日期部分
        dateCounts[date] = (dateCounts[date] || 0) + 1
      })

      const sortedDates = Object.keys(dateCounts).sort() // 按日期排序
      const chart = echarts.init(document.getElementById('order-trend-chart'))
      const option = {
        title: {
          text: '订单创建时间趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: sortedDates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '订单数量',
            type: 'line',
            data: sortedDates.map((date) => dateCounts[date])
          }
        ]
      }
      chart.setOption(option)
    },
    // 乘客座位分布图
    renderSeatDistributionChart() {
      const seatCounts = {}
      this.orders.forEach((order) => {
        order.orderDetailList.forEach((detail) => {
          const seatNumber = detail.seatNumber || '未知座位'
          seatCounts[seatNumber] = (seatCounts[seatNumber] || 0) + 1
        })
      })

      const chart = echarts.init(document.getElementById('seat-distribution-chart'))
      const option = {
        title: {
          text: '乘客座位分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: Object.keys(seatCounts),
          axisLabel: {
            interval: 0, // 强制显示所有座位号
            rotate: 30 // 旋转座位号，避免重叠
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '乘客数量',
            type: 'bar',
            data: Object.values(seatCounts)
          }
        ]
      }
      chart.setOption(option)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.box-card {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.charts {
  display: flex;
  flex-direction: column; /* 每个图表占一行 */
  gap: 40px; /* 图表之间的间距 */
  margin-top: 20px;
}

.chart {
  width: 100%; /* 图表宽度占满 */
  height: 500px; /* 增加图表高度 */
}
</style>
