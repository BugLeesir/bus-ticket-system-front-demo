<template>
  <div class="personal-info-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card-title">个人信息</span>
      </div>
      <el-form :model="userInfo" label-width="120px" class="personal-info-form">
        <el-form-item label="用户名">
          <span class="info-text">{{ userInfo.username }}</span>
        </el-form-item>
        <el-form-item label="邮箱">
          <span class="info-text">{{ userInfo.email }}</span>
        </el-form-item>
        <el-form-item label="手机号">
          <span class="info-text">{{ userInfo.phone }}</span>
        </el-form-item>
        <el-form-item label="用户ID">
          <span class="info-text">{{ userInfo.userId }}</span>
        </el-form-item>
        <el-form-item label="注册时间">
          <span class="info-text">{{ userInfo.registerTime }}</span>
        </el-form-item>
      </el-form>
      <div class="action-buttons">
        <el-button type="primary" icon="el-icon-edit" @click="openEditDialog">修改个人资料</el-button>
      </div>
    </el-card>

    <!-- 修改个人资料弹窗 -->
    <el-dialog title="修改个人资料" :visible.sync="editDialogVisible" width="40%" class="edit-dialog">
      <el-form ref="editForm" :model="editUserInfo" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserInfo.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserInfo.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editUserInfo.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="editUserInfo.password"
            type="password"
            placeholder="******"
            :disabled="!isEditingPassword"
          />
          <el-checkbox v-model="isEditingPassword" @change="toggleEditPassword">修改密码</el-checkbox>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { searchMember } from '@/api/member'
import { searchAdmin } from '@/api/admin'
import { updateInfo } from '@/api/user'
import { encryptPassword } from '@/utils/encrypt' // 引入加密方法
import { mapGetters } from 'vuex'

export default {
  data() {
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
      userInfo: {
        username: '',
        email: '',
        phone: '',
        userId: '',
        registerTime: ''
      },
      editUserInfo: {
        username: '',
        email: '',
        phone: '',
        password: '******' // 默认显示不可修改的密码
      },
      editDialogVisible: false,
      isEditingPassword: false, // 是否允许修改密码
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: validateEmail, trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }, { validator: validatePhone, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['roles', 'userId', 'name'])
  },
  mounted() {
    this.loadUserInfo()
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const queryParams = {
        username: this.name, // 从 getter 中获取当前用户名
        pageNum: 1, // 随便传入一个值
        pageSize: 1 // 随便传入一个值
      }

      if (this.roles.includes('admin')) {
        // 如果是管理员，调用管理员接口
        searchAdmin(queryParams).then(response => {
          const adminInfo = response.data.list[0] // 取返回数据的第一条
          this.userInfo = {
            username: adminInfo.username,
            email: adminInfo.email,
            phone: adminInfo.phone,
            userId: adminInfo.id,
            registerTime: adminInfo.registerTime
          }
        })
      } else {
        // 如果是普通用户（会员），调用会员接口
        searchMember(queryParams).then(response => {
          const memberInfo = response.data.list[0] // 取返回数据的第一条
          this.userInfo = {
            username: memberInfo.username,
            email: memberInfo.email,
            phone: memberInfo.phone,
            userId: memberInfo.id,
            registerTime: memberInfo.registerTime
          }
        })
      }
    },
    // 打开修改个人资料弹窗
    openEditDialog() {
      this.editUserInfo = { ...this.userInfo, password: '******' } // 默认显示不可修改的密码
      this.isEditingPassword = false // 默认不允许修改密码
      this.editDialogVisible = true
    },
    // 切换密码修改状态
    toggleEditPassword() {
      if (this.isEditingPassword) {
        this.editUserInfo.password = '' // 清空密码输入框
      } else {
        this.editUserInfo.password = '******' // 恢复为不可修改状态
      }
    },
    // 提交修改
    submitEditForm() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          const data = {
            id: this.userInfo.userId,
            username: this.editUserInfo.username,
            email: this.editUserInfo.email,
            phone: this.editUserInfo.phone,
            password: this.isEditingPassword
              ? encryptPassword(this.editUserInfo.password) // 加密密码
              : null // 如果不修改密码，则不提交密码
          }
          updateInfo(data)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('个人资料修改成功')
                this.editDialogVisible = false
                this.loadUserInfo() // 重新加载用户信息
              } else {
                this.$message.error(response.msg || '修改失败')
              }
            })
            .catch(error => {
              console.error('修改个人资料失败:', error)
              this.$message.error('修改个人资料失败，请稍后重试')
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
.personal-info-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-card {
  width: 100%;
  max-width: 600px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.personal-info-form {
  margin-bottom: 20px;
}

.info-text {
  font-size: 16px;
  color: #606266;
}

.action-buttons {
  text-align: center;
  margin-top: 20px;

  .el-button {
    width: 150px;
    height: 40px;
    font-size: 16px;
    border-radius: 8px;
  }
}

.edit-dialog {
  .el-dialog__title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

  .dialog-footer {
    text-align: right;

    .el-button {
      border-radius: 8px;
    }
  }
}

.el-input {
  width: 100%;
  height: 40px;
  font-size: 14px;
}

.el-checkbox {
  margin-top: 10px;
}
</style>
