<template>
  <div class="admin-orders-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card-title">订单管理</span>
      </div>

      <!-- 查询条件 -->
      <el-form :model="searchModel" inline class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchModel.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchModel.orderStatus" placeholder="请选择订单状态" clearable>
            <el-option label="待支付" value="0" />
            <el-option label="已支付" value="1" />
            <el-option label="已取消" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchModel.createTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchOrders">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button
            type="danger"
            :disabled="selectedOrders.length === 0"
            @click="deleteSelectedOrders"
          >
            批量删除
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 订单表格 -->
      <el-table
        :data="orders"
        border
        style="width: 100%; margin-top: 20px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderId" label="订单号" width="200px" />
        <el-table-column prop="username" label="用户名" width="150px" />
        <el-table-column label="订单状态" width="120px">
          <template slot-scope="scope">
            <span>{{ formatOrderStatus(scope.row.orderStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="240px" />
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <div class="action-buttons">
              <el-button type="text" @click="viewOrderDetails(scope.row)">查看详情</el-button>
              <el-button
                v-if="scope.row.orderStatus === 0"
                type="primary"
                @click="updateOrderStatus(scope.row, 1)"
              >
                确认支付
              </el-button>
              <el-button
                v-if="scope.row.orderStatus === 0"
                type="danger"
                @click="updateOrderStatus(scope.row, 2)"
              >
                取消订单
              </el-button>
              <el-button type="danger" @click="deleteOrder(scope.row.orderId)">删除</el-button>
              <el-button type="warning" @click="resetOrder(scope.row.orderId)">重置订单</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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
      <el-form :model="orderDetail" label-width="120px">
        <el-form-item label="订单号">
          <span>{{ orderDetail.orderId }}</span>
        </el-form-item>
        <el-form-item label="用户名">
          <span>{{ orderDetail.username }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <span>{{ formatOrderStatus(orderDetail.orderStatus) }}</span>
        </el-form-item>
        <el-form-item label="创建时间">
          <span>{{ orderDetail.createTime }}</span>
        </el-form-item>
        <el-form-item label="乘客信息">
          <ul>
            <li v-for="detail in orderDetail.orderDetailList" :key="detail.detailId" class="detail-item">
              <div class="detail-field">
                <label>乘客姓名：</label>
                <el-input
                  v-model="detail.passengerName"
                  placeholder="乘客姓名"
                  :disabled="!detail.isEditing"
                />
              </div>
              <div class="detail-field">
                <label>座位号：</label>
                <el-input
                  v-model="detail.seatNumber"
                  placeholder="座位号"
                  :disabled="!detail.isEditing"
                />
              </div>
              <div class="detail-actions">
                <el-button
                  v-if="!detail.isEditing"
                  type="primary"
                  @click="enableEditing(detail)"
                >
                  修改
                </el-button>
                <el-button
                  v-if="detail.isEditing"
                  type="success"
                  @click="saveDetail(detail)"
                >
                  保存
                </el-button>
                <el-button
                  v-if="detail.isEditing"
                  type="danger"
                  @click="cancelEditing(detail)"
                >
                  取消
                </el-button>
              </div>
            </li>
          </ul>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { searchOrders, searchOrder, updateOrder, deleteOrder, deleteOrders, resetOrder, payOrder, cancelOrder } from '@/api/order'

export default {
  data() {
    return {
      orders: [], // 订单列表
      total: 0, // 总订单数
      searchModel: {
        username: '',
        orderStatus: '',
        createTime: [],
        pageNum: 1,
        pageSize: 10
      },
      selectedOrders: [], // 选中的订单
      orderDialogVisible: false, // 控制订单详情弹窗显示
      orderDetail: {} // 当前订单详情
    }
  },
  mounted() {
    this.searchOrders()
  },
  methods: {
    // 格式化订单状态
    formatOrderStatus(status) {
      const numericStatus = parseInt(status, 10) // 确保状态为数字类型
      switch (numericStatus) {
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
    // 查询订单
    searchOrders() {
      const data = {
        username: this.searchModel.username,
        orderStatus: this.searchModel.orderStatus,
        createTime: this.searchModel.createTime,
        pageNum: this.searchModel.pageNum,
        pageSize: this.searchModel.pageSize
      }
      searchOrders(data)
        .then(response => {
          this.orders = response.data.list.map(order => ({
            ...order,
            orderStatus: parseInt(order.orderStatus, 10) // 确保状态为数字类型
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('查询订单失败:', error)
          this.$message.error('查询订单失败，请稍后重试')
        })
    },
    // 重置查询条件
    resetSearch() {
      this.searchModel = {
        username: '',
        orderStatus: '',
        createTime: [],
        pageNum: 1,
        pageSize: 10
      }
      this.searchOrders()
    },
    // 查看订单详情
    viewOrderDetails(order) {
      searchOrder(order.orderId)
        .then(response => {
          this.orderDetail = {
            ...response.data,
            orderDetailList: response.data.orderDetailList.map(detail => ({
              ...detail,
              isEditing: false // 默认不允许编辑
            }))
          }
          this.orderDialogVisible = true
        })
        .catch(error => {
          console.error('加载订单详情失败:', error)
          this.$message.error('加载订单详情失败，请稍后重试')
        })
    },
    // 更新订单详情
    updateOrderDetails() {
      updateOrder(this.orderDetail)
        .then(() => {
          this.$message.success('订单详情更新成功')
          this.orderDialogVisible = false
          this.searchOrders()
        })
        .catch(error => {
          console.error('更新订单详情失败:', error)
          this.$message.error('更新订单详情失败，请稍后重试')
        })
    },
    // 更新订单状态
    updateOrderStatus(order, status) {
      const action = status === 1 ? payOrder : cancelOrder // 根据状态选择接口
      const actionText = status === 1 ? '支付' : '取消'

      this.$confirm(`确定要${actionText}该订单吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          action(order.orderId)
            .then(() => {
              this.$message.success(`订单已成功${actionText}`)
              this.searchOrders() // 刷新订单列表
            })
            .catch(error => {
              console.error(`${actionText}订单失败:`, error)
              this.$message.error(`${actionText}订单失败，请稍后重试`)
            })
        })
        .catch(() => {
          this.$message.info(`已取消${actionText}`)
        })
    },
    // 删除订单
    deleteOrder(orderId) {
      deleteOrder(orderId)
        .then(() => {
          this.$message.success('订单删除成功')
          this.searchOrders()
        })
        .catch(error => {
          console.error('删除订单失败:', error)
          this.$message.error('删除订单失败，请稍后重试')
        })
    },
    // 批量删除订单
    deleteSelectedOrders() {
      if (this.selectedOrders.length === 0) {
        this.$message.warning('请选择要删除的订单')
        return
      }
      const ids = this.selectedOrders.map(order => order.orderId)
      const data = { ids } // 符合后端的传参格式
      deleteOrders(data)
        .then(() => {
          this.$message.success('批量删除成功')
          this.searchOrders() // 刷新订单列表
        })
        .catch(error => {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败，请稍后重试')
        })
    },
    // 分页大小变化
    handleSizeChange(size) {
      this.searchModel.pageSize = size
      this.searchOrders()
    },
    // 当前页变化
    handlePageChange(page) {
      this.searchModel.pageNum = page
      this.searchOrders()
    },
    // 处理表格选中项
    handleSelectionChange(selection) {
      this.selectedOrders = selection
    },
    // 启用编辑模式
    enableEditing(detail) {
      detail.isEditing = true
    },
    // 保存单个订单详情
    saveDetail(detail) {
      const data = {
        detailId: detail.detailId,
        orderId: this.orderDetail.orderId,
        passengerName: detail.passengerName,
        seatNumber: detail.seatNumber
      }
      updateOrder(data)
        .then(() => {
          this.$message.success('订单详情更新成功')
          detail.isEditing = false // 退出编辑模式
        })
        .catch(error => {
          console.error('更新订单详情失败:', error)
          this.$message.error('更新订单详情失败，请稍后重试')
        })
    },
    // 取消编辑模式
    cancelEditing(detail) {
      const originalDetail = this.orderDetail.orderDetailList.find(
        d => d.detailId === detail.detailId
      )
      detail.passengerName = originalDetail.passengerName
      detail.seatNumber = originalDetail.seatNumber
      detail.isEditing = false
    },
    // 重置订单
    resetOrder(orderId) {
      this.$confirm('确定要重置该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          resetOrder(orderId)
            .then(() => {
              this.$message.success('订单已成功重置')
              this.searchOrders() // 刷新订单列表
            })
            .catch(error => {
              console.error('重置订单失败:', error)
              this.$message.error('重置订单失败，请稍后重试')
            })
        })
        .catch(() => {
          this.$message.info('已取消重置')
        })
    }
  }
}
</script>

<style scoped>
.admin-orders-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.box-card {
  max-width: 1000px;
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

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.detail-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-field label {
  width: 80px;
  font-weight: bold;
  color: #333;
}

.detail-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.action-buttons {
  display: flex;
  flex-direction: column; /* 垂直排列按钮 */
  gap: 10px; /* 按钮之间的间距 */
}

.el-button {
  border-radius: 4px;
}
</style>
