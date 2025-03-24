<template>
  <div style="margin-top: 20px; padding-left: 20px;">
    <!-- 搜索栏 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-input v-model="searchModel.username" placeholder="用户名" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-input v-model="searchModel.phone" placeholder="手机号" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-date-picker v-model="searchModel.registerTime" type="daterange" placeholder="注册时间" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-button type="primary" icon="el-icon-search" @click="searchMembers">查询</el-button>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-row style="margin-top: 20px;">
      <el-button type="danger" @click="batchDelete">删除</el-button>
      <el-dropdown split-button type="primary" style="margin-left: 10px; margin-right: 10px;" @click="setState">
        {{ stateType === '1' ? '启用' : '停用' }}
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="changeStateBottomType('1')">启用</el-dropdown-item>
          <el-dropdown-item @click.native="changeStateBottomType('0')">停用</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-row>

    <!-- 会员信息表格 -->
    <el-table :data="members" style="width: 100%; margin-top: 20px;" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column
        label="序号"
        width="120px"
      >
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="130px" />
      <el-table-column prop="email" label="邮箱" width="280px" />
      <el-table-column prop="phone" label="手机号" width="200px" />
      <el-table-column prop="status" label="是否启用" width="100px">
        <template v-slot="scope">
          <el-tag :type="scope.row.status ? 'success' : 'danger'">
            {{ scope.row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="registerTime" label="注册时间" width="400px" />
      <el-table-column
        label="操作"
        width="400px"
        align="center"
        header-align="center"
      >
        <template v-slot="scope">
          <el-button type="primary" @click="editMember(scope.row)">修改</el-button>
          <el-button type="danger" @click="deleteMember(scope.row.id)">删除</el-button>
          <el-button type="warning" @click="toggleStatus(scope.row)">
            {{ scope.row.status ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
import { searchMember } from '@/api/member'
export default {
  data() {
    return {
      searchModel: {
        username: '',
        phone: '',
        registerTime: [],
        pageNum: 1,
        pageSize: 10
      },
      members: [
        { id: 1, username: '张三', email: 'zhangsan@example.com', phone: '13800000000', status: 1, registerTime: '2024-03-20' },
        { id: 2, username: '李四', email: 'lisi@example.com', phone: '13900000000', status: 0, registerTime: '2024-03-18' }
      ],
      selectedMembers: [],
      stateType: ''
    }
  },
  mounted: function() {
    this.searchMembers()
  },
  methods: {
    searchMembers() {
      // 清空会员列表
      this.members = []
      // 转换日期为本地时间
      if (this.searchModel.registerTime.length === 2) {
        this.searchModel.registerTime = this.searchModel.registerTime.map(date => {
          const localDate = new Date(date)
          localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
          return localDate.toISOString().split('T')[0]
        })
      }
      // 执行搜索
      return searchMember(this.searchModel).then(res => {
        this.members = res.data.list
        this.total = res.data.total
      }).catch(() => {
        this.members = []
        this.total = 0
        console.error('查询会员列表失败')
      })
    },
    handleSelectionChange(selected) {
      this.selectedMembers = selected
    },
    editMember(member) {
      console.log('修改会员信息', member)
    },
    deleteMember(id) {
      console.log('删除会员', id)
    },
    toggleStatus(member) {
      member.status = member.status ? 0 : 1
      console.log('修改用户状态', member)
    },
    batchDelete() {
      console.log('批量删除', this.selectedMembers)
    },
    batchEnable() {
      console.log('批量启用', this.selectedMembers)
    },
    handlePageChange(newPage) {
      this.searchModel.pageNum = newPage
      this.searchMembers()
    },
    handleSizeChange(newSize) {
      this.searchModel.pageSize = newSize
      this.searchMembers()
    },
    changeStateBottomType(state) {
      this.stateType = state
    }
  }
}
</script>

  <style scoped>
  .el-tag {
    cursor: pointer;
  }
  .pagination {
    display: flex;
    justify-content: center;
  }
  </style>
