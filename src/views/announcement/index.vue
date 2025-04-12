<template>
  <div class="announcement-container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :xs="24" :sm="12" :md="6">
        <el-input v-model="searchModel.title" placeholder="公告标题" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-date-picker
          v-model="searchModel.date"
          type="date"
          placeholder="请选择发布时间"
          clearable
        />
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <el-row class="action-bar">
      <el-button type="success" icon="el-icon-plus" @click="openAddAnnouncementDialog">添加公告</el-button>
      <el-button
        type="danger"
        icon="el-icon-delete"
        :disabled="selectedAnnouncements.length === 0"
        @click="batchDelete"
      >
        批量删除
      </el-button>
      <el-col :xs="24" :sm="12" :md="4">
        <el-button type="primary" icon="el-icon-search" @click="searchAnnouncements">查询</el-button>
      </el-col>
    </el-row>

    <!-- 公告列表 -->
    <el-row :gutter="20" class="announcement-list">
      <el-table
        :data="announcements"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="公告标题" />
        <el-table-column prop="publishDate" label="发布时间" width="180" />
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="viewAnnouncement(scope.row)">查看</el-button>
            <el-button type="danger" size="mini" @click="deleteAnnouncement(scope.row.announcementId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

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

    <!-- 添加公告弹窗 -->
    <el-dialog title="添加公告" :visible.sync="addAnnouncementDialogVisible" width="50%">
      <el-form ref="addAnnouncementForm" :model="newAnnouncement" :rules="rules" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="newAnnouncement.title" placeholder="请输入公告标题" maxlength="70" show-word-limit />
        </el-form-item>
        <el-form-item label="公告正文" prop="content">
          <vue-editor v-model="newAnnouncement.content" placeholder="请输入公告正文" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addAnnouncementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddAnnouncementForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 公告详情弹窗 -->
    <el-dialog title="公告详情" :visible.sync="viewAnnouncementDialogVisible" width="50%">
      <h3>{{ currentAnnouncement.title }}</h3>
      <p class="publish-date">发布时间：{{ currentAnnouncement.publishDate }}</p>
      <div class="announcement-content" v-html="currentAnnouncement.content" />
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="deleteAnnouncement(currentAnnouncement.announcementId)">删除</el-button>
        <el-button type="primary" @click="openEditAnnouncementDialog(currentAnnouncement)">修改</el-button>
        <el-button @click="viewAnnouncementDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 修改公告弹窗 -->
    <el-dialog title="修改公告" :visible.sync="editAnnouncementDialogVisible" width="50%">
      <el-form ref="editAnnouncementForm" :model="editAnnouncement" :rules="rules" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="editAnnouncement.title" placeholder="请输入公告标题" maxlength="70" show-word-limit />
        </el-form-item>
        <el-form-item label="公告正文" prop="content">
          <vue-editor v-model="editAnnouncement.content" placeholder="请输入公告正文" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editAnnouncementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditAnnouncementForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addAnnouncement, searchAnnouncements, deleteAnnouncement, deleteAnnouncements, updateAnnouncement } from '@/api/announcement'
import { VueEditor } from 'vue2-editor'

