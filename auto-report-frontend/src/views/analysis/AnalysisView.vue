<template>
  <div class="analysis-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><DataBoard /></el-icon>
          <div>
            <h1>可视化分析</h1>
            <p>通过图表和仪表板进行数据可视化分析</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleCreateChart">
            <el-icon><Plus /></el-icon>
            新建图表
          </el-button>
          <el-button @click="handleCreateDashboard">
            <el-icon><Grid /></el-icon>
            新建仪表板
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图表或仪表板..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
          style="width: 300px;"
        />
        <el-select v-model="filterType" placeholder="类型筛选" clearable @change="handleFilterChange">
          <el-option label="图表" value="chart" />
          <el-option label="仪表板" value="dashboard" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="handleFilterChange">
          <el-option label="活跃" value="active" />
          <el-option label="错误" value="error" />
        </el-select>
      </div>
      <div class="filter-right">
        <el-switch
          v-model="showPublicOnly"
          active-text="仅显示公开"
          @change="handleFilterChange"
        />
        <el-button-group>
          <el-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode = 'grid'">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode = 'list'">
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!hasData" class="empty-state">
        <el-icon class="empty-icon"><DataAnalysis /></el-icon>
        <h3>暂无可视化内容</h3>
        <p>创建您的第一个图表或仪表板开始数据分析</p>
        <div class="empty-actions">
          <el-button type="primary" @click="handleCreateChart">
            <el-icon><Plus /></el-icon>
            新建图表
          </el-button>
          <el-button @click="handleCreateDashboard">
            <el-icon><Grid /></el-icon>
            新建仪表板
          </el-button>
        </div>
      </div>

      <!-- 数据展示 -->
      <div v-else class="content-grid">
        <!-- 图表区域 -->
        <div class="section">
          <div class="section-header">
            <h3>我的图表</h3>
            <el-button type="text" @click="handleViewAllCharts">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div :class="['chart-grid', viewMode]">
            <div
              v-for="chart in displayedCharts"
              :key="chart.id"
              class="chart-card"
              @click="handleChartClick(chart)"
            >
              <div class="chart-header">
                <div class="chart-type">
                  <el-icon><PieChart /></el-icon>
                  <span>{{ getChartTypeLabel(chart.type) }}</span>
                </div>
                <div class="chart-status" :class="chart.status">
                  {{ getStatusText(chart.status) }}
                </div>
              </div>
              <div class="chart-content">
                <h4 class="chart-title">{{ chart.name }}</h4>
                <p class="chart-desc">{{ chart.description || '暂无描述' }}</p>
                <div class="chart-meta">
                  <span class="dataset">{{ chart.datasetName }}</span>
                  <span class="views">
                    <el-icon><View /></el-icon>
                    {{ chart.viewCount }}
                  </span>
                </div>
              </div>
              <div class="chart-actions">
                <el-button type="text" size="small" @click.stop="handlePreviewChart(chart)">
                  预览
                </el-button>
                <el-button type="text" size="small" @click.stop="handleEditChart(chart)">
                  编辑
                </el-button>
                <el-dropdown @click.stop>
                  <el-button type="text" size="small">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleCopyChart(chart)">复制</el-dropdown-item>
                      <el-dropdown-item @click="handleExportChart(chart)">导出</el-dropdown-item>
                      <el-dropdown-item divided @click="handleDeleteChart(chart)" style="color: var(--color-danger);">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- 仪表板区域 -->
        <div class="section">
          <div class="section-header">
            <h3>我的仪表板</h3>
            <el-button type="text" @click="handleViewAllDashboards">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div :class="['dashboard-grid', viewMode]">
            <div
              v-for="dashboard in displayedDashboards"
              :key="dashboard.id"
              class="dashboard-card"
              @click="handleDashboardClick(dashboard)"
            >
              <div class="dashboard-thumbnail">
                <el-icon class="thumbnail-icon"><Grid /></el-icon>
                <div class="chart-count">
                  {{ dashboard.charts.length }} 个图表
                </div>
              </div>
              <div class="dashboard-content">
                <h4 class="dashboard-title">{{ dashboard.name }}</h4>
                <p class="dashboard-desc">{{ dashboard.description || '暂无描述' }}</p>
                <div class="dashboard-meta">
                  <span class="views">
                    <el-icon><View /></el-icon>
                    {{ dashboard.viewCount }}
                  </span>
                  <span class="favorites">
                    <el-icon><Star /></el-icon>
                    {{ dashboard.favoriteCount }}
                  </span>
                </div>
              </div>
              <div class="dashboard-actions">
                <el-button type="text" size="small" @click.stop="handleViewDashboard(dashboard)">
                  查看
                </el-button>
                <el-button type="text" size="small" @click.stop="handleEditDashboard(dashboard)">
                  编辑
                </el-button>
                <el-dropdown @click.stop>
                  <el-button type="text" size="small">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleCopyDashboard(dashboard)">复制</el-dropdown-item>
                      <el-dropdown-item divided @click="handleDeleteDashboard(dashboard)" style="color: var(--color-danger);">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="hasData" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalItems"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DataBoard,
  Plus,
  Grid,
  Refresh,
  Search,
  List,
  DataAnalysis,
  PieChart,
  View,
  More,
  ArrowRight,
  Star
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import type { AnalysisChart, AnalysisDashboard } from '@/types/analysis'

