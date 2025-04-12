<template>
  <div class="my-orders-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card-title">我的订单</span>
      </div>
      <el-table :data="orders" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="orderId" label="订单号" width="160px" />
        <el-table-column prop="routeName" label="车次名称" width="100px" />
        <el-table-column label="订单状态" width="100px">
          <template slot-scope="scope">
            <span>{{ formatOrderStatus(scope.row.orderStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200px" />
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button type="text" @click="viewOrderDetails(scope.row)">查看详情</el-button>
              <el-button
                v-if="scope.row.orderStatus === 0"
                type="primary"
                @click="payOrder(scope.row.orderId)"
              >
                确认支付
              </el-button>
              <el-button
                v-if="scope.row.orderStatus === 0"
                type="danger"
                @click="cancelOrder(scope.row.orderId)"
              >
                取消支付
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        :current-page="searchModel.pageNum"
        :page-sizes="[5, 10, 20]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="orderDialogVisible" width="50%">
      <div>
        <p><strong>订单号：</strong>{{ orderDetail.orderId }}</p>
        <p><strong>车次名称：</strong>{{ orderDetail.routeName }}</p>
        <p><strong>订单状态：</strong>{{ formatOrderStatus(orderDetail.orderStatus) }}</p>
        <p><strong>创建时间：</strong>{{ orderDetail.createTime }}</p>
        <p><strong>乘客信息：</strong></p>
        <ul>
          <li v-for="detail in orderDetail.orderDetailList" :key="detail.detailId">
            {{ detail.passengerName }} - 座位号：{{ detail.seatNumber }}
          </li>
        </ul>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { searchOrders, searchOrder, payOrder, cancelOrder } from '@/api/order'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      orders: [], // 订单列表
      total: 0, // 总订单数
      searchModel: {
        username: '', // 用户名
        pageNum: 1, // 当前页
        pageSize: 10 // 每页显示数量
      },
      orderDialogVisible: false, // 控制订单详情弹窗显示
      orderDetail: {} // 当前订单详情
    }
  },
  computed: {
    ...mapGetters(['name']) // 从 getter 中获取用户名
  },
  mounted() {
    this.loadOrders()
  },
  methods: {
    // 格式化订单状态
    formatOrderStatus(status) {
      switch (status) {
        case 0:
          return '待支付'
        case 1:
          return '已支付'
        case 2:
          return '已取消'
        default:
          return '未知状态'
      }
    },
    // 加载订单列表
    loadOrders() {
      const data = {
        username: this.name, // 从 getter 中获取用户名
        pageNum: this.searchModel.pageNum,
        pageSize: this.searchModel.pageSize
      }
      searchOrders(data)
        .then(response => {
          this.orders = response.data.list.map(order => ({
            ...order,
            orderStatus: parseInt(order.orderStatus, 10) // 确保状态是数字类型
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('加载订单失败:', error)
          this.$message.error('加载订单失败，请稍后重试')
        })
    },
    // 查看订单详情
    viewOrderDetails(order) {
      searchOrder(order.orderId)
        .then(response => {
          this.orderDetail = {
            ...response.data,
            routeName: order.routeName, // 从订单列表中获取车次名称
            orderStatus: order.orderStatus // 从订单列表中获取订单状态
          }
          this.orderDialogVisible = true
        })
        .catch(error => {
          console.error('加载订单详情失败:', error)
          this.$message.error('加载订单详情失败，请稍后重试')
        })
    },
    // 确认支付
    payOrder(orderId) {
      payOrder(orderId)
        .then(() => {
          this.$message.success('支付成功')
          this.loadOrders() // 刷新订单列表
        })
        .catch(error => {
          console.error('支付失败:', error)
          this.$message.error('支付失败，请稍后重试')
        })
    },
    // 取消支付
    cancelOrder(orderId) {
      cancelOrder(orderId)
        .then(() => {
          this.$message.success('订单已取消')
          this.loadOrders() // 刷新订单列表
        })
        .catch(error => {
          console.error('取消支付失败:', error)
          this.$message.error('取消支付失败，请稍后重试')
        })
    },
    // 分页大小变化
    handleSizeChange(size) {
      this.searchModel.pageSize = size
      this.loadOrders()
    },
    // 当前页变化
    handlePageChange(page) {
      this.searchModel.pageNum = page
      this.loadOrders()
    }
  }
}
</script>

<style scoped>
.my-orders-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.box-card {
  max-width: 800px;
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

.action-buttons {
  display: flex;
  flex-direction: column; /* 垂直排列按钮 */
  gap: 10px; /* 按钮之间的间距 */
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.el-dialog {
  border-radius: 8px;
}

.dialog-footer {
  text-align: right;
}

.el-button {
  border-radius: 4px;
}
</style>
