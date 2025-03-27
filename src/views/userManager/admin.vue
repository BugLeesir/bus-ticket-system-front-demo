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
        <el-button type="primary" icon="el-icon-search" @click="searchAdmins">查询</el-button>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-row style="margin-top: 20px;">
      <el-button type="danger" @click="batchDelete">删除</el-button>
      <el-dropdown split-button type="primary" style="margin-left: 10px; margin-right: 10px;" @click="batchChangeStatus">
        {{ stateType === '1' ? '启用' : '停用' }}
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item @click.native="changeStateBottomType('1')">启用</el-dropdown-item>
          <el-dropdown-item @click.native="changeStateBottomType('0')">停用</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button type="success" @click="openAddAdminDialog">添加管理员</el-button>
    </el-row>

    <!-- 会员信息表格 -->
    <el-table :data="admins" style="width: 100%; margin-top: 20px;" border @selection-change="handleSelectionChange">
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
          <el-button type="primary" @click="openEditAdminDialog(scope.row)">修改</el-button>
          <el-button type="danger" @click="deleteAdmin(scope.row.id)">删除</el-button>
          <el-button type="warning" @click="toggleStatus(scope.row)">
            {{ scope.row.status ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加会员表单 -->
    <el-dialog title="添加会员" :visible.sync="addAdminDialogVisible" width="30%">
      <el-form ref="addAdminForm" :model="newAdmin" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="newAdmin.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="newAdmin.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newAdmin.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="newAdmin.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="newAdmin.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAdminDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddAdminForm">确定</el-button>
      </div>
    </el-dialog>
    <!-- 修改会员信息表单 -->
    <el-dialog title="修改会员" :visible.sync="editAdminDialogVisible" width="30%">
      <el-form ref="editAdminForm" :model="editAdmin" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editAdmin.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editAdmin.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editAdmin.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="editAdmin.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="editAdmin.password"
            type="password"
            placeholder="******"
            :disabled="!isEditingPassword"
          />
          <el-checkbox v-model="isEditingPassword" @change="toggleEditPassword">修改密码</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAdminDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditAdminForm">确定</el-button>
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
import { searchAdmin, addAdmin } from '@/api/admin'
import { updateInfo, deleteUser, setUserStatus, deleteUsers, setUsersStatus } from '@/api/user'
import { encryptPassword } from '@/utils/encrypt'
export default {
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码长度不能小于6位'))
      } else {
        callback()
      }
    }
    const validateEmail = (rule, value, callback) => {
      const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
      if (!emailPattern.test(value)) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      const phonePattern = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!phonePattern.test(value)) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    return {
      searchModel: {
        username: '',
        phone: '',
        registerTime: [],
        pageNum: 1,
        pageSize: 10
      },
      admins: [
        { id: 1, username: '张三', email: 'zhangsan@example.com', phone: '13800000000', status: 1, registerTime: '2024-03-20' },
        { id: 2, username: '李四', email: 'lisi@example.com', phone: '13900000000', status: 0, registerTime: '2024-03-18' }
      ],
      selectedAdmins: [],
      stateType: '1',
      addAdminDialogVisible: false,
      newAdmin: {
        username: '',
        password: '',
        email: '',
        phone: '',
        status: null
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { validator: validatePassword, trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: validateEmail, trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { validator: validatePhone, trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      },
      editAdminDialogVisible: false,
      editAdmin: {
        id: '',
        username: '',
        email: '',
        phone: '',
        status: null,
        password: '******' // 默认显示不可修改的密码
      },
      isEditingPassword: false // 是否允许修改密码
    }
  },
  mounted: function() {
    this.searchAdmins()
  },
  methods: {
    searchAdmins() {
      // 清空管理员列表
      this.admins = []

      // 检查日期范围是否存在
      if (this.searchModel.registerTime && this.searchModel.registerTime.length === 2) {
        this.searchModel.registerTime = this.searchModel.registerTime.map(date => {
          const localDate = new Date(date)
          localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
          return localDate.toISOString().split('T')[0]
        })
      } else {
        // 如果日期为空，则重置为一个空数组
        this.searchModel.registerTime = []
      }

      // 执行搜索
      return searchAdmin(this.searchModel)
        .then(res => {
          this.admins = res.data.list
          this.total = res.data.total
        })
        .catch(() => {
          this.admins = []
          this.total = 0
          console.error('查询管理员列表失败')
        })
    },
    handleSelectionChange(selected) {
      this.selectedAdmins = selected
      console.log('选中的会员', selected)
    },
    deleteAdmin(id) {
      const currentUsername = this.$store.state.user.name // 获取当前登录管理员的用户名
      const admin = this.admins.find(admin => admin.id === id)

      if (admin.username === currentUsername) {
        this.$message.warning('不能删除当前登录的管理员')
        return
      }

      this.$confirm('此操作将永久删除该管理员, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(id)
          .then(response => {
            if (response.code === 200) {
              this.$message.success('删除成功')
              this.searchAdmins() // 重新加载管理员列表
            } else {
              this.$message.error(response.msg || '删除失败')
            }
          })
          .catch(error => {
            console.error('删除管理员失败:', error)
            this.$message.error('删除管理员失败，请稍后重试')
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    toggleStatus(admin) {
      const currentUsername = this.$store.state.user.name // 获取当前登录管理员的用户名

      if (admin.username === currentUsername) {
        this.$message.warning('不能变更当前登录管理员的状态')
        return
      }

      const newStatus = admin.status ? 0 : 1
      const action = newStatus === 1 ? '启用' : '禁用'
      this.$confirm(`此操作将${action}该管理员, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        setUserStatus(admin.id, newStatus)
          .then(response => {
            if (response.code === 200) {
              this.$message.success(`${action}成功`)
              admin.status = newStatus // 更新本地状态
            } else {
              this.$message.error(response.msg || `${action}失败`)
            }
          })
          .catch(error => {
            console.error(`${action}管理员失败:`, error)
            this.$message.error(`${action}管理员失败，请稍后重试`)
          })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    batchDelete() {
      if (this.selectedAdmins.length === 0) {
        this.$message.warning('请先选择要删除的管理员')
        return
      }

      const currentUsername = this.$store.state.user.name // 获取当前登录管理员的用户名
      const filteredAdmins = this.selectedAdmins.filter(admin => admin.username !== currentUsername)

      if (filteredAdmins.length !== this.selectedAdmins.length) {
        this.$message.warning('不能删除当前登录的管理员')
      }

      if (filteredAdmins.length === 0) {
        return
      }

      this.$confirm('此操作将永久删除选中的管理员, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = filteredAdmins.map(admin => admin.id)
        deleteUsers({ ids })
          .then(response => {
            if (response.code === 200) {
              this.$message.success('批量删除成功')
              this.searchAdmins() // 重新加载管理员列表
            } else {
              this.$message.error(response.msg || '批量删除失败')
            }
          })
          .catch(error => {
            console.error('批量删除失败:', error)
            this.$message.error('批量删除失败，请稍后重试')
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    batchChangeStatus() {
      if (this.selectedAdmins.length === 0) {
        this.$message.warning('请先选择要设置状态的管理员')
        return
      }

      const currentUsername = this.$store.state.user.name // 获取当前登录管理员的用户名
      const filteredAdmins = this.selectedAdmins.filter(admin => admin.username !== currentUsername)

      if (filteredAdmins.length !== this.selectedAdmins.length) {
        this.$message.warning('不能变更当前登录管理员的状态')
      }

      if (filteredAdmins.length === 0) {
        return
      }

      const action = this.stateType === '1' ? '启用' : '停用'
      this.$confirm(`此操作将${action}选中的管理员, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const ids = filteredAdmins.map(admin => admin.id)
        setUsersStatus({ ids, status: this.stateType })
          .then(response => {
            if (response.code === 200) {
              this.$message.success(`批量${action}成功`)
              this.searchAdmins() // 重新加载管理员列表
            } else {
              this.$message.error(response.msg || `批量${action}失败`)
            }
          })
          .catch(error => {
            console.error(`批量${action}失败:`, error)
            this.$message.error(`批量${action}失败，请稍后重试`)
          })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    handlePageChange(newPage) {
      this.searchModel.pageNum = newPage
      this.searchAdmins()
    },
    handleSizeChange(newSize) {
      this.searchModel.pageSize = newSize
      this.searchAdmins()
    },
    changeStateBottomType(state) {
      this.stateType = state
    },
    openAddAdminDialog() {
      this.addAdminDialogVisible = true
      this.newAdmin = {
        username: '',
        password: '',
        email: '',
        phone: '',
        status: null
      }
    },
    submitAddAdminForm() {
      this.$refs.addAdminForm.validate(valid => {
        if (valid) {
          const data = {
            username: '',
            password: '',
            email: '',
            phone: '',
            status: ''
          }
          data.username = this.newAdmin.username
          data.email = this.newAdmin.email
          data.phone = this.newAdmin.phone
          data.password = encryptPassword(this.newAdmin.password)
          data.status = this.newAdmin.status
          addAdmin(data)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('会员添加成功')
                this.addAdminDialogVisible = false
                this.searchAdmins() // 重新加载会员列表
              } else {
                this.$message.error(response.msg || '添加失败')
              }
            })
            .catch(error => {
              console.error('添加会员失败:', error)
              this.$message.error('添加会员失败，请稍后重试')
            })
        } else {
          console.error('表单校验失败')
        }
      })
    },
    openEditAdminDialog(admin) {
      const currentUsername = this.$store.state.user.name // 获取当前登录管理员的用户名
      console.log(currentUsername)
      if (admin.username === currentUsername) {
        this.$message.warning('不能修改当前登录的管理员信息')
        return
      }

      this.editAdminDialogVisible = true
      this.editAdmin = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
        status: admin.status,
        password: '******' // 默认显示不可修改的密码
      }
      this.isEditingPassword = false // 默认不允许修改密码
    },
    toggleEditPassword() {
      if (this.isEditingPassword) {
        this.editAdmin.password = '' // 清空密码输入框
      } else {
        this.editAdmin.password = '******' // 恢复为不可修改状态
      }
    },
    submitEditAdminForm() {
      this.$refs.editAdminForm.validate(valid => {
        if (valid) {
          const data = {
            id: this.editAdmin.id,
            username: this.editAdmin.username,
            email: this.editAdmin.email,
            phone: this.editAdmin.phone,
            status: this.editAdmin.status,
            password: this.isEditingPassword
              ? encryptPassword(this.editAdmin.password) // 如果修改密码，则加密后提交
              : null // 如果不修改密码，则不提交密码
          }
          updateInfo(data)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('会员修改成功')
                this.editAdminDialogVisible = false
                this.searchAdmins() // 重新加载会员列表
              } else {
                this.$message.error(response.msg || '修改失败')
              }
            })
            .catch(error => {
              console.error('修改会员失败:', error)
              this.$message.error('修改会员失败，请稍后重试')
            })
        } else {
          console.error('表单校验失败')
        }
      })
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
