<template>
  <div class="alerts-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">预警与监控系统</h1>
        <p class="page-description">实时监控系统状态，及时处理预警信息</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="handleNewAlert">
          <el-icon><Plus /></el-icon>
          新建预警规则
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Bell /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalAlerts }}</div>
                <div class="stat-label">总预警数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon active">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeAlerts }}</div>
                <div class="stat-label">活跃预警</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon critical">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.criticalAlerts }}</div>
                <div class="stat-label">严重预警</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon resolved">
                <el-icon><SuccessFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.resolvedAlerts }}</div>
                <div class="stat-label">已处理</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 功能选项卡 -->
    <div class="tabs-section">
      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabChange">
        <el-tab-pane label="预警规则" name="rules">
          <AlertRulesPanel ref="rulesPanel" />
        </el-tab-pane>
        <el-tab-pane label="预警历史" name="history">
          <AlertHistoryPanel ref="historyPanel" />
        </el-tab-pane>
        <el-tab-pane label="系统监控" name="monitoring">
          <MonitoringPanel ref="monitoringPanel" />
        </el-tab-pane>
        <el-tab-pane label="通知渠道" name="channels">
          <NotificationChannelsPanel ref="channelsPanel" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新建预警规则对话框 -->
    <el-dialog
      v-model="showNewAlertDialog"
      title="新建预警规则"
      width="800px"
      :before-close="handleNewAlertClose"
    >
      <div class="new-alert-dialog">
        <el-steps :active="newAlertStep" align-center>
          <el-step title="基本信息" />
          <el-step title="规则配置" />
          <el-step title="通知设置" />
        </el-steps>

        <div class="step-content">
          <!-- 步骤1: 基本信息 -->
          <div v-if="newAlertStep === 0" class="step-panel">
            <el-form :model="newAlertForm" label-width="100px">
              <el-form-item label="规则名称" required>
                <el-input
                  v-model="newAlertForm.name"
                  placeholder="请输入规则名称"
                  maxlength="50"
                />
              </el-form-item>
              <el-form-item label="规则描述">
                <el-input
                  v-model="newAlertForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入规则描述"
                  maxlength="200"
                />
              </el-form-item>
              <el-form-item label="严重程度" required>
                <el-select v-model="newAlertForm.severity" style="width: 100%">
                  <el-option label="低" value="low" />
                  <el-option label="中" value="medium" />
                  <el-option label="高" value="high" />
                  <el-option label="严重" value="critical" />
                </el-select>
              </el-form-item>
              <el-form-item label="规则类型" required>
                <el-select v-model="newAlertForm.type" style="width: 100%">
                  <el-option label="阈值预警" value="threshold" />
                  <el-option label="异常检测" value="anomaly" />
                  <el-option label="趋势预警" value="trend" />
                  <el-option label="状态预警" value="status" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤2: 规则配置 -->
          <div v-if="newAlertStep === 1" class="step-panel">
            <el-form :model="newAlertForm" label-width="100px">
              <el-form-item label="监控指标" required>
                <el-select v-model="newAlertForm.metric" style="width: 100%">
                  <el-option label="CPU使用率" value="cpu_usage" />
                  <el-option label="内存使用率" value="memory_usage" />
                  <el-option label="磁盘使用率" value="disk_usage" />
                  <el-option label="API响应时间" value="api_response_time" />
                  <el-option label="错误率" value="error_rate" />
                  <el-option label="请求量" value="request_count" />
                </el-select>
              </el-form-item>
              <el-form-item label="阈值条件" required>
                <div class="threshold-config">
                  <el-select v-model="newAlertForm.condition" style="width: 120px">
                    <el-option label="大于" value="gt" />
                    <el-option label="大于等于" value="gte" />
                    <el-option label="小于" value="lt" />
                    <el-option label="小于等于" value="lte" />
                    <el-option label="等于" value="eq" />
                  </el-select>
                  <el-input-number
                    v-model="newAlertForm.threshold"
                    :min="0"
                    :max="100"
                    controls-position="right"
                    style="margin-left: 8px; width: 120px"
                  />
                  <span style="margin-left: 8px; color: #909399">%</span>
                </div>
              </el-form-item>
              <el-form-item label="持续时间" required>
                <el-input-number
                  v-model="newAlertForm.duration"
                  :min="1"
                  :max="60"
                  controls-position="right"
                  style="width: 120px"
                />
                <span style="margin-left: 8px; color: #909399">分钟</span>
              </el-form-item>
              <el-form-item label="检查间隔" required>
                <el-input-number
                  v-model="newAlertForm.checkInterval"
                  :min="1"
                  :max="30"
                  controls-position="right"
                  style="width: 120px"
                />
                <span style="margin-left: 8px; color: #909399">分钟</span>
              </el-form-item>
            </el-form>
          </div>

          <!-- 步骤3: 通知设置 -->
          <div v-if="newAlertStep === 2" class="step-panel">
            <el-form :model="newAlertForm" label-width="100px">
              <el-form-item label="通知渠道">
                <el-checkbox-group v-model="newAlertForm.notificationChannels">
                  <el-checkbox label="email">邮箱</el-checkbox>
                  <el-checkbox label="webhook">Webhook</el-checkbox>
                  <el-checkbox label="slack">Slack</el-checkbox>
                  <el-checkbox label="dingtalk">钉钉</el-checkbox>
                  <el-checkbox label="wechat">企业微信</el-checkbox>
                  <el-checkbox label="sms">短信</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="重复通知">
                <el-switch v-model="newAlertForm.repeatNotification" />
                <span style="margin-left: 8px; color: #909399">
                  {{ newAlertForm.repeatNotification ? '开启' : '关闭' }}
                </span>
              </el-form-item>
              <el-form-item v-if="newAlertForm.repeatNotification" label="重复间隔">
                <el-input-number
                  v-model="newAlertForm.repeatInterval"
                  :min="5"
                  :max="60"
                  controls-position="right"
                  style="width: 120px"
                />
                <span style="margin-left: 8px; color: #909399">分钟</span>
              </el-form-item>
              <el-form-item label="静默时间">
                <el-time-picker
                  v-model="newAlertForm.silenceTime"
                  is-range
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  placeholder="选择时间范围"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div class="dialog-actions">
          <el-button
            v-if="newAlertStep > 0"
            @click="newAlertStep--"
          >
            上一步
          </el-button>
          <el-button
            v-if="newAlertStep < 2"
            type="primary"
            @click="newAlertStep++"
          >
            下一步
          </el-button>
          <el-button
            v-if="newAlertStep === 2"
            type="primary"
            @click="handleCreateAlert"
            :loading="creatingAlert"
          >
            创建规则
          </el-button>
          <el-button @click="handleNewAlertClose">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh, Bell, Warning, CircleClose, SuccessFilled } from '@element-plus/icons-vue'
