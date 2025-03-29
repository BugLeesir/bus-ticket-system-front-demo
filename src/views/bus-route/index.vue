<template>
  <div style="margin-top: 20px; padding-left: 20px;">
    <!-- 搜索栏 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="4">
        <el-cascader
          v-model="searchModel.departure"
          :options="locations"
          placeholder="请选择出发地"
          clearable
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-cascader
          v-model="searchModel.destination"
          :options="locations"
          placeholder="请选择目的地"
          clearable
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-input v-model="searchModel.routeName" placeholder="车次名称" />
      </el-col>
      <el-col :xs="24" :sm="24" :md="7">
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
      <el-col :xs="24" :sm="12" :md="4">
        <el-select v-model="searchModel.priceRange" placeholder="票价">
          <el-option label="任意金额" value="any" />
          <el-option label="50以下" value="below50" />
          <el-option label="50~100" value="50to100" />
          <el-option label="100以上" value="above100" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-row style="margin-top: 20px;">
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
      <el-button type="success" @click="openAddBusRouteDialog">添加车次</el-button>
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px;" @click="searchBusRoutes">
        查询
      </el-button>
    </el-row>

    <!-- 车次信息表格 -->
    <el-table
      :data="busRoutes"
      style="width: 100%; margin-top: 20px;"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="120px">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="routeName" label="车次名称" width="160px" />
      <el-table-column prop="departure" label="出发地" width="150px" />
      <el-table-column prop="destination" label="目的地" width="150px" />
      <el-table-column prop="departureTime" label="出发时间" width="200px" />
      <el-table-column prop="arrivalTime" label="到达时间" width="200px" />
      <el-table-column prop="price" label="票价（单位：元）" width="150px" />
      <el-table-column prop="seatsTotal" label="总座位数" width="100px" />
      <el-table-column prop="seatsAvailable" label="可用座位数" width="100px" />
      <el-table-column label="操作" width="300px" align="center" header-align="center">
        <template slot-scope="scope">
          <el-button type="primary" @click="openEditBusRouteDialog(scope.row)">修改</el-button>
          <el-button type="danger" @click="deleteBusRoute(scope.row.routeId)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加车次表单 -->
    <el-dialog title="添加车次" :visible.sync="addBusRouteDialogVisible" width="30%">
      <el-form ref="addBusRouteForm" :model="newBusRoute" :rules="rules" label-width="100px">
        <el-form-item label="车次名称" prop="routeName">
          <el-input v-model="newBusRoute.routeName" placeholder="请输入车次名称" />
        </el-form-item>
        <el-form-item label="出发地" prop="departure">
          <el-cascader v-model="newBusRoute.departure" :options="locations" placeholder="请选择出发地" />
        </el-form-item>
        <el-form-item label="目的地" prop="destination">
          <el-cascader v-model="newBusRoute.destination" :options="locations" placeholder="请选择目的地" />
        </el-form-item>
        <el-form-item label="出发时间" prop="departureTime">
          <el-date-picker v-model="newBusRoute.departureTime" type="datetime" placeholder="请选择出发时间" />
        </el-form-item>
        <el-form-item label="到达时间" prop="arrivalTime">
          <el-date-picker v-model="newBusRoute.arrivalTime" type="datetime" placeholder="请选择到达时间" />
        </el-form-item>
        <el-form-item label="票价" prop="price">
          <el-input v-model="newBusRoute.price" placeholder="请输入票价" />
        </el-form-item>
        <el-form-item label="总座位数" prop="seatsTotal">
          <el-input v-model="newBusRoute.seatsTotal" placeholder="请输入总座位数" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addBusRouteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddBusRouteForm">确定</el-button>
      </div>
    </el-dialog>
    <!-- 修改车次表单 -->
    <el-dialog title="修改车次" :visible.sync="editBusRouteDialogVisible" width="30%">
      <el-form ref="editBusRouteForm" :model="editBusRoute" :rules="rules" label-width="100px">
        <el-form-item label="车次名称" prop="routeName">
          <el-input v-model="editBusRoute.routeName" placeholder="请输入车次名称" />
        </el-form-item>
        <el-form-item label="出发地" prop="departure">
          <el-cascader v-model="editBusRoute.departure" :options="locations" placeholder="请选择出发地" />
        </el-form-item>
        <el-form-item label="目的地" prop="destination">
          <el-cascader v-model="editBusRoute.destination" :options="locations" placeholder="请选择目的地" />
        </el-form-item>
        <el-form-item label="出发时间" prop="departureTime">
          <el-date-picker v-model="editBusRoute.departureTime" type="datetime" placeholder="请选择出发时间" />
        </el-form-item>
        <el-form-item label="到达时间" prop="arrivalTime">
          <el-date-picker v-model="editBusRoute.arrivalTime" type="datetime" placeholder="请选择到达时间" />
        </el-form-item>
        <el-form-item label="票价" prop="price">
          <el-input v-model="editBusRoute.price" placeholder="请输入票价" />
        </el-form-item>
        <el-form-item label="总座位数" prop="seatsTotal">
          <el-input v-model="editBusRoute.seatsTotal" placeholder="请输入总座位数" />
        </el-form-item>
        <el-form-item label="剩余座位数" prop="seatsAvailable">
          <el-input v-model="editBusRoute.seatsAvailable" placeholder="请输入剩余座位数" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editBusRouteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditBusRouteForm">确定</el-button>
      </div>
    </el-dialog>
    <!-- 分页 -->
    <el-pagination
      class="pagination"
      :current-page="searchModel.pageNum"
      :page-sizes="[4, 8, 10, 12]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script>
