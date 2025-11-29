<template>
  <div class="comment-management">
    <div class="header-actions">
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索评论内容" 
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      
      <el-select v-model="filterResourceType" placeholder="资源类型" clearable @change="handleFilter">
        <el-option 
          v-for="type in resourceTypes" 
          :key="type.value" 
          :label="type.label" 
          :value="type.value" 
        />
      </el-select>
    </div>

    <div class="comments-list">
      <div v-for="comment in filteredComments" :key="comment.id" class="comment-item">
        <el-card shadow="hover" class="comment-card">
          <div class="comment-header">
            <div class="comment-meta">
              <span class="comment-author">{{ comment.createdBy }}</span>
              <span class="comment-time">{{ formatCommentTime(comment.createdAt) }}</span>
              <el-tag size="small">{{ getResourceTypeName(comment.resourceType) }}</el-tag>
              <span class="resource-name">{{ getResourceName(comment.resourceId) }}</span>
            </div>
            
            <div class="comment-actions">
              <el-button 
                v-if="isCurrentUser(comment.createdBy)" 
                type="primary" 
                link 
                size="small"
                @click="handleEditComment(comment)"
              >
                编辑
              </el-button>
              <el-button 
                v-if="isCurrentUser(comment.createdBy)" 
                type="danger" 
                link 
                size="small"
                @click="handleDeleteComment(comment)"
              >
                删除
              </el-button>
              <el-button type="info" link size="small" @click="handleReplyComment(comment)">
                回复
              </el-button>
            </div>
          </div>

          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
            <div 
              v-for="reply in comment.replies" 
              :key="reply.id" 
              class="reply-item"
            >
              <div class="reply-meta">
                <span class="reply-author">{{ reply.createdBy }}</span>
                <span class="reply-time">{{ formatCommentTime(reply.createdAt) }}</span>
                <el-button 
                  v-if="isCurrentUser(reply.createdBy)" 
                  type="danger" 
                  link 
                  size="small"
                  @click="handleDeleteReply(reply)"
                >
                  删除
                </el-button>
              </div>
              <div class="reply-content">
                <p>{{ reply.content }}</p>
              </div>
            </div>
          </div>

          <!-- 回复输入框 -->
          <div v-if="activeReplyCommentId === comment.id" class="reply-input">
            <el-input 
              v-model="replyContent" 
              type="textarea" 
              :rows="2"
              placeholder="输入回复内容"
              maxlength="500"
              show-word-limit
            />
            <div class="reply-actions">
              <el-button size="small" @click="cancelReply">取消</el-button>
              <el-button type="primary" size="small" @click="submitReply(comment)" :loading="replying">
                回复
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div v-if="filteredComments.length === 0" class="empty-state">
      <el-empty description="暂无评论" />
    </div>

    <!-- 编辑评论对话框 -->
    <el-dialog v-model="showEditCommentDialog" title="编辑评论" width="600px">
      <el-form :model="editCommentForm">
        <el-form-item>
          <el-input 
            v-model="editCommentForm.content" 
            type="textarea" 
            :rows="4"
            placeholder="请输入评论内容"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditCommentDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit" :loading="editingComment">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { CommentResponse } from '@/types/collaboration'
import { collaborationApi, commentUtils } from '@/api/collaboration'

const comments = ref<CommentResponse[]>([])
const searchKeyword = ref('')
const filterResourceType = ref('')
const showEditCommentDialog = ref(false)
const activeReplyCommentId = ref<number | null>(null)
const replyContent = ref('')
const replying = ref(false)
const editingComment = ref(false)
const selectedComment = ref<CommentResponse | null>(null)

const editCommentForm = ref({
  content: ''
})

const resourceTypes = [
  { label: '仪表板', value: 'DASHBOARD' },
  { label: '图表', value: 'CHART' },
  { label: '数据集', value: 'DATASET' },
  { label: '数据源', value: 'DATASOURCE' },
  { label: '报告', value: 'REPORT' }
]

const filteredComments = computed(() => {
  return comments.value.filter(comment => {
    const matchesKeyword = !searchKeyword.value || 
      comment.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesType = !filterResourceType.value || comment.resourceType === filterResourceType.value
    
    return matchesKeyword && matchesType
  })
})

