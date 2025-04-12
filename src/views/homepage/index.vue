<template>
  <div class="homepage-container">
    <!-- 公告栏 -->
    <el-card class="announcement-section">
      <h3 class="section-title">最新公告</h3>
      <el-table :data="latestAnnouncements" border style="width: 100%">
        <el-table-column prop="title" label="公告标题" />
        <el-table-column prop="publishDate" label="发布时间" width="180px" />
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="viewAnnouncement(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="section-footer">
        <el-button type="primary" @click="openAllAnnouncementsDialog">查看全部公告</el-button>
      </div>
    </el-card>

    <!-- 查看全部公告弹窗 -->
    <el-dialog title="公告列表" :visible.sync="allAnnouncementsDialogVisible" width="60%">
      <el-table :data="announcements" border style="width: 100%">
        <el-table-column prop="title" label="公告标题" />
        <el-table-column prop="publishDate" label="发布时间" width="180px" />
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="text" @click="viewAnnouncement(scope.row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        :current-page="announcementSearchModel.pageNum"
        :page-sizes="[4, 10, 20]"
        :page-size="announcementSearchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleAnnouncementSizeChange"
        @current-change="handleAnnouncementPageChange"
      />
    </el-dialog>

    <!-- 公告详情弹窗 -->
    <el-dialog title="公告详情" :visible.sync="viewAnnouncementDialogVisible" width="50%">
      <h3>{{ currentAnnouncement.title }}</h3>
      <p class="publish-date">发布时间：{{ currentAnnouncement.publishDate }}</p>
      <div class="announcement-content" v-html="currentAnnouncement.content" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="viewAnnouncementDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 车次筛选 -->
    <el-card class="bus-route-section">
      <h3 class="section-title">车次信息</h3>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="3">
          <el-cascader
            v-model="searchModel.departure"
            :options="locations"
            placeholder="请选择出发地"
            clearable
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="3">
          <el-cascader
            v-model="searchModel.destination"
            :options="locations"
            placeholder="请选择目的地"
            clearable
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="3">
          <el-input v-model="searchModel.routeName" placeholder="车次名称" />
        </el-col>
        <el-col :xs="24" :sm="24" :md="6">
          <el-date-picker
            v-model="searchModel.departureTime"
            type="datetime"
            placeholder="出发时间"
            style="width: 45%; margin-right: 10px;"
          />
          <el-date-picker
            v-model="searchModel.arrivalTime"
            type="datetime"
            placeholder="到达时间"
            style="width: 45%;"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="3">
          <el-select v-model="searchModel.priceRange" placeholder="票价">
            <el-option label="任意金额" value="any" />
            <el-option label="50以下" value="below50" />
            <el-option label="50~100" value="50to100" />
            <el-option label="100以上" value="above100" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="3">
          <el-button type="primary" icon="el-icon-search" @click="searchBusRoutes">查询</el-button>
        </el-col>
      </el-row>
      <el-table :data="busRoutes" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="routeName" label="车次名称" width="180px" />
        <el-table-column prop="departure" label="出发地" width="180px" />
        <el-table-column prop="destination" label="目的地" width="180px" />
        <el-table-column prop="departureTime" label="出发时间" width="240px" />
        <el-table-column prop="arrivalTime" label="到达时间" width="240px" />
        <el-table-column prop="price" label="票价（单位：元）" width="150px" />
        <el-table-column prop="seatsTotal" label="总座位数" width="150px" />
        <el-table-column prop="seatsAvailable" label="可用座位数" width="150px" />
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="primary" @click="openBookingDialog(scope.row)">订票</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

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

    <!-- 订票弹窗 -->
    <el-dialog title="订票" :visible.sync="bookingDialogVisible" width="30%">
      <el-form ref="bookingForm" :model="bookingData" label-width="100px">
        <el-form-item label="车次名称">
          <span>{{ bookingData.routeName }}</span>
        </el-form-item>
        <el-form-item label="票数">
          <el-input-number v-model="bookingData.ticketCount" :min="1" :max="5" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bookingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBooking">下一步</el-button>
      </div>
    </el-dialog>

    <!-- 确认乘客信息弹窗 -->
    <el-dialog title="确认乘客信息" :visible.sync="passengerDialogVisible" width="40%">
      <el-form ref="passengerForm" :model="passengerData" label-width="100px">
        <div v-for="(passenger, index) in passengerData.passengers" :key="index">
          <el-form-item :label="'乘客' + (index + 1)">
            <el-input v-model="passenger.name" placeholder="请输入乘客姓名" />
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passengerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">确认</el-button>
      </div>
    </el-dialog>

    <!-- 订单详情弹窗 -->
    <el-dialog title="订单详情" :visible.sync="orderDialogVisible" width="50%">
      <div>
        <p><strong>订单号：</strong>{{ orderDetail.orderId }}</p>
        <p><strong>车次名称：</strong>{{ orderDetail.routeName }}</p>
        <p><strong>乘客信息：</strong></p>
        <ul>
          <li v-for="detail in orderDetail.orderDetailList" :key="detail.detailId">
            {{ detail.passengerName }} - 座位号：{{ detail.seatNumber }}
          </li>
        </ul>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="payOrder(orderDetail.orderId)">支付订单</el-button>
        <el-button type="danger" @click="cancelOrder(orderDetail.orderId)">取消支付</el-button>
        <el-button @click="orderDialogVisible = false">暂存支付</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { searchAnnouncements } from '@/api/announcement'