import { addBusRoute, searchBusRoutes, updateBusRoute, deleteBusRoute, deleteBusRoutes } from '@/api/bus-route'

export default {
  data() {
    return {
      searchModel: {
        departure: [],
        destination: [],
        routeName: '',
        departureTime: null,
        arrivalTime: null,
        priceRange: 'any', // 默认值为任意金额
        pageNum: 1,
        pageSize: 10
      },
      busRoutes: [],
      selectedBusRoutes: [],
      total: 0,
      addBusRouteDialogVisible: false,
      editBusRouteDialogVisible: false, // 控制修改车次弹窗的显示
      newBusRoute: {
        routeName: '',
        departure: [],
        destination: [],
        departureTime: null,
        arrivalTime: null,
        price: '',
        seatsTotal: '',
        seatsAvailable: ''
      },
      editBusRoute: { // 修改车次的变量
        routeId: '',
        routeName: '',
        departure: [],
        destination: [],
        departureTime: null,
        arrivalTime: null,
        price: '',
        seatsTotal: '',
        seatsAvailable: ''
      },
      rules: {
        routeName: [{ required: true, message: '请输入车次名称', trigger: 'blur' }],
        departure: [{ required: true, message: '请选择出发地', trigger: 'change' }],
        destination: [{ required: true, message: '请选择目的地', trigger: 'change' }],
        departureTime: [{ required: true, message: '请选择出发时间', trigger: 'change' }],
        arrivalTime: [
          { required: true, message: '请选择到达时间', trigger: 'change' },
          { validator: this.validateArrivalTime, trigger: 'change' }
        ],
        price: [{ required: true, message: '请输入票价', trigger: 'blur' }],
        seatsTotal: [
          { required: true, message: '请输入总座位数', trigger: 'blur' },
          { validator: this.validateSeatsTotal, trigger: 'blur' }
        ],
        seatsAvailable: [
          { required: true, message: '请输入剩余座位数', trigger: 'blur' },
          { validator: this.validateSeatsAvailable, trigger: 'blur' }
        ]
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
      ]
    }
  },
  mounted: function() {
    this.searchBusRoutes() // 组件加载时查询车次
  },
  methods: {
    searchBusRoutes() {
      const formatToLocalTime = date => {
        if (!date) return null
        const localDate = new Date(date)
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()) // 转换为本地时间
        return localDate.toISOString().slice(0, 19) // 保留日期和时间部分
      }

      const priceRange = {
        any: { priceLower: null, priceUpper: null }, // 任意金额
        below50: { priceLower: '0', priceUpper: '50' },
        '50to100': { priceLower: '50', priceUpper: '100' },
        above100: { priceLower: '100', priceUpper: null }
      }

      const data = {
        routeName: this.searchModel.routeName,
        departure: this.searchModel.departure.join(' '), // 将数组转换为字符串
        destination: this.searchModel.destination.join(' '), // 将数组转换为字符串
        departureTime: formatToLocalTime(this.searchModel.departureTime), // 转换为本地时间
        arrivalTime: formatToLocalTime(this.searchModel.arrivalTime), // 转换为本地时间
        priceLower: priceRange[this.searchModel.priceRange]?.priceLower || null,
        priceUpper: priceRange[this.searchModel.priceRange]?.priceUpper || null,
        pageNum: this.searchModel.pageNum,
        pageSize: this.searchModel.pageSize
      }

      searchBusRoutes(data)
        .then(response => {
          // 格式化时间字段
          this.busRoutes = response.data.list.map(route => ({
            ...route,
            departureTime: route.departureTime.slice(0, 19), // 保留日期和时间部分
            arrivalTime: route.arrivalTime.slice(0, 19) // 保留日期和时间部分
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('查询车次失败:', error)
          this.$message.error('查询车次失败，请稍后重试')
        })
    },
    handleSelectionChange(selected) {
      this.selectedBusRoutes = selected
    },
    batchDelete() {
      if (this.selectedBusRoutes.length === 0) {
        this.$message.warning('请先选择要删除的车次')
        return
      }

      this.$confirm('确定要批量删除选中的车次吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const ids = this.selectedBusRoutes.map(route => route.routeId)
          deleteBusRoutes({ ids })
            .then(response => {
              if (response.code === 200) {
                this.$message.success('批量删除成功')
                this.searchBusRoutes() // 重新加载车次列表
              } else {
                this.$message.error(response.msg || '批量删除失败')
              }
            })
            .catch(error => {
              console.error('批量删除车次失败:', error)
              this.$message.error('批量删除车次失败，请稍后重试')
            })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    openAddBusRouteDialog() {
      this.addBusRouteDialogVisible = true
      this.newBusRoute = {
        routeName: '',
        departure: [],
        destination: [],
        departureTime: null,
        arrivalTime: null,
        price: '',
        seatsTotal: '',
        seatsAvailable: ''
      }
    },
    submitAddBusRouteForm() {
      this.$refs.addBusRouteForm.validate(valid => {
        if (valid) {
          const formatToLocalTime = date => {
            const localDate = new Date(date)
            localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()) // 转换为本地时间
            return localDate.toISOString().slice(0, 19) // 保留日期和时间部分
          }

          const data = {
            routeName: this.newBusRoute.routeName,
            departure: this.newBusRoute.departure.join(' '), // 将数组转换为字符串
            destination: this.newBusRoute.destination.join(' '), // 将数组转换为字符串
            departureTime: formatToLocalTime(this.newBusRoute.departureTime), // 转换为本地时间
            arrivalTime: formatToLocalTime(this.newBusRoute.arrivalTime), // 转换为本地时间
            price: this.newBusRoute.price,
            seatsTotal: this.newBusRoute.seatsTotal
          }

          addBusRoute(data)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('车次添加成功')
                this.addBusRouteDialogVisible = false
                this.searchBusRoutes() // 重新加载车次列表
              } else {
                this.$message.error(response.msg || '添加失败')
              }
            })
            .catch(error => {
              console.error('添加车次失败:', error)
              this.$message.error('添加车次失败，请稍后重试')
            })
        } else {
          console.error('表单校验失败')
        }
      })
    },
    openEditBusRouteDialog(busRoute) {
      this.editBusRouteDialogVisible = true
      this.editBusRoute = {
        routeId: busRoute.routeId,
        routeName: busRoute.routeName,
        departure: busRoute.departure.split(' '), // 将字符串转换为数组
        destination: busRoute.destination.split(' '), // 将字符串转换为数组
        departureTime: new Date(busRoute.departureTime),
        arrivalTime: new Date(busRoute.arrivalTime),
        price: busRoute.price,
        seatsTotal: busRoute.seatsTotal,
        seatsAvailable: busRoute.seatsAvailable
      }
      this.originalSeatsTotal = busRoute.seatsTotal // 保存原始的总座位数
    },
    submitEditBusRouteForm() {
      this.$refs.editBusRouteForm.validate(valid => {
        if (valid) {
          const formatToLocalTime = date => {
            const localDate = new Date(date)
            localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset()) // 转换为本地时间
            return localDate.toISOString().slice(0, 19) // 保留日期和时间部分
          }

          const data = {
            routeId: this.editBusRoute.routeId,
            routeName: this.editBusRoute.routeName,
            departure: this.editBusRoute.departure.join(' '), // 将数组转换为字符串
            destination: this.editBusRoute.destination.join(' '), // 将数组转换为字符串
            departureTime: formatToLocalTime(this.editBusRoute.departureTime), // 转换为本地时间
            arrivalTime: formatToLocalTime(this.editBusRoute.arrivalTime), // 转换为本地时间
            price: this.editBusRoute.price,
            seatsTotal: this.editBusRoute.seatsTotal,
            seatsAvailable: this.editBusRoute.seatsAvailable
          }

          updateBusRoute(data)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('车次修改成功')
                this.editBusRouteDialogVisible = false
                this.searchBusRoutes() // 重新加载车次列表
              } else {
                this.$message.error(response.msg || '修改失败')
              }
            })
            .catch(error => {
              console.error('修改车次失败:', error)
              this.$message.error('修改车次失败，请稍后重试')
            })
        } else {
          console.error('表单校验失败')
        }
      })
    },
    deleteBusRoute(routeId) {
      this.$confirm('确定要删除该车次吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteBusRoute(routeId)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('车次删除成功')
                this.searchBusRoutes() // 重新加载车次列表
              } else {
                this.$message.error(response.msg || '删除失败')
              }
            })
            .catch(error => {
              console.error('删除车次失败:', error)
              this.$message.error('删除车次失败，请稍后重试')
            })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    handlePageChange(newPage) {
      this.searchModel.pageNum = newPage
      this.searchBusRoutes()
    },
    handleSizeChange(newSize) {
      this.searchModel.pageSize = newSize
      this.searchBusRoutes()
    },
    validateArrivalTime(rule, value, callback) {
      if (value && this.newBusRoute.departureTime && value <= this.newBusRoute.departureTime) {
        callback(new Error('到达时间必须晚于出发时间'))
      } else {
        callback()
      }
    },
    validateSeatsTotal(rule, value, callback) {
      const purchasedSeats = this.originalSeatsTotal - this.editBusRoute.seatsAvailable // 已购买座位数
      if (value < purchasedSeats) {
        callback(new Error(`总座位数不能小于已购买座位数（${purchasedSeats}）`))
      } else {
        callback()
      }
    },
    validateSeatsAvailable(rule, value, callback) {
      if (value > this.editBusRoute.seatsTotal) {
        callback(new Error('剩余座位数不能大于总座位数'))
      } else {
        callback()
      }
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
}
</style>