import { useAlertsStore } from '@/store/alerts'
import AlertRulesPanel from './components/AlertRulesPanel.vue'
import AlertHistoryPanel from './components/AlertHistoryPanel.vue'
import MonitoringPanel from './components/MonitoringPanel.vue'
import NotificationChannelsPanel from './components/NotificationChannelsPanel.vue'

const alertsStore = useAlertsStore()

// 响应式数据
const activeTab = ref('rules')
const showNewAlertDialog = ref(false)
const newAlertStep = ref(0)
const creatingAlert = ref(false)

const rulesPanel = ref<InstanceType<typeof AlertRulesPanel>>()
const historyPanel = ref<InstanceType<typeof AlertHistoryPanel>>()
const monitoringPanel = ref<InstanceType<typeof MonitoringPanel>>()
const channelsPanel = ref<InstanceType<typeof NotificationChannelsPanel>>()

// 统计信息
const stats = reactive({
  totalAlerts: 0,
  activeAlerts: 0,
  criticalAlerts: 0,
  resolvedAlerts: 0
})

// 新建预警表单
const newAlertForm = reactive({
  name: '',
  description: '',
  severity: 'medium',
  type: 'threshold',
  metric: 'cpu_usage',
  condition: 'gt',
  threshold: 80,
  duration: 5,
  checkInterval: 5,
  notificationChannels: ['email'],
  repeatNotification: false,
  repeatInterval: 15,
  silenceTime: [] as any[]
})

// 生命周期
onMounted(() => {
  loadStats()
  // 自动刷新监控数据
  setInterval(() => {
    if (activeTab.value === 'monitoring') {
      monitoringPanel.value?.fetchMonitoringData()
    }
  }, 30000) // 30秒刷新一次
})