const router = useRouter()
const analysisStore = useAnalysisStore()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showPublicOnly = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const hasData = computed(() => {
  return analysisStore.charts.length > 0 || analysisStore.dashboards.length > 0
})

const displayedCharts = computed(() => {
  let charts = analysisStore.charts
  
  if (searchKeyword.value) {
    charts = charts.filter(chart => 
      chart.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      chart.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (filterStatus.value) {
    charts = charts.filter(chart => chart.status === filterStatus.value)
  }
  
  if (showPublicOnly.value) {
    charts = charts.filter(chart => chart.isPublic)
  }
  
  return charts.slice(0, 6) // 只显示前6个
})

const displayedDashboards = computed(() => {
  let dashboards = analysisStore.dashboards
  
  if (searchKeyword.value) {
    dashboards = dashboards.filter(dashboard => 
      dashboard.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      dashboard.description?.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (showPublicOnly.value) {
    dashboards = dashboards.filter(dashboard => dashboard.isPublic)
  }
  
  return dashboards.slice(0, 6) // 只显示前6个
})

const totalItems = computed(() => {
  return displayedCharts.value.length + displayedDashboards.value.length
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      analysisStore.fetchCharts(),
      analysisStore.fetchDashboards()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  // 搜索逻辑已包含在计算属性中
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleRefresh = () => {
  loadData()
}

const handleCreateChart = () => {
  router.push('/analysis/chart/create')
}

const handleCreateDashboard = () => {
  router.push('/analysis/dashboard/create')
}

const handleChartClick = (chart: AnalysisChart) => {
  router.push(`/analysis/chart/${chart.id}/detail`)
}

const handleDashboardClick = (dashboard: AnalysisDashboard) => {
  router.push(`/analysis/dashboard/${dashboard.id}/detail`)
}

const handlePreviewChart = (chart: AnalysisChart) => {
  // 实现预览逻辑
  ElMessage.info(`预览图表: ${chart.name}`)
}

const handleEditChart = (chart: AnalysisChart) => {
  router.push(`/analysis/chart/${chart.id}/edit`)
}

const handleCopyChart = async (chart: AnalysisChart) => {
  try {
    await analysisStore.copyChart(chart.id)
    ElMessage.success('图表复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleExportChart = (chart: AnalysisChart) => {
  ElMessage.info(`导出图表: ${chart.name}`)
}

const handleDeleteChart = async (chart: AnalysisChart) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除图表 "${chart.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await analysisStore.deleteChart(chart.id)
    ElMessage.success('图表删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleViewDashboard = (dashboard: AnalysisDashboard) => {
  router.push(`/analysis/dashboard/${dashboard.id}/view`)
}

const handleEditDashboard = (dashboard: AnalysisDashboard) => {
  router.push(`/analysis/dashboard/${dashboard.id}/edit`)
}

const handleCopyDashboard = async (dashboard: AnalysisDashboard) => {
  try {
    await analysisStore.copyDashboard(dashboard.id)
    ElMessage.success('仪表板复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleDeleteDashboard = async (dashboard: AnalysisDashboard) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除仪表板 "${dashboard.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await analysisStore.deleteDashboard(dashboard.id)
    ElMessage.success('仪表板删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleViewAllCharts = () => {
  router.push('/analysis/charts')
}

const handleViewAllDashboards = () => {
  router.push('/analysis/dashboards')
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadData()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadData()
}

const getChartTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'line': '折线图',
    'bar': '柱状图',
    'pie': '饼图',
    'scatter': '散点图',
    'area': '面积图',
    'radar': '雷达图',
    'heatmap': '热力图',
    'funnel': '漏斗图'
  }
  return typeMap[type] || type
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '活跃',
    'inactive': '未激活',
    'error': '错误'
  }
  return statusMap[status] || status
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.analysis-view {
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

.filter-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  
  .filter-left {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }
  
  .filter-right {
    display: flex;
    gap: var(--space-4);
    align-items: center;
  }
}

.page-content {
  .loading-container {
    padding: var(--space-8);
  }
  
  .empty-state {
    text-align: center;
    padding: var(--space-16) var(--space-8);
    color: var(--color-text-tertiary);
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--space-4);
      color: var(--color-border);
    }
    
    h3 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--space-3);
      color: var(--color-text-secondary);
    }
    
    p {
      margin-bottom: var(--space-6);
      font-size: var(--font-size-base);
    }
    
    .empty-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
    }
  }
  
  .content-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }
  
  .section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-5);
      
      h3 {
        font-size: var(--font-size-xl);
        color: var(--color-text-primary);
        font-weight: 600;
        margin: 0;
      }
    }
    
    .chart-grid,
    .dashboard-grid {
      display: grid;
      gap: var(--space-5);
      
      &.grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      }
      
      &.list {
        grid-template-columns: 1fr;
      }
    }
    
    .chart-card,
    .dashboard-card {
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-lg);
      padding: var(--space-5);
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: var(--color-primary);
      }
      
      .chart-header,
      .dashboard-thumbnail {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-4);
        
        .chart-type {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }
        
        .chart-status {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--border-radius-full);
          font-size: var(--font-size-xs);
          font-weight: 500;
          
          &.active {
            background: var(--color-success-light);
            color: var(--color-success);
          }
          
          &.error {
            background: var(--color-danger-light);
            color: var(--color-danger);
          }
          
          &.inactive {
            background: var(--color-warning-light);
            color: var(--color-warning);
          }
        }
        
        .thumbnail-icon {
          font-size: 2rem;
          color: var(--color-primary);
        }
        
        .chart-count {
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }
      }
      
      .chart-content,
      .dashboard-content {
        .chart-title,
        .dashboard-title {
          font-size: var(--font-size-lg);
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
          font-weight: 600;
          line-height: 1.4;
        }
        
        .chart-desc,
        .dashboard-desc {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          line-height: 1.5;
          margin-bottom: var(--space-4);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .chart-meta,
        .dashboard-meta {
          display: flex;
          gap: var(--space-4);
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          
          .dataset {
            background: var(--color-bg-tertiary);
            padding: var(--space-1) var(--space-2);
            border-radius: var(--border-radius-sm);
          }
          
          .views,
          .favorites {
            display: flex;
            align-items: center;
            gap: var(--space-1);
          }
        }
      }
      
      .chart-actions,
      .dashboard-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-2);
        margin-top: var(--space-4);
        padding-top: var(--space-4);
        border-top: 1px solid var(--color-border-light);
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-border-light);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .analysis-view {
    padding: var(--space-4);
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: var(--space-4);
    
    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
  
  .filter-toolbar {
    flex-direction: column;
    gap: var(--space-4);
    
    .filter-left,
    .filter-right {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .chart-grid.grid,
  .dashboard-grid.grid {
    grid-template-columns: 1fr;
  }
}
</style>