export default {
  components: { VueEditor },
  data() {
    return {
      searchModel: {
        title: '',
        date: null,
        pageNum: 1,
        pageSize: 8
      },
      announcements: [],
      total: 0,
      addAnnouncementDialogVisible: false,
      viewAnnouncementDialogVisible: false,
      editAnnouncementDialogVisible: false,
      newAnnouncement: {
        title: '',
        content: ''
      },
      editAnnouncement: {
        announcementId: '', // 替换 id 为 announcementId
        title: '',
        content: ''
      },
      currentAnnouncement: {
        title: '',
        publishDate: '',
        content: '',
        announcementId: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入公告标题', trigger: 'blur' },
          { max: 70, message: '标题不能超过70个字', trigger: 'blur' }
        ],
        content: [{ required: true, message: '请输入公告正文', trigger: 'blur' }]
      },
      selectedAnnouncements: [] // 存储选中的公告
    }
  },
  mounted() {
    this.searchAnnouncements()
  },
  methods: {
    searchAnnouncements() {
      const formatDate = date => {
        if (!date) return null
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0') // 补零
        const day = String(date.getDate()).padStart(2, '0') // 补零
        return `${year}-${month}-${day}` // 返回 YYYY-MM-DD 格式
      }

      const formatDateTime = date => {
        if (!date) return null
        const localDate = new Date(date)
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
        return localDate.toISOString().replace('T', ' ').slice(0, 19) // 转换为 YYYY-MM-DD HH:mm:ss
      }

      const stripHtml = html => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = html
        return tempDiv.textContent || tempDiv.innerText || '' // 提取纯文本
      }

      const data = {
        title: this.searchModel.title,
        publishTime: this.searchModel.date ? formatDate(this.searchModel.date) : null, // 格式化为 YYYY-MM-DD
        pageNum: this.searchModel.pageNum,
        pageSize: this.searchModel.pageSize
      }

      console.log('查询参数:', data)
      searchAnnouncements(data)
        .then(response => {
          this.announcements = response.data.list.map(announcement => ({
            ...announcement,
            publishDate: formatDateTime(announcement.publishTime), // 格式化发布时间
            contentSnippet: stripHtml(announcement.content).length > 100
              ? stripHtml(announcement.content).slice(0, 100) + '...' // 提取纯文本并截取
              : stripHtml(announcement.content)
          }))
          this.total = response.data.total
        })
        .catch(error => {
          console.error('查询公告失败:', error)
          this.$message.error('查询公告失败，请稍后重试')
        })
    },
    handlePageChange(newPage) {
      this.searchModel.pageNum = newPage
      this.searchAnnouncements()
    },
    handleSizeChange(newSize) {
      this.searchModel.pageSize = newSize
      this.searchAnnouncements()
    },
    handleSelectionChange(selection) {
      this.selectedAnnouncements = selection
    },
    openAddAnnouncementDialog() {
      this.addAnnouncementDialogVisible = true
      this.newAnnouncement = {
        title: '',
        content: ''
      }
    },
    submitAddAnnouncementForm() {
      this.$refs.addAnnouncementForm.validate(valid => {
        if (valid) {
          addAnnouncement(this.newAnnouncement)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('公告添加成功')
                this.addAnnouncementDialogVisible = false
                this.searchAnnouncements()
              } else {
                this.$message.error(response.msg || '添加失败')
              }
            })
            .catch(error => {
              console.error('添加公告失败:', error)
              this.$message.error('添加公告失败，请稍后重试')
            })
        } else {
          console.error('表单校验失败')
        }
      })
    },
    viewAnnouncement(announcement) {
      const formatDateTime = date => {
        if (!date) return null
        const localDate = new Date(date)
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset())
        return localDate.toISOString().replace('T', ' ').slice(0, 19) // 转换为 YYYY-MM-DD HH:mm:ss
      }

      this.currentAnnouncement = {
        announcementId: announcement.announcementId, // 存储公告的 ID
        title: announcement.title,
        publishDate: formatDateTime(announcement.publishTime), // 格式化发布时间
        content: announcement.content
      }
      this.viewAnnouncementDialogVisible = true
    },
    deleteAnnouncement(id) {
      this.$confirm('确定要删除该公告吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteAnnouncement(id)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('公告删除成功')
                this.viewAnnouncementDialogVisible = false
                this.searchAnnouncements() // 重新加载公告列表
              } else {
                this.$message.error(response.msg || '删除失败')
              }
            })
            .catch(error => {
              console.error('删除公告失败:', error)
              this.$message.error('删除公告失败，请稍后重试')
            })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    openEditAnnouncementDialog(announcement) {
      this.editAnnouncementDialogVisible = true
      this.editAnnouncement = {
        announcementId: announcement.announcementId, // 使用 announcementId
        title: announcement.title,
        content: announcement.content
      }
    },
    submitEditAnnouncementForm() {
      this.$refs.editAnnouncementForm.validate(valid => {
        if (valid) {
          const data = {
            announcementId: this.editAnnouncement.announcementId, // 直接使用 announcementId
            title: this.editAnnouncement.title,
            content: this.editAnnouncement.content
          }

          updateAnnouncement(data)
            .then(response => {
              if (response.code === 200) {
                this.$message.success('公告修改成功')
                this.editAnnouncementDialogVisible = false
                this.viewAnnouncementDialogVisible = false
                this.searchAnnouncements() // 重新加载公告列表
              } else {
                this.$message.error(response.msg || '修改失败')
              }
            })
            .catch(error => {
              console.error('修改公告失败:', error)
              this.$message.error('修改公告失败，请稍后重试')
            })
        } else {
          console.error('表单校验失败')
        }
      })
    },
    batchDelete() {
      if (this.selectedAnnouncements.length === 0) {
        this.$message.warning('请先选择要删除的公告')
        return
      }

      this.$confirm('确定要批量删除选中的公告吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const ids = this.selectedAnnouncements.map(announcement => announcement.announcementId)
          deleteAnnouncements({ ids })
            .then(response => {
              if (response.code === 200) {
                this.$message.success('批量删除成功')
                this.searchAnnouncements() // 重新加载公告列表
              } else {
                this.$message.error(response.msg || '批量删除失败')
              }
            })
            .catch(error => {
              console.error('批量删除公告失败:', error)
              this.$message.error('批量删除公告失败，请稍后重试')
            })
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    }
  }
}
</script>

<style scoped>
.announcement-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-bar {
  margin-bottom: 20px;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 控制列之间的间距 */
}

.action-bar {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.announcement-list {
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.publish-date {
  color: gray;
  font-size: 12px;
  margin-bottom: 10px;
}

.announcement-content {
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap; /* 保留原始格式 */
}
</style>
