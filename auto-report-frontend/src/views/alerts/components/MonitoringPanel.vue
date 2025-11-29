<template>
  <div class="monitoring-panel">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">系统监控</h3>
        <p class="panel-description">实时监控系统运行状态和性能指标</p>
      </div>
      <div class="header-right">
        <el-button @click="fetchRealtimeMetrics">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          @change="handleAutoRefreshChange"
        />
      </div>
    </div>

    <!-- 实时指标卡片 -->
    <div class="realtime-metrics">
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon cpu">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.cpu?.usage || 0 }}%</div>
                <div class="metric-label">CPU使用率</div>
                <div class="metric-detail">
                  <span>负载: {{ metrics.cpu?.loadAverage?.[0]?.toFixed(2) || 0 }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon memory">
                <el-icon><DataBoard /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.memory?.usage || 0 }}%</div>
                <div class="metric-label">内存使用率</div>
                <div class="metric-detail">
                  <span>{{ formatBytes(metrics.memory?.used || 0) }}/{{ formatBytes(metrics.memory?.total || 0) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon disk">
                <el-icon><HardDisk /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.disk?.usage || 0 }}%</div>
                <div class="metric-label">磁盘使用率</div>
                <div class="metric-detail">
                  <span>{{ formatBytes(metrics.disk?.used || 0) }}/{{ formatBytes(metrics.disk?.total || 0) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <el-card class="metric-card" shadow="hover">
            <div class="metric-content">
              <div class="metric-icon alerts">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ metrics.alerts?.active || 0 }}</div>
                <div class="metric-label">活跃预警</div>
                <div class="metric-detail">
                  <span>今日: {{ metrics.alerts?.triggeredToday || 0 }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="16">
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>CPU使用率趋势</span>
                <el-select v-model="cpuChartRange" size="small" style="width: 120px">
                  <el-option label="1小时" value="1h" />
                  <el-option label="6小时" value="6h" />
                  <el-option label="24小时" value="24h" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <v-chart :option="cpuChartOption" :autoresize="true" style="height: 300px" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>内存使用趋势</span>
                <el-select v-model="memoryChartRange" size="small" style="width: 120px">
                  <el-option label="1小时" value="1h" />
                  <el-option label="6小时" value="6h" />
                  <el-option label="24小时" value="24h" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <v-chart :option="memoryChartOption" :autoresize="true" style="height: 300px" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>预警趋势</span>
                <el-select v-model="alertsChartRange" size="small" style="width: 120px">
                  <el-option label="7天" value="7d" />
                  <el-option label="30天" value="30d" />
                  <el-option label="90天" value="90d" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <v-chart :option="alertsChartOption" :autoresize="true" style="height: 300px" />
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">
                <span>任务执行统计</span>
                <el-select v-model="tasksChartRange" size="small" style="width: 120px">
                  <el-option label="今日" value="today" />
                  <el-option label="本周" value="week" />
                  <el-option label="本月" value="month" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <v-chart :option="tasksChartOption" :autoresize="true" style="height: 300px" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 系统状态 -->
    <div class="system-status">
      <el-card shadow="hover">
        <template #header>
          <span>系统状态</span>
        </template>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6">
            <div class="status-item">
              <div class="status-label">数据库连接</div>
              <div class="status-value">
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="status-item">
              <div class="status-label">Redis连接</div>
              <div class="status-value">
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="status-item">
              <div class="status-label">API服务</div>
              <div class="status-value">
                <el-tag type="success" size="small">正常</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="status-item">
              <div class="status-label">定时任务</div>
              <div class="status-value">
                <el-tag type="success" size="small">运行中</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 最近预警 -->
    <div class="recent-alerts">
      <el-card shadow="hover">
        <template #header>
          <span>最近预警</span>
          <el-button type="primary" text size="small" @click="$router.push('/alerts/history')">
            查看全部
          </el-button>
        </template>
        <el-table :data="recentAlerts" style="width: 100%">
          <el-table-column prop="ruleName" label="规则名称" />
          <el-table-column prop="severity" label="严重程度" width="100">
            <template #default="{ row }">
              <el-tag :type="getSeverityTagType(row.severity)" size="small">
                {{ getSeverityLabel(row.severity) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="triggeredAt" label="触发时间" width="180">
            <template #default="{ row }">
              {{ formatTimeAgo(row.triggeredAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" @click="handleViewAlert(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Cpu,
  DataBoard,
  HardDisk,
  Warning,
  TrendCharts
} from '@element-plus/icons-vue'
import { useAlertsStore } from '@/store/alerts'
import type { AlertHistory } from '@/types/alerts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册echarts组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const alertsStore = useAlertsStore()

// 响应式数据
const autoRefresh = ref(false)
const refreshTimer = ref<NodeJS.Timeout | null>(null)
const cpuChartRange = ref('1h')
const memoryChartRange = ref('1h')
const alertsChartRange = ref('7d')
const tasksChartRange = ref('today')

// 实时指标数据
const metrics = computed(() => alertsStore.realtimeMetrics || {
  cpu: { usage: 0, loadAverage: [0, 0, 0] },
  memory: { usage: 0, total: 0, used: 0, free: 0 },
  disk: { usage: 0, total: 0, used: 0, free: 0 },
  alerts: { active: 0, triggeredToday: 0 },
  tasks: { active: 0, queued: 0, completedToday: 0 }
})

// 最近预警数据
const recentAlerts = computed(() => 
  alertsStore.alertHistory.slice(0, 5)
)

// 图表配置
const cpuChartOption = computed(() => ({
  title: { text: 'CPU使用率趋势', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
  },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{
    name: 'CPU使用率',
    type: 'line',
    data: [15, 22, 45, 32, 28, 35, 18],
    smooth: true,
    lineStyle: { color: '#ff6b6b' },
    areaStyle: { color: 'rgba(255, 107, 107, 0.1)' }
  }]
}))

const memoryChartOption = computed(() => ({
  title: { text: '内存使用趋势', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
  },
  yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
  series: [{
    name: '内存使用率',
    type: 'line',
    data: [25, 32, 48, 55, 42, 38, 28],
    smooth: true,
    lineStyle: { color: '#4834d4' },
    areaStyle: { color: 'rgba(72, 52, 212, 0.1)' }
  }]
}))

const alertsChartOption = computed(() => ({
  title: { text: '预警趋势', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['低', '中', '高', '严重'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['1月1日', '1月2日', '1月3日', '1月4日', '1月5日', '1月6日', '1月7日']
  },
  yAxis: { type: 'value' },
  series: [
    { name: '低', type: 'line', data: [2, 3, 1, 4, 2, 3, 1], smooth: true, lineStyle: { color: '#909399' } },
    { name: '中', type: 'line', data: [1, 2, 0, 3, 1, 2, 0], smooth: true, lineStyle: { color: '#e6a23c' } },
    { name: '高', type: 'line', data: [0, 1, 0, 2, 0, 1, 0], smooth: true, lineStyle: { color: '#f56c6c' } },
    { name: '严重', type: 'line', data: [0, 0, 0, 1, 0, 0, 0], smooth: true, lineStyle: { color: '#f5222d' } }
  ]
}))

const tasksChartOption = computed(() => ({
  title: { text: '任务执行统计', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' },
  legend: { data: ['成功', '失败', '排队中'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
  },
  yAxis: { type: 'value' },
  series: [
    { name: '成功', type: 'bar', data: [12, 8, 15, 20, 18, 10, 5], itemStyle: { color: '#52c41a' } },
    { name: '失败', type: 'bar', data: [1, 0, 2, 0, 1, 0, 0], itemStyle: { color: '#f5222d' } },
    { name: '排队中', type: 'bar', data: [3, 2, 0, 1, 0, 2, 0], itemStyle: { color: '#faad14' } }
  ]
}))

// 生命周期
onMounted(() => {
  fetchRealtimeMetrics()
  // 每30秒自动刷新
  refreshTimer.value = setInterval(() => {
    if (autoRefresh.value) {
      fetchRealtimeMetrics()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})

// 获取实时监控数据
const fetchRealtimeMetrics = async () => {
  try {
    await alertsStore.fetchRealtimeMetrics()
  } catch (error) {
    ElMessage.error('获取监控数据失败')
  }
}

// 自动刷新处理
const handleAutoRefreshChange = (enabled: boolean) => {
  autoRefresh.value = enabled
  if (enabled) {
    fetchRealtimeMetrics()
  }
}

// 查看预警详情
const handleViewAlert = (alert: AlertHistory) => {
  // 跳转到预警详情页面
  console.log('查看预警详情:', alert)
}

// 工具函数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

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

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.monitoring-panel {
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

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.realtime-metrics {
  margin-bottom: 20px;

  .metric-card {
    :deep(.el-card__body) {
      padding: 16px;
    }

    .metric-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .metric-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #fff;

        &.cpu {
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        }

        &.memory {
          background: linear-gradient(135deg, #4834d4, #686de0);
        }

        &.disk {
          background: linear-gradient(135deg, #10ac84, #1dd1a1);
        }

        &.alerts {
          background: linear-gradient(135deg, #f0932b, #f6e58d);
        }
      }

      .metric-info {
        flex: 1;

        .metric-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .metric-detail {
          font-size: 12px;
          color: #c0c4cc;
        }
      }
    }
  }
}

.charts-section {
  margin-bottom: 20px;

  .chart-card {
    margin-bottom: 16px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-container {
      height: 300px;
    }
  }
}

.system-status {
  margin-bottom: 20px;

  .status-item {
    text-align: center;
    padding: 16px 0;

    .status-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .status-value {
      font-size: 16px;
      font-weight: 500;
    }
  }
}

.recent-alerts {
  :deep(.el-card__header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .monitoring-panel {
    padding: 16px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }

  .realtime-metrics {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .charts-section {
    .el-col {
      margin-bottom: 16px;
    }
  }
}
</style>