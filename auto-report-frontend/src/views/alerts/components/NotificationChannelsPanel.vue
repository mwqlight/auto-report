<template>
  <div class="notification-channels-panel">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">通知渠道管理</h3>
        <p class="panel-description">配置和管理预警通知渠道</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建渠道
        </el-button>
        <el-button @click="fetchNotificationChannels">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 渠道列表 -->
    <div class="channels-list">
      <el-row :gutter="16">
        <el-col
          v-for="channel in channels"
          :key="channel.id"
          :xs="24"
          :sm="12"
          :lg="8"
          class="channel-col"
        >
          <el-card class="channel-card" shadow="hover">
            <template #header>
              <div class="channel-header">
                <div class="channel-title">
                  <div class="channel-name">{{ channel.name }}</div>
                  <el-tag
                    :type="channel.enabled ? 'success' : 'info'"
                    size="small"
                  >
                    {{ channel.enabled ? '启用' : '禁用' }}
                  </el-tag>
                </div>
                <div class="channel-type">
                  <el-tag :type="getTypeTagType(channel.type)">
                    {{ getTypeLabel(channel.type) }}
                  </el-tag>
                </div>
              </div>
            </template>

            <div class="channel-content">
              <div class="channel-config">
                <div v-if="channel.type === 'email'" class="config-item">
                  <span class="config-label">收件人:</span>
                  <span class="config-value">{{ channel.config.email?.recipients?.join(', ') }}</span>
                </div>
                <div v-if="channel.type === 'webhook'" class="config-item">
                  <span class="config-label">URL:</span>
                  <span class="config-value">{{ channel.config.webhook?.url }}</span>
                </div>
                <div v-if="channel.type === 'slack'" class="config-item">
                  <span class="config-label">频道:</span>
                  <span class="config-value">{{ channel.config.slack?.channel }}</span>
                </div>
                <div v-if="channel.type === 'dingtalk'" class="config-item">
                  <span class="config-label">Webhook:</span>
                  <span class="config-value">{{ channel.config.dingtalk?.webhookUrl }}</span>
                </div>
                <div v-if="channel.type === 'wechat'" class="config-item">
                  <span class="config-label">企业ID:</span>
                  <span class="config-value">{{ channel.config.wechat?.corpId }}</span>
                </div>
                <div v-if="channel.type === 'sms'" class="config-item">
                  <span class="config-label">手机号:</span>
                  <span class="config-value">{{ channel.config.sms?.phoneNumbers?.join(', ') }}</span>
                </div>
              </div>

              <div v-if="channel.testResult" class="test-result">
                <div class="test-status">
                  <el-icon
                    :color="channel.testResult.success ? '#67c23a' : '#f56c6c'"
                    :size="16"
                  >
                    <SuccessFilled v-if="channel.testResult.success" />
                    <CircleClose v-else />
                  </el-icon>
                  <span :class="['test-message', channel.testResult.success ? 'success' : 'error']">
                    {{ channel.testResult.message }}
                  </span>
                </div>
                <div class="test-time">
                  {{ formatDate(channel.testResult.testedAt) }}
                </div>
              </div>
            </div>

            <template #footer>
              <div class="channel-actions">
                <el-button size="small" @click="handleEdit(channel)">编辑</el-button>
                <el-button size="small" @click="handleTest(channel.id)">测试</el-button>
                <el-button
                  size="small"
                  :type="channel.enabled ? 'warning' : 'success'"
                  @click="handleToggle(channel.id, !channel.enabled)"
                >
                  {{ channel.enabled ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="handleDelete(channel.id)">删除</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="channels.length === 0" class="empty-state">
        <el-empty description="暂无通知渠道">
          <el-button type="primary" @click="showCreateDialog = true">创建第一个渠道</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <NotificationChannelDialog
      v-model="showCreateDialog"
      :channel="editingChannel"
      @success="handleDialogSuccess"
      @close="handleDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, SuccessFilled, CircleClose } from '@element-plus/icons-vue'
import { useAlertsStore } from '@/store/alerts'
import type { NotificationChannel } from '@/types/alerts'
import NotificationChannelDialog from './NotificationChannelDialog.vue'

const alertsStore = useAlertsStore()

// 响应式数据
const showCreateDialog = ref(false)
const editingChannel = ref<NotificationChannel | null>(null)

// 计算属性
const channels = computed(() => alertsStore.notificationChannels)

// 生命周期
onMounted(() => {
  fetchNotificationChannels()
})

// 获取通知渠道
const fetchNotificationChannels = async () => {
  try {
    await alertsStore.fetchNotificationChannels()
  } catch (error) {
    ElMessage.error('获取通知渠道失败')
  }
}

// 编辑渠道
const handleEdit = (channel: NotificationChannel) => {
  editingChannel.value = channel
  showCreateDialog.value = true
}

// 测试渠道
const handleTest = async (id: string) => {
  try {
    const result = await alertsStore.testNotificationChannel(id)
    if (result.success) {
      ElMessage.success(`测试成功: ${result.message}`)
    } else {
      ElMessage.error(`测试失败: ${result.message}`)
    }
    // 刷新渠道列表以更新测试结果
    await fetchNotificationChannels()
  } catch (error) {
    ElMessage.error('测试失败')
  }
}

// 切换渠道状态
const handleToggle = async (id: string, enabled: boolean) => {
  try {
    await alertsStore.updateNotificationChannel(id, { enabled })
    ElMessage.success(`${enabled ? '启用' : '禁用'}成功`)
  } catch (error) {
    ElMessage.error('操作失败')
    // 恢复状态
    const channel = channels.value.find(c => c.id === id)
    if (channel) {
      channel.enabled = !enabled
    }
  }
}

// 删除渠道
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该通知渠道吗？', '确认删除', {
      type: 'warning'
    })
    await alertsStore.deleteNotificationChannel(id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 对话框处理
const handleDialogSuccess = () => {
  fetchNotificationChannels()
  showCreateDialog.value = false
  editingChannel.value = null
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingChannel.value = null
}

// 工具函数
const getTypeLabel = (type: string) => {
  const map = {
    email: '邮箱',
    webhook: 'Webhook',
    slack: 'Slack',
    dingtalk: '钉钉',
    wechat: '企业微信',
    sms: '短信'
  }
  return map[type as keyof typeof map] || type
}

const getTypeTagType = (type: string) => {
  const map = {
    email: 'primary',
    webhook: 'success',
    slack: 'warning',
    dingtalk: 'danger',
    wechat: 'info',
    sms: 'info'
  }
  return map[type as keyof typeof map] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.notification-channels-panel {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    .panel-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .panel-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

.channels-list {
  .channel-col {
    margin-bottom: 16px;
  }

  .channel-card {
    height: 100%;

    .channel-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .channel-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .channel-name {
          font-weight: 500;
          font-size: 16px;
        }
      }
    }

    .channel-content {
      .channel-config {
        .config-item {
          display: flex;
          margin-bottom: 8px;
          font-size: 14px;

          .config-label {
            color: #909399;
            min-width: 80px;
          }

          .config-value {
            color: #303133;
            word-break: break-all;
          }
        }
      }

      .test-result {
        margin-top: 12px;
        padding: 8px;
        background: #f5f7fa;
        border-radius: 4px;

        .test-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .test-message {
            font-size: 14px;

            &.success {
              color: #67c23a;
            }

            &.error {
              color: #f56c6c;
            }
          }
        }

        .test-time {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .channel-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 60px;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
  }
}

@media (max-width: 768px) {
  .notification-channels-panel {
    padding: 16px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .header-right {
      width: 100%;
      display: flex;
      gap: 8px;

      .el-button {
        flex: 1;
      }
    }
  }

  .channels-list {
    .channel-card {
      .channel-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }

      .channel-actions {
        .el-button {
          min-width: auto;
          flex: none;
        }
      }
    }
  }
}
</style>