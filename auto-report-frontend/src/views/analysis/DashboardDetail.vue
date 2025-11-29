<template>
  <div class="dashboard-detail-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><DataBoard /></el-icon>
          <div>
            <h1>{{ dashboard?.name || '仪表板详情' }}</h1>
            <p>{{ dashboard?.description || '查看仪表板详细信息和使用情况' }}</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <el-button @click="handleEdit" type="primary">
            <el-icon><Edit /></el-icon>
            编辑仪表板
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
                复制仪表板
              </el-button>
            </div>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">仪表板名称</div>
            <div class="info-value">{{ dashboard?.name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">仪表板描述</div>
            <div class="info-value">{{ dashboard?.description || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">布局模板</div>
            <div class="info-value">{{ getLayoutTemplateLabel(dashboard?.layoutTemplate) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">公开状态</div>
            <div class="info-value">
              <el-tag :type="dashboard?.isPublic ? 'success' : 'info'">
                {{ dashboard?.isPublic ? '公开' : '私有' }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">创建时间</div>
            <div class="info-value">{{ formatTime(dashboard?.createdAt) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">最后更新</div>
            <div class="info-value">{{ formatTime(dashboard?.updatedAt) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <el-tag :type="getStatusType(dashboard?.status)">
                {{ getStatusLabel(dashboard?.status) }}
              </el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">图表数量</div>
            <div class="info-value">{{ dashboard?.config?.layout?.length || 0 }} 个</div>
          </div>
        </div>
      </el-card>

      <!-- 图表布局预览 -->
      <el-card class="layout-card">
        <template #header>
          <div class="card-header">
            <h3>图表布局预览</h3>
            <div class="card-actions">
              <el-button
                type="primary"
                text
                @click="handleFullscreen"
              >
                <el-icon><FullScreen /></el-icon>
                全屏预览
              </el-button>
            </div>
          </div>
        </template>

        <div class="layout-content">
          <div v-if="!dashboard?.config?.layout?.length" class="layout-empty">
            <el-icon class="empty-icon"><DataBoard /></el-icon>
            <p>该仪表板暂无图表</p>
            <el-button type="primary" @click="handleEdit">
              <el-icon><Plus /></el-icon>
              添加图表
            </el-button>
          </div>
          
          <div v-else class="layout-preview">
            <div class="dashboard-preview">
              <div class="dashboard-header">
                <h3>{{ dashboard?.name || '仪表板预览' }}</h3>
                <p v-if="dashboard?.description">{{ dashboard?.description }}</p>
              </div>
              
              <div class="dashboard-body">
                <div
                  v-for="layoutItem in dashboard?.config?.layout || []"
                  :key="layoutItem.chartId"
                  class="chart-widget"
                  :style="{
                    gridArea: `${layoutItem.position.y + 1} / ${layoutItem.position.x + 1} / span ${layoutItem.position.h} / span ${layoutItem.position.w}`
                  }"
                >
                  <div class="widget-header">
                    <div class="widget-title">
                      <el-icon class="widget-icon">
                        <component :is="getChartTypeIcon(getChartType(layoutItem.chartId))" />
                      </el-icon>
                      <span>{{ getChartName(layoutItem.chartId) }}</span>
                    </div>
                    <div class="widget-actions">
                      <el-button
                        type="text"
                        size="small"
                        @click="viewChartDetail(layoutItem.chartId)"
                      >
                        <el-icon><View /></el-icon>
                      </el-button>
                      <el-button
                        type="text"
                        size="small"
                        @click="refreshChartData(layoutItem.chartId)"
                      >
                        <el-icon><Refresh /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  <div class="widget-content">
                    <div class="chart-preview">
                      <el-icon class="chart-icon">
                        <component :is="getChartTypeIcon(getChartType(layoutItem.chartId))" />
                      </el-icon>
                      <div class="chart-info">
                        <div class="chart-type">{{ getChartTypeLabel(getChartType(layoutItem.chartId)) }}</div>
                        <div class="chart-dataset">{{ getDatasetName(getChartDatasetId(layoutItem.chartId)) }}</div>
                      </div>
                    </div>
                    <div class="chart-data">
                      <div class="data-item">
                        <span class="data-label">状态:</span>
                        <el-tag :type="getStatusType(getChartStatus(layoutItem.chartId))" size="small">
                          {{ getStatusLabel(getChartStatus(layoutItem.chartId)) }}
                        </el-tag>
                      </div>
                      <div class="data-item">
                        <span class="data-label">最后更新:</span>
                        <span class="data-value">{{ formatTime(getChartUpdatedAt(layoutItem.chartId)) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 图表列表 -->
      <el-card class="charts-card">
        <template #header>
          <div class="card-header">
            <h3>图表列表</h3>
            <div class="card-actions">
              <el-input
                v-model="chartSearch"
                placeholder="搜索图表"
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

        <div class="charts-content">
          <div v-if="!dashboard?.config?.layout?.length" class="charts-empty">
            <el-icon class="empty-icon"><PieChart /></el-icon>
            <p>该仪表板暂无图表</p>
          </div>
          
          <div v-else class="charts-list">
            <div
              v-for="chart in filteredCharts"
              :key="chart.id"
              class="chart-item"
            >
              <div class="chart-main">
                <div class="chart-icon-section">
                  <el-icon class="chart-icon">
                    <component :is="getChartTypeIcon(chart.type)" />
                  </el-icon>
                </div>
                <div class="chart-info">
                  <div class="chart-name">{{ chart.name }}</div>
                  <div class="chart-meta">
                    <span class="chart-type">{{ getChartTypeLabel(chart.type) }}</span>
                    <span class="chart-dataset">{{ getDatasetName(chart.datasetId) }}</span>
                    <span class="chart-update">最后更新: {{ formatTime(chart.updatedAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="chart-actions">
                <el-button
                  type="primary"
                  text
                  size="small"
                  @click="viewChartDetail(chart.id)"
                >
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button
                  type="success"
                  text
                  size="small"
                  @click="refreshChartData(chart.id)"
                >
                  <el-icon><Refresh /></el-icon>
                  刷新数据
                </el-button>
              </div>
              <div class="chart-status">
                <el-tag :type="getStatusType(chart.status)" size="small">
                  {{ getStatusLabel(chart.status) }}
                </el-tag>
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
                <div class="stat-value">{{ dashboardStats?.viewCount || 0 }}</div>
                <div class="stat-label">总访问次数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon success">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardStats?.uniqueUsers || 0 }}</div>
                <div class="stat-label">独立用户数</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon warning">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardStats?.avgDuration || 0 }}s</div>
                <div class="stat-label">平均停留时间</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon info">
                <el-icon><Share /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ dashboardStats?.shareCount || 0 }}</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataBoard,
  ArrowLeft,
  Edit,
  Refresh,
  CopyDocument,
  FullScreen,
  View,
  Plus,
  Search,
  User,
  Clock,
  Share,
  PieChart,
  TrendCharts
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import { useDatasetStore } from '@/store/dataset'
import type { AnalysisChart, AnalysisDashboard } from '@/types/analysis'

const router = useRouter()
const route = useRoute()
const analysisStore = useAnalysisStore()
const datasetStore = useDatasetStore()

// 响应式数据
const refreshing = ref(false)
const copying = ref(false)
const chartSearch = ref('')
const statsDateRange = ref<[Date, Date]>([
  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
  new Date() // 今天
])

// 仪表板ID
const dashboardId = computed(() => parseInt(route.params.id as string))

// 数据
const dashboard = ref<AnalysisDashboard | null>(null)
const charts = ref<AnalysisChart[]>([])
const dashboardStats = ref({
  viewCount: 0,
  uniqueUsers: 0,
  avgDuration: 0,
  shareCount: 0
})

// 计算属性
const filteredCharts = computed(() => {
  if (!dashboard.value?.config?.layout) return []
  
  const chartIds = dashboard.value.config.layout.map(item => item.chartId)
  const dashboardCharts = charts.value.filter(chart => chartIds.includes(chart.id))
  
  if (!chartSearch.value) {
    return dashboardCharts
  }
  
  const searchTerm = chartSearch.value.toLowerCase()
  return dashboardCharts.filter(chart =>
    chart.name.toLowerCase().includes(searchTerm) ||
    chart.type.toLowerCase().includes(searchTerm) ||
    getDatasetName(chart.datasetId).toLowerCase().includes(searchTerm)
  )
})

// 方法
const loadDashboard = async () => {
  try {
    await analysisStore.fetchDashboardDetail(dashboardId.value)
    dashboard.value = analysisStore.dashboardDetail
  } catch (error) {
    ElMessage.error('加载仪表板详情失败')
    router.push('/analysis')
  }
}

const loadCharts = async () => {
  try {
    await analysisStore.fetchCharts()
    charts.value = analysisStore.charts
  } catch (error) {
    ElMessage.error('加载图表列表失败')
  }
}

const loadDashboardStats = async () => {
  try {
    // 模拟加载统计数据
    await new Promise(resolve => setTimeout(resolve, 500))
    dashboardStats.value = {
      viewCount: 156,
      uniqueUsers: 42,
      avgDuration: 3.5,
      shareCount: 8
    }
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  
  try {
    await Promise.all([
      loadDashboard(),
      loadCharts(),
      loadDashboardStats()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

const handleCopy = async () => {
  if (!dashboard.value) return

  copying.value = true
  
  try {
    await analysisStore.copyDashboard(dashboardId.value)
    ElMessage.success('仪表板复制成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('复制仪表板失败')
  } finally {
    copying.value = false
  }
}

const handleEdit = () => {
  router.push(`/analysis/dashboard/${dashboardId.value}/edit`)
}

const handleBack = () => {
  router.push('/analysis')
}

const handleFullscreen = () => {
  // 全屏预览功能
  ElMessage.info('全屏预览功能开发中')
}

const handleStatsDateChange = () => {
  // 重新加载统计数据
  loadDashboardStats()
}

const viewChartDetail = (chartId: number) => {
  router.push(`/analysis/chart/${chartId}/detail`)
}

const refreshChartData = async (chartId: number) => {
  try {
    await analysisStore.refreshChartData(chartId)
    ElMessage.success('图表数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新图表数据失败')
  }
}

// 辅助方法
const getChartTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'line': 'LineChart',
    'bar': 'Histogram',
    'pie': 'PieChart',
    'scatter': 'TrendCharts'
  }
  return iconMap[type] || 'PieChart'
}

const getChartTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'line': '折线图',
    'bar': '柱状图',
    'pie': '饼图',
    'scatter': '散点图'
  }
  return labelMap[type] || type
}

const getDatasetName = (datasetId: number) => {
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

const getLayoutTemplateLabel = (template?: string) => {
  const labelMap: Record<string, string> = {
    'single': '单列布局',
    'double': '双列布局',
    'triple': '三列布局',
    'grid': '网格布局'
  }
  return labelMap[template || 'double'] || template || '双列布局'
}

const getChartName = (chartId: number) => {
  const chart = charts.value.find(c => c.id === chartId)
  return chart?.name || '未知图表'
}

const getChartType = (chartId: number) => {
  const chart = charts.value.find(c => c.id === chartId)
  return chart?.type || 'line'
}

const getChartDatasetId = (chartId: number) => {
  const chart = charts.value.find(c => c.id === chartId)
  return chart?.datasetId || 0
}

const getChartStatus = (chartId: number) => {
  const chart = charts.value.find(c => c.id === chartId)
  return chart?.status || 'draft'
}

const getChartUpdatedAt = (chartId: number) => {
  const chart = charts.value.find(c => c.id === chartId)
  return chart?.updatedAt
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
  loadDashboard()
  loadCharts()
  loadDashboardStats()
})
</script>

<style scoped lang="scss">
.dashboard-detail-view {
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

.layout-card {
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
  
  .layout-content {
    .layout-empty {
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
    
    .layout-preview {
      .dashboard-preview {
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-lg);
        background: var(--color-bg-light);
        
        .dashboard-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border-light);
          
          h3 {
            margin: 0 0 var(--space-2) 0;
            color: var(--color-text-primary);
            font-size: var(--font-size-xl);
          }
          
          p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
          }
        }
        
        .dashboard-body {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: repeat(6, 80px);
          gap: var(--space-3);
          padding: var(--space-4);
          
          .chart-widget {
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            background: white;
            
            .widget-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: var(--space-3);
              border-bottom: 1px solid var(--color-border-light);
              
              .widget-title {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                font-weight: 600;
                color: var(--color-text-primary);
                
                .widget-icon {
                  color: var(--color-primary);
                }
              }
              
              .widget-actions {
                display: flex;
                gap: var(--space-1);
              }
            }
            
            .widget-content {
              padding: var(--space-3);
              
              .chart-preview {
                display: flex;
                align-items: center;
                gap: var(--space-3);
                margin-bottom: var(--space-3);
                
                .chart-icon {
                  font-size: 2rem;
                  color: var(--color-primary);
                }
                
                .chart-info {
                  .chart-type {
                    font-weight: 600;
                    color: var(--color-text-primary);
                  }
                  
                  .chart-dataset {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                  }
                }
              }
              
              .chart-data {
                .data-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: var(--space-2);
                  font-size: var(--font-size-sm);
                  
                  .data-label {
                    color: var(--color-text-secondary);
                  }
                  
                  .data-value {
                    color: var(--color-text-primary);
                    font-weight: 500;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.charts-card {
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
  
  .charts-content {
    .charts-empty {
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
    
    .charts-list {
      .chart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-md);
        margin-bottom: var(--space-3);
        
        .chart-main {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
          
          .chart-icon-section {
            .chart-icon {
              font-size: 2rem;
              color: var(--color-primary);
            }
          }
          
          .chart-info {
            .chart-name {
              font-size: var(--font-size-lg);
              font-weight: 600;
              color: var(--color-text-primary);
              margin-bottom: var(--space-1);
            }
            
            .chart-meta {
              display: flex;
              gap: var(--space-4);
              font-size: var(--font-size-sm);
              color: var(--color-text-secondary);
              
              .chart-type {
                font-weight: 500;
              }
              
              .chart-dataset {
                color: var(--color-text-tertiary);
              }
              
              .chart-update {
                color: var(--color-text-tertiary);
              }
            }
          }
        }
        
        .chart-actions {
          display: flex;
          gap: var(--space-2);
          margin: 0 var(--space-4);
        }
        
        .chart-status {
          min-width: 60px;
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

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-detail-view {
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
}

@media (max-width: 768px) {
  .dashboard-detail-view {
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
  
  .chart-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: var(--space-3);
    
    .chart-actions {
      margin: 0 !important;
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .dashboard-body {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto !important;
    
    .chart-widget {
      grid-area: auto !important;
    }
  }
}
</style>
       