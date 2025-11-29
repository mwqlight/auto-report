<template>
  <div class="chart-detail-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon">
            <component :is="getChartTypeIcon(chart?.type)" />
          </el-icon>
          <div>
            <h1>{{ chart?.name || '图表详情' }}</h1>
            <p>{{ chart?.description || '查看图表详细信息和使用情况' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <el-button @click="handleEdit" type="primary">
            <el-icon><Edit /></el-icon>
            编辑图表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content">
      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <h3>基本信息</h3>
            <div class="card-actions">
              <el-button
                type="primary"
                text
                @click="handleRefresh"
                :loading="refreshing"
              >
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
              <el-button
                type="success"
                text
                @click="handleCopy"
                :loading="copying"
              >
                <el-icon><CopyDocument /></el-icon>
                复制图表
              </el-button>
            </div>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">图表名称</div>
            <div class="info-value">{{ chart?.name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">图表描述</div>
            <div class="info-value">{{ chart?.description || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">图表类型</div>
            <div class="info-value">
              <el-tag :type="getChartTypeTagType(chart?.type)">
                {{ getChartTypeLabel(chart?.type) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">数据集</div>
            <div class="info-value">{{ getDatasetName(chart?.datasetId) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">公开状态</div>
            <div class="info-value">
              <el-tag :type="chart?.isPublic ? 'success' : 'info'">
                {{ chart?.isPublic ? '公开' : '私有' }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ formatTime(chart?.createdAt) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">最后更新</div>
            <div class="info-value">{{ formatTime(chart?.updatedAt) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <el-tag :type="getStatusType(chart?.status)">
                {{ getStatusLabel(chart?.status) }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 图表预览 -->
      <el-card class="preview-card">
        <template #header>
          <div class="card-header">
            <h3>图表预览</h3>
            <div class="card-actions">
              <el-button
                type="primary"
                text
                @click="handleFullscreen"
              >
                <el-icon><FullScreen /></el-icon>
                全屏预览
              </el-button>
              <el-button
                type="success"
                text
                @click="exportChartData"
              >
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
            </div>
          </div>
        </template>

        <div class="preview-content">
          <div v-if="!chartData" class="preview-empty">
            <el-icon class="empty-icon">
              <component :is="getChartTypeIcon(chart?.type)" />
            </el-icon>
            <p>暂无数据预览</p>
            <el-button type="primary" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
          
          <div v-else-if="loadingData" class="preview-loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>正在加载图表数据...</p>
          </div>
          
          <div v-else class="chart-container">
            <!-- 图表渲染区域 -->
            <div class="chart-render">
              <div class="chart-placeholder">
                <el-icon class="chart-icon">
                  <component :is="getChartTypeIcon(chart?.type)" />
                </el-icon>
                <div class="chart-info">
                  <h4>{{ chart?.name || '图表预览' }}</h4>
                  <p>{{ chart?.description || '图表数据展示区域' }}</p>
                </div>
                
                <!-- 模拟数据展示 -->
                <div class="mock-data">
                  <div class="data-summary">
                    <div class="summary-item">
                      <span class="label">数据量:</span>
                      <span class="value">{{ chartData?.data?.length || 0 }} 条</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">维度字段:</span>
                      <span class="value">{{ chart?.config?.dimensions?.join(', ') || '-' }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="label">度量字段:</span>
                      <span class="value">{{ chart?.config?.measures?.join(', ') || '-' }}</span>
                    </div>
                  </div>
                  
                  <!-- 数据表格预览 -->
                  <div class="data-table">
                    <h5>数据预览（前5条）</h5>
                    <el-table
                      :data="previewData"
                      size="small"
                      border
                      style="width: 100%"
                    >
                      <el-table-column
                        v-for="field in previewFields"
                        :key="field"
                        :prop="field"
                        :label="field"
                        min-width="100"
                      />
                    </el-table>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 图表配置信息 -->
            <div class="chart-config">
              <h4>配置信息</h4>
              <div class="config-grid">
                <div class="config-item">
                  <span class="label">图表类型:</span>
                  <span class="value">{{ getChartTypeLabel(chart?.type) }}</span>
                </div>
                <div class="config-item">
                  <span class="label">数据集:</span>
                  <span class="value">{{ getDatasetName(chart?.datasetId) }}</span>
                </div>
                <div class="config-item">
                  <span class="label">维度字段:</span>
                  <span class="value">{{ chart?.config?.dimensions?.join(', ') || '-' }}</span>
                </div>
                <div class="config-item">
                  <span class="label">度量字段:</span>
                  <span class="value">{{ chart?.config?.measures?.join(', ') || '-' }}</span>
                </div>
                <div class="config-item">
                  <span class="label">聚合方式:</span>
                  <span class="value">{{ chart?.config?.aggregation || '求和' }}</span>
                </div>
                <div class="config-item">
                  <span class="label">筛选条件:</span>
                  <span class="value">{{ chart?.config?.filters?.length || 0 }} 个</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 使用统计 -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <h3>使用统计</h3>
            <div class="card-actions">
              <el-date-picker
                v-model="statsDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="handleStatsDateChange"
              />
            </div>
          </div>
        </template>

        <div class="stats-content">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon primary">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chartStats?.viewCount || 0 }}</div>
                <div class="stat-label">总访问次数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon success">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chartStats?.uniqueUsers || 0 }}</div>
                <div class="stat-label">独立用户数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon warning">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chartStats?.avgDuration || 0 }}s</div>
                <div class="stat-label">平均停留时间</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon info">
                <el-icon><Share /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ chartStats?.shareCount || 0 }}</div>
                <div class="stat-label">分享次数</div>
              </div>
            </div>
          </div>
          
          <div class="stats-chart">
            <div class="chart-placeholder">
              <el-icon class="placeholder-icon"><TrendCharts /></el-icon>
              <p>访问趋势图表（开发中）</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 关联仪表板 -->
      <el-card class="dashboards-card">
        <template #header>
          <div class="card-header">
            <h3>关联仪表板</h3>
            <div class="card-actions">
              <el-input
                v-model="dashboardSearch"
                placeholder="搜索仪表板"
                clearable
                style="width: 200px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>

        <div class="dashboards-content">
          <div v-if="!relatedDashboards.length" class="dashboards-empty">
            <el-icon class="empty-icon"><DataBoard /></el-icon>
            <p>该图表暂无关联仪表板</p>
          </div>
          
          <div v-else class="dashboards-list">
            <div
              v-for="dashboard in filteredDashboards"
              :key="dashboard.id"
              class="dashboard-item"
              @click="viewDashboardDetail(dashboard.id)"
            >
              <div class="dashboard-main">
                <div class="dashboard-icon-section">
                  <el-icon class="dashboard-icon">
                    <DataBoard />
                  </el-icon>
                </div>
                <div class="dashboard-info">
                  <div class="dashboard-name">{{ dashboard.name }}</div>
                  <div class="dashboard-meta">
                    <span class="dashboard-description">{{ dashboard.description || '暂无描述' }}</span>
                    <span class="dashboard-update">最后更新: {{ formatTime(dashboard.updatedAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="dashboard-status">
                <el-tag :type="getStatusType(dashboard.status)" size="small">
                  {{ getStatusLabel(dashboard.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Edit,
  Refresh,
  CopyDocument,
  FullScreen,
  Download,
  View,
  User,
  Clock,
  Share,
  Search,
  DataBoard,
  TrendCharts,
  Loading
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import { useDatasetStore } from '@/store/dataset'
import type { AnalysisChart, AnalysisDashboard, ChartData } from '@/types/analysis'

const router = useRouter()
const route = useRoute()
const analysisStore = useAnalysisStore()
const datasetStore = useDatasetStore()

// 响应式数据
const refreshing = ref(false)
const copying = ref(false)
const loadingData = ref(false)
const statsDateRange = ref<[Date, Date]>([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
  new Date() // 今天
])
const dashboardSearch = ref('')

// 图表ID
const chartId = computed(() => parseInt(route.params.id as string))

// 数据
const chart = ref<AnalysisChart | null>(null)
const chartData = ref<ChartData | null>(null)
const chartStats = ref({
  viewCount: 0,
  uniqueUsers: 0,
  avgDuration: 0,
  shareCount: 0
})
const relatedDashboards = ref<AnalysisDashboard[]>([])

// 计算属性
const filteredDashboards = computed(() => {
  if (!dashboardSearch.value) {
    return relatedDashboards.value
  }
  
  const searchTerm = dashboardSearch.value.toLowerCase()
  return relatedDashboards.value.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm) ||
    dashboard.description?.toLowerCase().includes(searchTerm)
  )
})

const previewData = computed(() => {
  if (!chartData.value?.data) return []
  return chartData.value.data.slice(0, 5)
})

const previewFields = computed(() => {
  if (!chartData.value?.data?.length) return []
  return Object.keys(chartData.value.data[0])
})

// 方法
const loadChart = async () => {
  try {
    await analysisStore.fetchChartDetail(chartId.value)
    chart.value = analysisStore.chartDetail
  } catch (error) {
    ElMessage.error('加载图表详情失败')
    router.push('/analysis')
  }
}

const loadChartData = async () => {
  if (!chart.value) return
  
  loadingData.value = true
  
  try {
    await analysisStore.fetchChartData(chartId.value)
    chartData.value = analysisStore.chartData
  } catch (error) {
    ElMessage.error('加载图表数据失败')
  } finally {
    loadingData.value = false
  }
}

const loadChartStats = async () => {
  try {
    // 模拟加载统计数据
    await new Promise(resolve => setTimeout(resolve, 500))
    chartStats.value = {
      viewCount: 89,
      uniqueUsers: 23,
      avgDuration: 2.8,
      shareCount: 5
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const loadRelatedDashboards = async () => {
  try {
    await analysisStore.fetchDashboards()
    // 模拟关联仪表板数据
    relatedDashboards.value = analysisStore.dashboards.slice(0, 3)
  } catch (error) {
    ElMessage.error('加载关联仪表板失败')
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  
  try {
    await Promise.all([
      loadChart(),
      loadChartData(),
      loadChartStats(),
      loadRelatedDashboards()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

const handleCopy = async () => {
  if (!chart.value) return

  copying.value = true
  
  try {
    await analysisStore.copyChart(chartId.value)
    ElMessage.success('图表复制成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('复制图表失败')
  } finally {
    copying.value = false
  }
}

const handleEdit = () => {
  router.push(`/analysis/chart/${chartId.value}/edit`)
}

const handleBack = () => {
  router.push('/analysis')
}

const handleFullscreen = () => {
  // 全屏预览功能
  ElMessage.info('全屏预览功能开发中')
}

const exportChartData = () => {
  // 导出数据功能
  ElMessage.info('数据导出功能开发中')
}

const handleStatsDateChange = () => {
  // 重新加载统计数据
  loadChartStats()
}

const viewDashboardDetail = (dashboardId: number) => {
  router.push(`/analysis/dashboard/${dashboardId}/detail`)
}

// 辅助方法
const getChartTypeIcon = (type?: string) => {
  const iconMap: Record<string, string> = {
    'line': 'LineChart',
    'bar': 'Histogram',
    'pie': 'PieChart',
    'scatter': 'TrendCharts'
  }
  return iconMap[type || 'line'] || 'PieChart'
}

const getChartTypeLabel = (type?: string) => {
  const labelMap: Record<string, string> = {
    'line': '折线图',
    'bar': '柱状图',
    'pie': '饼图',
    'scatter': '散点图'
  }
  return labelMap[type || 'line'] || type || '折线图'
}

const getChartTypeTagType = (type?: string) => {
  const typeMap: Record<string, any> = {
    'line': 'primary',
    'bar': 'success',
    'pie': 'warning',
    'scatter': 'info'
  }
  return typeMap[type || 'line'] || 'info'
}

const getDatasetName = (datasetId?: number) => {
  if (!datasetId) return '未知数据集'
  const dataset = datasetStore.datasets.find(d => d.id === datasetId)
  return dataset?.name || '未知数据集'
}

const getStatusType = (status?: string) => {
  const typeMap: Record<string, any> = {
    'draft': 'info',
    'active': 'success',
    'error': 'danger',
    'archived': 'warning'
  }
  return typeMap[status || 'draft'] || 'info'
}

const getStatusLabel = (status?: string) => {
  const labelMap: Record<string, string> = {
    'draft': '草稿',
    'active': '活跃',
    'error': '错误',
    'archived': '已归档'
  }
  return labelMap[status || 'draft'] || '未知'
}

const formatTime = (time?: string | Date) => {
  if (!time) return '未知'
  const date = typeof time === 'string' ? new Date(time) : time
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  loadChart()
  loadChartData()
  loadChartStats()
  loadRelatedDashboards()
})
</script>

<style scoped lang="scss">
.chart-detail-view {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  margin-bottom: var(--space-8);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .title-section {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      
      .header-icon {
        font-size: 2.5rem;
        color: var(--color-primary);
      }
      
      h1 {
        font-size: var(--font-size-3xl);
        color: var(--color-text-primary);
        margin-bottom: var(--space-2);
        font-weight: 600;
      }
      
      p {
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--space-3);
    }
  }
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.info-card {
  :deep(.el-card__header) {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border-light);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 600;
      }
      
      .card-actions {
        display: flex;
        gap: var(--space-2);
      }
    }
  }
  
  :deep(.el-card__body) {
    padding: var(--space-5);
  }
  
  .dashboards-content {
    .dashboards-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) 0;
      color: var(--color-text-tertiary);
      
      .empty-icon {
        font-size: 3rem;
        margin-bottom: var(--space-3);
      }
      
      p {
        margin: 0;
        font-size: var(--font-size-lg);
      }
    }
    
    .dashboards-list {
      .dashboard-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--space-3);
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: var(--color-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .dashboard-main {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
          
          .dashboard-icon-section {
            .dashboard-icon {
              font-size: 2rem;
              color: var(--color-primary);
            }
          }
          
          .dashboard-info {
            .dashboard-name {
              font-size: var(--font-size-lg);
              font-weight: 600;
              color: var(--color-text-primary);
              margin-bottom: var(--space-1);
            }
            
            .dashboard-meta {
              display: flex;
              gap: var(--space-4);
              font-size: var(--font-size-sm);
              color: var(--color-text-secondary);
              
              .dashboard-description {
                color: var(--color-text-tertiary);
              }
              
              .dashboard-update {
                color: var(--color-text-tertiary);
              }
            }
          }
        }
        
        .dashboard-status {
          min-width: 60px;
        }
      }
    }
  }
}

// 动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 1200px) {
  .chart-detail-view {
    padding: var(--space-4);
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: var(--space-4);
    
    .title-section {
      text-align: center;
    }
  }
  
  .info-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .chart-container {
    grid-template-columns: 1fr !important;
    gap: var(--space-4) !important;
  }
}

@media (max-width: 768px) {
  .chart-detail-view {
    padding: var(--space-3);
  }
  
  .page-header .header-content .title-section {
    flex-direction: column;
    text-align: center;
    gap: var(--space-2);
    
    .header-icon {
      font-size: 2rem;
    }
    
    h1 {
      font-size: var(--font-size-2xl);
    }
  }
  
  .info-grid {
    grid-template-columns: 1fr !important;
  }
  
  .stats-grid {
    grid-template-columns: 1fr !important;
  }
  
  .data-summary {
    grid-template-columns: 1fr !important;
  }
  
  .dashboard-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: var(--space-3);
    
    .dashboard-meta {
      flex-direction: column;
      gap: var(--space-1) !important;
    }
  }
}
</style>color-border-light);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 600;
      }
      
      .card-actions {
        display: flex;
        gap: var(--space-2);
      }
    }
  }
  
  :deep(.el-card__body) {
    padding: var(--space-5);
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
    
    .info-item {
      .info-label {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-1);
      }
      
      .info-value {
        font-size: var(--font-size-base);
        color: var(--color-text-primary);
        font-weight: 500;
      }
    }
  }
}

.preview-card {
  :deep(.el-card__header) {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border-light);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 600;
      }
      
      .card-actions {
        display: flex;
        gap: var(--space-2);
      }
    }
  }
  
  :deep(.el-card__body) {
    padding: var(--space-5);
  }
  
  .preview-content {
    .preview-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) 0;
      color: var(--color-text-tertiary);
      
      .empty-icon {
        font-size: 4rem;
        margin-bottom: var(--space-3);
      }
      
      p {
        margin: 0 0 var(--space-4) 0;
        font-size: var(--font-size-lg);
      }
    }
    
    .preview-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--space-12) 0;
      color: var(--color-text-tertiary);
      
      .loading-icon {
        font-size: 3rem;
        margin-bottom: var(--space-3);
        animation: spin 1s linear infinite;
      }
      
      p {
        margin: 0;
        font-size: var(--font-size-lg);
      }
    }
    
    .chart-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--space-6);
      
      .chart-render {
        .chart-placeholder {
          border: 2px dashed var(--color-border);
          border-radius: var(--border-radius-lg);
          padding: var(--space-8);
          background: var(--color-bg-light);
          
          .chart-icon {
            font-size: 4rem;
            color: var(--color-primary);
            margin-bottom: var(--space-4);
          }
          
          .chart-info {
            text-align: center;
            margin-bottom: var(--space-6);
            
            h4 {
              font-size: var(--font-size-xl);
              color: var(--color-text-primary);
              margin: 0 0 var(--space-2) 0;
            }
            
            p {
              color: var(--color-text-secondary);
              margin: 0;
            }
          }
          
          .mock-data {
            .data-summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: var(--space-4);
              margin-bottom: var(--space-6);
              
              .summary-item {
                text-align: center;
                
                .label {
                  display: block;
                  font-size: var(--font-size-sm);
                  color: var(--color-text-secondary);
                  margin-bottom: var(--space-1);
                }
                
                .value {
                  display: block;
                  font-size: var(--font-size-lg);
                  font-weight: 600;
                  color: var(--color-text-primary);
                }
              }
            }
            
            .data-table {
              h5 {
                margin: 0 0 var(--space-3) 0;
                color: var(--color-text-primary);
                font-size: var(--font-size-base);
              }
            }
          }
        }
      }
      
      .chart-config {
        h4 {
          margin: 0 0 var(--space-4) 0;
          color: var(--color-text-primary);
          font-size: var(--font-size-lg);
        }
        
        .config-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          
          .config-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-3);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            
            .label {
              font-size: var(--font-size-sm);
              color: var(--color-text-secondary);
            }
            
            .value {
              font-size: var(--font-size-sm);
              color: var(--color-text-primary);
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}

.stats-card {
  :deep(.el-card__header) {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border-light);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: 600;
      }
      
      .card-actions {
        display: flex;
        gap: var(--space-2);
      }
    }
  }
  
  :deep(.el-card__body) {
    padding: var(--space-5);
  }
  
  .stats-content {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-4);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        
        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          font-size: 1.5rem;
          
          &.primary {
            background: var(--color-primary-light);
            color: var(--color-primary);
          }
          
          &.success {
            background: var(--color-success-light);
            color: var(--color-success);
          }
          
          &.warning {
            background: var(--color-warning-light);
            color: var(--color-warning);
          }
          
          &.info {
            background: var(--color-info-light);
            color: var(--color-info);
          }
        }
        
        .stat-info {
          .stat-value {
            font-size: var(--font-size-2xl);
            font-weight: 700;
            color: var(--color-text-primary);
            line-height: 1;
          }
          
          .stat-label {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
            margin-top: var(--space-1);
          }
        }
      }
    }
    
    .stats-chart {
      .chart-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-12) 0;
        color: var(--color-text-tertiary);
        border: 2px dashed var(--color-border);
        border-radius: var(--border-radius-lg);
        
        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: var(--space-3);
        }
        
        p {
          margin: 0;
          font-size: var(--font-size-lg);
        }
      }
    }
  }
}

.dashboards-card {
  :deep(.el-card__header) {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--