// 加载统计信息
const loadStats = async () => {
  try {
    await alertsStore.fetchAlertStats()
    Object.assign(stats, {
      totalAlerts: alertsStore.alertStats.totalAlerts,
      activeAlerts: alertsStore.alertStats.activeAlerts,
      criticalAlerts: alertsStore.alertStats.criticalAlerts,
      resolvedAlerts: alertsStore.alertStats.resolvedAlerts
    })
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 标签页切换
const handleTabChange = (tab: any) => {
  activeTab.value = tab.paneName
  
  // 延迟加载对应面板的数据
  nextTick(() => {
    switch (tab.paneName) {
      case 'rules':
        rulesPanel.value?.fetchAlertRules()
        break
      case 'history':
        historyPanel.value?.fetchAlertHistory()
        break
      case 'monitoring':
        monitoringPanel.value?.fetchMonitoringData()
        break
      case 'channels':
        channelsPanel.value?.fetchNotificationChannels()
        break
    }
  })
}

// 新建预警规则
const handleNewAlert = () => {
  showNewAlertDialog.value = true
  newAlertStep.value = 0
  // 重置表单
  Object.assign(newAlertForm, {
    name: '',
    description: '',
    severity: 'medium',
    type: 'threshold',
    metric: 'cpu_usage',
    condition: 'gt',
    threshold: 80,
    duration: 5,
    checkInterval: 5,
    notificationChannels: ['email'],
    repeatNotification: false,
    repeatInterval: 15,
    silenceTime: []
  })
}

// 关闭新建对话框
const handleNewAlertClose = () => {
  showNewAlertDialog.value = false
  newAlertStep.value = 0
}

// 创建预警规则
const handleCreateAlert = async () => {
  if (!newAlertForm.name.trim()) {
    ElMessage.error('请输入规则名称')
    return
  }

  creatingAlert.value = true
  try {
    await alertsStore.createAlertRule({
      name: newAlertForm.name,
      description: newAlertForm.description,
      severity: newAlertForm.severity,
      type: newAlertForm.type,
      metric: newAlertForm.metric,
      condition: newAlertForm.condition,
      threshold: newAlertForm.threshold,
      duration: newAlertForm.duration,
      checkInterval: newAlertForm.checkInterval,
      notificationChannels: newAlertForm.notificationChannels,
      repeatNotification: newAlertForm.repeatNotification,
      repeatInterval: newAlertForm.repeatInterval,
      enabled: true
    })
    
    ElMessage.success('创建成功')
    handleNewAlertClose()
    
    // 刷新规则列表
    if (activeTab.value === 'rules') {
      rulesPanel.value?.fetchAlertRules()
    }
    
    // 刷新统计信息
    loadStats()
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    creatingAlert.value = false
  }
}

// 刷新页面
const handleRefresh = () => {
  loadStats()
  
  // 刷新当前激活的面板
  switch (activeTab.value) {
    case 'rules':
      rulesPanel.value?.fetchAlertRules()
      break
    case 'history':
      historyPanel.value?.fetchAlertHistory()
      break
    case 'monitoring':
      monitoringPanel.value?.fetchMonitoringData()
      break
    case 'channels':
      channelsPanel.value?.fetchNotificationChannels()
      break
  }
  
  ElMessage.success('刷新成功')
}
</script>

<style scoped lang="scss">
.alerts-view {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background: #f0f2f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-cards {
  margin-bottom: 24px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #fff;

        &.total {
          background: linear-gradient(135deg, #409eff, #79bbff);
        }

        &.active {
          background: linear-gradient(135deg, #e6a23c, #f2c97d);
        }

        &.critical {
          background: linear-gradient(135deg, #f56c6c, #f89898);
        }

        &.resolved {
          background: linear-gradient(135deg, #67c23a, #95d475);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.tabs-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
  }

  :deep(.el-tabs__content) {
    padding: 0;
  }

  :deep(.el-tab-pane) {
    padding: 0;
  }
}

.new-alert-dialog {
  .step-content {
    margin: 24px 0;
    min-height: 300px;

    .step-panel {
      padding: 0 20px;
    }

    .threshold-config {
      display: flex;
      align-items: center;
    }
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #ebeef5;
  }
}

@media (max-width: 768px) {
  .alerts-view {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px;

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .stats-cards {
    .stat-card {
      .stat-content {
        .stat-icon {
          width: 50px;
          height: 50px;
          font-size: 20px;
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
          }
        }
      }
    }
  }

  .new-alert-dialog {
    .step-content {
      .step-panel {
        padding: 0;
      }

      .threshold-config {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;

        .el-select,
        .el-input-number {
          width: 100% !important;
        }
      }
    }

    .dialog-actions {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>