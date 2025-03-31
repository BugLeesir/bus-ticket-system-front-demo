<template>
  <div class="message-container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :xs="24" :sm="12" :md="6">
        <el-input v-model="searchModel.username" placeholder="用户名" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-date-picker
          v-model="searchModel.createTime"
          type="daterange"
          placeholder="留言时间"
        />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-button type="primary" icon="el-icon-search" @click="searchMessages">查询</el-button>
      </el-col>
    </el-row>

    <!-- 添加留言按钮 -->
    <el-row :gutter="20" class="add-message-bar">
      <el-col :xs="24" :sm="12" :md="6">
        <el-button type="success" icon="el-icon-edit" @click="openAddMessageDialog">添加留言</el-button>
      </el-col>
    </el-row>

    <!-- 留言列表 -->
    <div v-for="message in messages" :key="message.messageId" class="message-card">
      <!-- 留言头部 -->
      <div class="message-header">
        <span class="message-username">{{ message.userName }}</span>
        <span class="message-time">{{ message.createTime }}</span>
      </div>

      <!-- 留言内容 -->
      <div class="message-content">
        <span>
          {{ message.content.length > 100 ? message.content.slice(0, 100) + '...' : message.content }}
        </span>
        <el-button type="text" @click="viewMessageDetail(message)">查看详情</el-button>
      </div>

      <!-- 留言操作 -->
      <div class="message-actions">
        <el-button type="primary" @click="replyMessage(message)">回复留言</el-button>
        <el-button type="text" @click="toggleReplies(message)">
          {{ message.showReplies ? '收起回复' : '查看全部回复' }}
        </el-button>
        <el-button
          v-if="canDeleteMessage(message)"
          type="danger"
          @click="deleteMessage(message.messageId)"
        >
          删除
        </el-button>
        <el-button
          v-if="message.userId === userId"
          type="warning"
          @click="editMessage(message)"
        >
          修改留言
        </el-button>
      </div>

      <!-- 回复列表 -->
      <div v-if="message.showReplies" class="reply-list">
        <div
          v-for="reply in message.replyList"
          :key="reply.messageId"
          class="reply-item"
        >
          <div class="reply-header">
            <span class="reply-username">{{ reply.userName }}</span>
            <span class="reply-time">{{ reply.createTime }}</span>
          </div>
          <div class="reply-content">{{ reply.content }}</div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      :current-page="searchModel.pageNum"
      :page-sizes="[4, 8, 12]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />

    <!-- 回复留言弹窗 -->
    <el-dialog title="回复留言" :visible.sync="replyDialogVisible" width="30%">
      <el-form ref="replyForm" :model="replyMessageData" label-width="100px">
        <el-form-item label="回复内容" prop="content">
          <el-input v-model="replyMessageData.content" type="textarea" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">确定</el-button>
      </div>
    </el-dialog>

    <!-- 添加留言弹窗 -->
    <el-dialog title="添加留言" :visible.sync="addMessageDialogVisible" width="30%">
      <el-form ref="addMessageForm" :model="addMessageData" label-width="100px">
        <el-form-item label="留言内容" prop="content">
          <el-input v-model="addMessageData.content" type="textarea" placeholder="请输入留言内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addMessageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddMessage">确定</el-button>
      </div>
    </el-dialog>

    <!-- 留言详情弹窗 -->
    <el-dialog title="留言详情" :visible.sync="messageDetailDialogVisible" width="40%">
      <div>
        <p><strong>用户名：</strong>{{ messageDetail.userName }}</p>
        <p><strong>留言时间：</strong>{{ messageDetail.createTime }}</p>
        <p><strong>留言内容：</strong>{{ messageDetail.content }}</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="messageDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改留言弹窗 -->
    <el-dialog title="修改留言" :visible.sync="editMessageDialogVisible" width="30%">
      <el-form ref="editMessageForm" :model="editMessageData" label-width="100px">
        <el-form-item label="留言内容" prop="content">
          <el-input v-model="editMessageData.content" type="textarea" placeholder="请输入修改后的留言内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editMessageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditMessage">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { searchMessages, deleteMessage, addMessage, updateMessage } from '@/api/message'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      searchModel: {
        username: '',
        createTime: [],
        pageNum: 1,
        pageSize: 8
      },
      messages: [],
      total: 0,
      replyDialogVisible: false,
      replyMessageData: {
        content: '',
        replyId: ''
      },
      addMessageDialogVisible: false,
      addMessageData: {
        content: ''
      },
      messageDetailDialogVisible: false,
      messageDetail: {},
      editMessageDialogVisible: false, // 控制修改留言弹窗的显示
      editMessageData: {
        messageId: '', // 留言 ID
        content: '' // 修改后的留言内容
      }
    }
  },
  computed: {
    ...mapGetters(['userId', 'roles']),
    isAdmin() {
      return this.roles.includes('admin')
    }
  },
  mounted() {
    this.searchMessages()
  },
  methods: {
    // 判断当前用户是否可以删除留言
    canDeleteMessage(row) {
      return this.isAdmin || row.userId === this.userId
    },
    // 查询留言
    searchMessages() {
      const formatDate = date => {
        if (!date) return null
        const localDate = new Date(date)
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
        return localDate.toISOString().split('T')[0]
      }

      const data = {
        username: this.searchModel.username,
        createTime: this.searchModel.createTime.map(formatDate),
        pageNum: this.searchModel.pageNum,
        pageSize: this.searchModel.pageSize
      }
      console.log('查询参数:', data)
      searchMessages(data)
        .then(response => {
          this.messages = response.data.list.map(message => ({
            ...message,
            showReplies: false // 初始化 showReplies 属性
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('查询留言失败:', error)
          this.$message.error('查询留言失败，请稍后重试')
        })
    },
    // 删除留言
    deleteMessage(messageId) {
      this.$confirm('确定要删除该留言吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteMessage(messageId)
            .then(() => {
              this.$message.success('删除成功')
              this.searchMessages()
            })
            .catch(error => {
              console.error('删除留言失败:', error)
              this.$message.error('删除留言失败，请稍后重试')
            })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    // 回复留言
    replyMessage(row) {
      this.replyDialogVisible = true
      this.replyMessageData.replyId = row.messageId // 设置回复的留言 ID
    },
    submitReply() {
      if (!this.replyMessageData.content.trim()) {
        this.$message.error('回复内容不能为空')
        return
      }
      const data = {
        userId: this.userId, // 当前用户 ID，从 Vuex 获取
        content: this.replyMessageData.content, // 回复内容
        replyId: this.replyMessageData.replyId // 回复的留言 ID
      }
      addMessage(data)
        .then(() => {
          this.$message.success('回复成功')
          this.replyDialogVisible = false
          this.replyMessageData.content = '' // 清空回复内容
          this.searchMessages() // 刷新留言列表
        })
        .catch(error => {
          console.error('回复留言失败:', error)
          this.$message.error('回复留言失败，请稍后重试')
        })
    },
    // 添加留言
    openAddMessageDialog() {
      this.addMessageDialogVisible = true
    },
    submitAddMessage() {
      if (!this.addMessageData.content.trim()) {
        this.$message.error('留言内容不能为空')
        return
      }
      const data = {
        userId: this.userId, // 当前用户 ID
        content: this.addMessageData.content,
        replyId: null // 父留言的 replyId 为 null
      }
      addMessage(data)
        .then(() => {
          this.$message.success('添加留言成功')
          this.addMessageDialogVisible = false
          this.addMessageData.content = '' // 清空留言内容
          this.searchMessages() // 刷新留言列表
        })
        .catch(error => {
          console.error('添加留言失败:', error)
          this.$message.error('添加留言失败，请稍后重试')
        })
    },
    // 查看回复
    toggleReplies(row) {
      if (row.showReplies) {
        // 如果已经展开，则收起
        row.showReplies = false
      } else {
        // 如果未展开，则展开
        if (!row.replyList || row.replyList.length === 0) {
          this.$message.info('暂无回复')
        } else {
          row.showReplies = true
        }
      }
    },
    // 修改留言
    editMessage(row) {
      this.editMessageDialogVisible = true
      this.editMessageData = { ...row } // 将当前留言的数据赋值给 editMessageData
    },
    submitEditMessage() {
      if (!this.editMessageData.content.trim()) {
        this.$message.error('留言内容不能为空')
        return
      }
      const data = {
        messageId: this.editMessageData.messageId, // 留言 ID
        content: this.editMessageData.content // 修改后的留言内容
      }
      updateMessage(data)
        .then(() => {
          this.$message.success('修改留言成功')
          this.editMessageDialogVisible = false
          this.searchMessages() // 刷新留言列表
        })
        .catch(error => {
          console.error('修改留言失败:', error)
          this.$message.error('修改留言失败，请稍后重试')
        })
    },
    // 查看留言详情
    viewMessageDetail(row) {
      this.messageDetail = row
      this.messageDetailDialogVisible = true
    },
    // 分页
    handlePageChange(newPage) {
      this.searchModel.pageNum = newPage
      this.searchMessages()
    },
    handleSizeChange(newSize) {
      this.searchModel.pageSize = newSize
      this.searchMessages()
    }
  }
}
</script>

<style scoped>
.message-container {
  margin-top: 20px;
  padding-left: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.add-message-bar {
  margin-bottom: 20px;
}

.message-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}

.message-username {
  font-weight: bold;
}

.message-time {
  color: #909399;
}

.message-content {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.message-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.reply-list {
  margin-top: 10px;
  padding-left: 20px;
  border-left: 2px solid #ebeef5;
}

.reply-item {
  margin-bottom: 10px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.reply-username {
  font-weight: bold;
}

.reply-time {
  color: #909399;
}

.reply-content {
  margin-top: 5px;
  font-size: 12px;
  color: #606266;
}

.pagination {
  display: flex;
  justify-content: center;
}
</style>
