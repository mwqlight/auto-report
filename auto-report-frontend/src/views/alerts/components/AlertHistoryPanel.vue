<template>
  <div class="alert-history-panel">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">预警历史记录</h3>
        <p class="panel-description">查看和管理触发的预警记录</p>
      </div>
      <div class="header-right">
        <el-button @click="fetchAlertHistory">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button v-if="selectedAlerts.length > 0" type="primary" @click="handleBatchHandle">
          <el-icon><Check /></el-icon>
          批量处理 ({{ selectedAlerts.length }})
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon triggered">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.triggered || 0 }}</div>
            <div class="stat-label">待处理预警</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon resolved">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.resolved || 0 }}</div>
            <div class="stat-label">已解决预警</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon handled">
            <el-icon><Finished /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.handled || 0 }}</div>
            <div class="stat-label">已处理预警</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon critical">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.critical || 0 }}</div>
            <div class="stat-label">严重预警</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-input
        v-model="historyFilters.keyword"
        placeholder="搜索预警规则或消息"
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="historyFilters.status" placeholder="状态" clearable @change="handleSearch">
        <el-option label="待处理" value="triggered" />
        <el-option label="已解决" value="resolved" />
        <el-option label="已处理" value="handled" />
      </el-select>

      <el-select v-model="historyFilters.severity" placeholder="严重程度" clearable @change="handleSearch">
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="严重" value="critical" />
      </el-select>

      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        @change="handleDateChange"
      />

      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- 预警历史列表 -->
    <div class="history-list">
      <el-table
        v-loading="alertsStore.alertHistoryLoading"
        :data="alertsStore.alertHistory"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="ruleName" label="预警规则" min-width="200">
          <template #default="{ row }">
            <div class="rule-info">
              <div class="rule-name">{{ row.ruleName }}</div>
              <div class="alert-message">{{ row.message }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityTagType(row.severity)" effect="dark">
              {{ getSeverityLabel(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="triggeredValue" label="触发值" width="120">
          <template #default="{ row }">
            <span class="triggered-value">{{ row.triggeredValue }}</span>
            <span class="threshold-value">/ {{ row.thresholdValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="triggeredAt" label="触发时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.triggeredAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="handledAt" label="处理时间" width="180">
          <template #default="{ row }">
            {{ row.handledAt ? formatDate(row.handledAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="notificationSent" label="通知" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.notificationSent" type="success" size="small">已发送</el-tag>
            <el-tag v-else type="info" size="small">未发送</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 'handled'"
              size="small"
              type="primary"
              @click="handleMarkAsHandled(row.id)"
            >
              标记处理
            </el-button>
            <el-button
              v-else
              size="small"
              disabled
            >
              已处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="alertsStore.alertHistoryPagination.page"
          v-model:page-size="alertsStore.alertHistoryPagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="alertsStore.alertHistoryPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div v-if="selectedAlerts.length > 0" class="batch-toolbar">
      <span>已选择 {{ selectedAlerts.length }} 项</span>
      <el-button size="small" type="primary" @click="handleBatchHandle">批量处理</el-button>
      <el-button size="small" @click="selectedAlerts = []">取消选择</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Check,
  Warning,
  SuccessFilled,
  Finished,
  CircleClose,
  Search
} from '@element-plus/icons-vue'
import { useAlertsStore } from '@/store/alerts'
import type { AlertHistory } from '@/types/alerts'

const alertsStore = useAlertsStore()

// 响应式数据
const selectedAlerts = ref<string[]>([])
const dateRange = ref<string[]>([])

// 搜索筛选条件
const historyFilters = ref({
  keyword: '',
  status: '' as '' | 'triggered' | 'resolved' | 'handled',
  severity: '' as '' | 'low' | 'medium' | 'high' | 'critical',
  startTime: '',
  endTime: ''
})

// 统计信息
const stats = computed(() => {
  const history = alertsStore.alertHistory
  return {
    triggered: history.filter(a => a.status === 'triggered').length,
    resolved: history.filter(a => a.status === 'resolved').length,
    handled: history.filter(a => a.status === 'handled').length,
    critical: history.filter(a => a.severity === 'critical').length
  }
})

// 生命周期
onMounted(() => {
  fetchAlertHistory()
})

// 获取预警历史
const fetchAlertHistory = async () => {
  try {
    await alertsStore.fetchAlertHistory({
      keyword: historyFilters.value.keyword || undefined,
      status: historyFilters.value.status || undefined,
      startTime: historyFilters.value.startTime || undefined,
      endTime: historyFilters.value.endTime || undefined
    })
  } catch (error) {
    ElMessage.error('获取预警历史失败')
  }
}

// 搜索处理
const handleSearch = () => {
  alertsStore.alertHistoryPagination.page = 1
  fetchAlertHistory()
}

// 日期范围处理
const handleDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    historyFilters.value.startTime = dates[0]
    historyFilters.value.endTime = dates[1]
  } else {
    historyFilters.value.startTime = ''
    historyFilters.value.endTime = ''
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  alertsStore.alertHistoryPagination.size = size
  fetchAlertHistory()
}

const handleCurrentChange = (page: number) => {
  alertsStore.alertHistoryPagination.page = page
  fetchAlertHistory()
}

// 选择处理
const handleSelectionChange = (selection: AlertHistory[]) => {
  selectedAlerts.value = selection.map(item => item.id)
}

// 标记为已处理
const handleMarkAsHandled = async (id: string) => {
  try {
    await alertsStore.markAlertAsHandled(id)
    ElMessage.success('标记处理成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 批量处理
const handleBatchHandle = async () => {
  try {
    await ElMessageBox.confirm(
      `确定将选中的 ${selectedAlerts.value.length} 个预警标记为已处理吗？`,
      '确认处理',
      { type: 'warning' }
    )
    await alertsStore.batchHandleAlerts(selectedAlerts.value)
    ElMessage.success('批量处理成功')
    selectedAlerts.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量处理失败')
    }
  }
}

// 工具函数
const getSeverityLabel = (severity: string) => {
  const map = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return map[severity as keyof typeof map] || severity
}

const getSeverityTagType = (severity: string) => {
  const map = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return map[severity as keyof typeof map] || 'info'
}

const getStatusLabel = (status: string) => {
  const map = {
    triggered: '待处理',
    resolved: '已解决',
    handled: '已处理'
  }
  return map[status as keyof typeof map] || status
}

const getStatusTagType = (status: string) => {
  const map = {
    triggered: 'warning',
    resolved: 'success',
    handled: 'info'
  }
  return map[status as keyof typeof map] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.alert-history-panel {
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

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;

  .stat-card {
    :deep(.el-card__body) {
      padding: 16px;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #fff;

        &.triggered {
          background: #e6a23c;
        }

        &.resolved {
          background: #67c23a;
        }

        &.handled {
          background: #409eff;
        }

        &.critical {
          background: #f56c6c;
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}

.filter-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .el-select,
  .el-date-picker {
    width: 150px;
  }
}

.history-list {
  .rule-info {
    .rule-name {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .alert-message {
      font-size: 12px;
      color: #909399;
    }
  }

  .triggered-value {
    font-weight: 600;
    color: #f56c6c;
  }

  .threshold-value {
    font-size: 12px;
    color: #909399;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.batch-toolbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;

  span {
    font-size: 14px;
    color: #606266;
  }
}

@media (max-width: 768px) {
  .alert-history-panel {
    padding: 16px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
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

  .filter-toolbar {
    flex-direction: column;

    .el-input,
    .el-select,
    .el-date-picker {
      width: 100%;
    }
  }

  .batch-toolbar {
    left: 16px;
    right: 16px;
    transform: none;
    justify-content: space-between;
  }
}
</style>