import { searchBusRoutes } from '@/api/bus-route'
import { addOrder, searchOrder, payOrder, cancelOrder } from '@/api/order'

export default {
  name: 'Dashboard',
  data() {
    return {
      latestAnnouncements: [], // 最新公告
      announcements: [], // 所有公告
      total: 0, // 公告总数
      announcementSearchModel: {
        pageNum: 1,
        pageSize: 5
      },
      allAnnouncementsDialogVisible: false, // 控制查看全部公告弹窗的显示
      viewAnnouncementDialogVisible: false, // 控制公告详情弹窗的显示
      currentAnnouncement: {
        title: '',
        publishDate: '',
        content: ''
      },
      locations: [
        {
          value: '江西省',
          label: '江西省',
          children: [
            { value: '南昌市', label: '南昌市' },
            { value: '赣州市', label: '赣州市' },
            { value: '九江市', label: '九江市' }
          ]
        },
        {
          value: '广东省',
          label: '广东省',
          children: [
            { value: '广州市', label: '广州市' },
            { value: '深圳市', label: '深圳市' },
            { value: '珠海市', label: '珠海市' }
          ]
        },
        {
          value: '浙江省',
          label: '浙江省',
          children: [
            { value: '杭州市', label: '杭州市' },
            { value: '宁波市', label: '宁波市' },
            { value: '温州市', label: '温州市' }
          ]
        },
        {
          value: '北京市',
          label: '北京市',
          children: [
            { value: '东城区', label: '东城区' },
            { value: '西城区', label: '西城区' },
            { value: '朝阳区', label: '朝阳区' }
          ]
        },
        {
          value: '上海市',
          label: '上海市',
          children: [
            { value: '黄浦区', label: '黄浦区' },
            { value: '徐汇区', label: '徐汇区' },
            { value: '长宁区', label: '长宁区' }
          ]
        }
      ],
      searchModel: {
        departure: [],
        destination: [],
        routeName: '',
        departureTime: null,
        arrivalTime: null,
        priceRange: 'any',
        pageNum: 1,
        pageSize: 10
      },
      busRoutes: [],
      bookingDialogVisible: false,
      bookingData: {
        routeId: '',
        routeName: '',
        ticketCount: 1
      },
      passengerDialogVisible: false,
      passengerData: {
        passengers: []
      },
      orderDialogVisible: false,
      orderDetail: {}
    }
  },
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    this.loadLatestAnnouncements()
    this.searchBusRoutes()
  },
  methods: {
    // 加载最新公告
    loadLatestAnnouncements() {
      searchAnnouncements({ pageNum: 1, pageSize: 1 }).then(response => {
        this.latestAnnouncements = response.data.list.map(announcement => ({
          ...announcement,
          publishDate: this.formatDateTime(announcement.publishTime) // 格式化发布时间
        }))
      })
    },
    // 打开查看全部公告弹窗
    openAllAnnouncementsDialog() {
      this.allAnnouncementsDialogVisible = true
      this.loadAllAnnouncements()
    },
    // 加载所有公告
    loadAllAnnouncements() {
      const data = {
        pageNum: this.announcementSearchModel.pageNum,
        pageSize: this.announcementSearchModel.pageSize
      }
      searchAnnouncements(data)
        .then(response => {
          this.announcements = response.data.list.map(announcement => ({
            ...announcement,
            publishDate: this.formatDateTime(announcement.publishTime) // 格式化发布时间
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('加载公告失败:', error)
          this.$message.error('加载公告失败，请稍后重试')
        })
    },
    // 查看公告详情
    viewAnnouncement(announcement) {
      this.currentAnnouncement = {
        title: announcement.title,
        publishDate: this.formatDateTime(announcement.publishTime), // 格式化发布时间
        content: announcement.content
      }
      this.viewAnnouncementDialogVisible = true
    },
    // 格式化时间
    formatDateTime(date) {
      if (!date) return ''
      const localDate = new Date(date)
      localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
      return localDate.toISOString().replace('T', ' ').slice(0, 19) // 转换为 YYYY-MM-DD HH:mm:ss
    },
    // 公告分页大小变化
    handleAnnouncementSizeChange(size) {
      this.announcementSearchModel.pageSize = size
      this.loadAllAnnouncements()
    },
    // 公告当前页变化
    handleAnnouncementPageChange(page) {
      this.announcementSearchModel.pageNum = page
      this.loadAllAnnouncements()
    },
    // 查询车次
    searchBusRoutes() {
      const formatToLocalTime = date => {
        if (!date) return null
        const localDate = new Date(date)
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
        return localDate.toISOString().slice(0, 19)
      }

      const priceRange = {
        any: { priceLower: null, priceUpper: null },
        below50: { priceLower: '0', priceUpper: '50' },
        '50to100': { priceLower: '50', priceUpper: '100' },
        above100: { priceLower: '100', priceUpper: null }
      }

      const data = {
        routeName: this.searchModel.routeName,
        departure: this.searchModel.departure.join(' '),
        destination: this.searchModel.destination.join(' '),
        departureTime: formatToLocalTime(this.searchModel.departureTime),
        arrivalTime: formatToLocalTime(this.searchModel.arrivalTime),
        priceLower: priceRange[this.searchModel.priceRange]?.priceLower || null,
        priceUpper: priceRange[this.searchModel.priceRange]?.priceUpper || null,
        pageNum: this.searchModel.pageNum,
        pageSize: this.searchModel.pageSize
      }

      searchBusRoutes(data)
        .then(response => {
          this.busRoutes = response.data.list.map(route => ({
            ...route,
            departureTime: route.departureTime.slice(0, 19),
            arrivalTime: route.arrivalTime.slice(0, 19)
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('查询车次失败:', error)
          this.$message.error('查询车次失败，请稍后重试')
        })
    },
    // 分页大小变化
    handleSizeChange(size) {
      this.searchModel.pageSize = size
      this.searchBusRoutes()
    },
    // 当前页变化
    handlePageChange(page) {
      this.searchModel.pageNum = page
      this.searchBusRoutes()
    },
    // 打开订票弹窗
    openBookingDialog(route) {
      this.bookingDialogVisible = true
      this.bookingData.routeId = route.routeId
      this.bookingData.routeName = route.routeName
    },
    // 确认订票
    confirmBooking() {
      this.bookingDialogVisible = false
      this.passengerDialogVisible = true
      this.passengerData.passengers = Array.from({ length: this.bookingData.ticketCount }, () => ({
        name: ''
      }))
    },
    // 提交订单
    submitOrder() {
      const data = {
        userId: this.$store.getters.userId,
        routeId: this.bookingData.routeId,
        passengerNames: this.passengerData.passengers.map(p => p.name)
      }
      addOrder(data).then(response => {
        this.passengerDialogVisible = false
        this.loadOrderDetail(response.data)
        this.searchBusRoutes() // 刷新车次表单
      })
    },
    // 加载订单详情
    loadOrderDetail(orderId) {
      searchOrder(orderId).then(response => {
        this.orderDetail = response.data
        this.orderDialogVisible = true
      })
    },
    // 支付订单
    payOrder(orderId) {
      payOrder(orderId).then(() => {
        this.$message.success('支付成功')
        this.orderDialogVisible = false
      })
    },
    // 取消订单
    cancelOrder(orderId) {
      cancelOrder(orderId).then(() => {
        this.$message.success('订单已取消')
        this.orderDialogVisible = false
      })
    }
  }
}
</script>

<style scoped>
.homepage-container {
  padding: 20px;
  background-color: #f9f9f9;
}

.announcement-section,
.bus-route-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
}

.section-footer {
  margin-top: 20px;
  text-align: right;
}

.announcement-content {
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap; /* 保留原始格式 */
}

.publish-date {
  color: gray;
  font-size: 12px;
  margin-bottom: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