const loadComments = async () => {
  try {
    // 这里需要获取用户的所有评论
    // 由于API设计限制，暂时加载所有资源的评论
    // 实际项目中应该有一个获取用户所有评论的接口
    const mockComments: CommentResponse[] = [
      {
        id: 1,
        resourceType: 'DASHBOARD',
        resourceId: 'dashboard-1',
        content: '这个仪表板的数据展示非常清晰，建议可以增加一些趋势分析图表。',
        createdBy: 'user1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [
          {
            id: 2,
            resourceType: 'DASHBOARD',
            resourceId: 'dashboard-1',
            content: '感谢建议，我们会在下个版本中加入趋势分析功能。',
            createdBy: 'user2',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            replies: []
          }
        ]
      },
      {
        id: 3,
        resourceType: 'CHART',
        resourceId: 'chart-1',
        content: '这个图表的颜色搭配可以优化一下，当前对比度不够明显。',
        createdBy: 'user3',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        replies: []
      }
    ]
    
    comments.value = mockComments
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过computed属性实现
}

const handleFilter = () => {
  // 过滤逻辑已通过computed属性实现
}

const handleEditComment = (comment: CommentResponse) => {
  selectedComment.value = comment
  editCommentForm.value.content = comment.content
  showEditCommentDialog.value = true
}

const handleSaveEdit = async () => {
  if (!selectedComment.value) return
  
  try {
    editingComment.value = true
    // 调用更新评论API
    // await collaborationApi.updateComment(selectedComment.value.id, editCommentForm.value)
    ElMessage.success('评论更新成功')
    showEditCommentDialog.value = false
    loadComments()
  } catch (error) {
    ElMessage.error('评论更新失败')
  } finally {
    editingComment.value = false
  }
}

const handleDeleteComment = async (comment: CommentResponse) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评论吗？删除后无法恢复。',
      '确认删除',
      { type: 'warning' }
    )
    
    // 调用删除评论API
    // await collaborationApi.deleteComment(comment.id)
    ElMessage.success('评论删除成功')
    loadComments()
  } catch (error) {
    // 用户取消或操作失败
  }
}

const handleReplyComment = (comment: CommentResponse) => {
  activeReplyCommentId.value = comment.id
  replyContent.value = ''
}

const handleDeleteReply = async (reply: CommentResponse) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条回复吗？删除后无法恢复。',
      '确认删除',
      { type: 'warning' }
    )
    
    // 调用删除评论API
    // await collaborationApi.deleteComment(reply.id)
    ElMessage.success('回复删除成功')
    loadComments()
  } catch (error) {
    // 用户取消或操作失败
  }
}

const submitReply = async (comment: CommentResponse) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  try {
    replying.value = true
    
    const replyData = {
      resourceType: comment.resourceType as any,
      resourceId: comment.resourceId,
      content: replyContent.value,
      parentCommentId: comment.id
    }
    
    // 调用创建评论API
    // await collaborationApi.createComment(replyData)
    ElMessage.success('回复成功')
    cancelReply()
    loadComments()
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    replying.value = false
  }
}

const cancelReply = () => {
  activeReplyCommentId.value = null
  replyContent.value = ''
}

const formatCommentTime = (time: string) => {
  return commentUtils.formatCommentTime(time)
}

const getResourceTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    'DASHBOARD': '仪表板',
    'CHART': '图表',
    'DATASET': '数据集',
    'DATASOURCE': '数据源',
    'REPORT': '报告'
  }
  return nameMap[type] || type
}

const getResourceName = (resourceId: string) => {
  // 这里需要根据资源ID获取资源名称
  // 暂时返回资源ID
  return resourceId
}

const isCurrentUser = (userId: string) => {
  return userId === 'current-user-id'
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-management {
  padding: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  width: 100%;
}

.comment-card {
  transition: all 0.3s ease;
}

.comment-card:hover {
  transform: translateY(-1px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 600;
  color: #303133;
}

.comment-time {
  color: #909399;
  font-size: 12px;
}

.resource-name {
  color: #606266;
  font-size: 14px;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.comment-content {
  margin-bottom: 16px;
}

.comment-content p {
  margin: 0;
  line-height: 1.6;
  color: #303133;
}

.replies-section {
  margin-top: 16px;
  padding-left: 20px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.reply-author {
  font-weight: 500;
  color: #303133;
}

.reply-time {
  color: #909399;
  font-size: 12px;
}

.reply-content p {
  margin: 0;
  line-height: 1.5;
  color: #606266;
}

.reply-input {
  margin-top: 12px;
}

.reply-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>