<template>
  <div class="dashboard-edit-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><DataBoard /></el-icon>
          <div>
            <h1>编辑仪表板</h1>
            <p>修改仪表板配置和图表布局</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="danger" @click="handleDelete" :loading="deleting">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><Check /></el-icon>
            保存更改
          </el-button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content">
      <div class="content-layout">
        <!-- 左侧配置面板 -->
        <div class="config-panel">
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <h3>仪表板配置</h3>
              </div>
            </template>

            <!-- 基本信息 -->
            <div class="config-section">
              <h4>基本信息</h4>
              <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="仪表板名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入仪表板名称" />
                </el-form-item>
                <el-form-item label="仪表板描述" prop="description">
                  <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入仪表板描述"
                  />
                </el-form-item>
                <el-form-item label="布局模板">
                  <el-select v-model="form.layoutTemplate" placeholder="选择布局模板">
                    <el-option label="单列布局" value="single" />
                    <el-option label="双列布局" value="double" />
                    <el-option label="三列布局" value="triple" />
                    <el-option label="网格布局" value="grid" />
                  </el-select>
                </el-form-item>
                <el-form-item label="公开状态">
                  <el-switch
                    v-model="form.isPublic"
                    active-text="公开"
                    inactive-text="私有"
                  />
                </el-form-item>
              </el-form>
            </div>

            <!-- 图表管理 -->
            <div class="config-section">
              <h4>图表管理</h4>
              <div class="chart-management">
                <el-input
                  v-model="chartSearch"
                  placeholder="搜索图表"
                  clearable
                  @input="handleChartSearch"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                
                <div class="chart-tabs">
                  <el-tabs v-model="activeTab">
                    <el-tab-pane label="已添加" name="added">
                      <div class="chart-list">
                        <div
                          v-for="chart in addedCharts"
                          :key="chart.id"
                          class="chart-item added"
                        >
                          <div class="chart-info">
                            <div class="chart-name">{{ chart.name }}</div>
                            <div class="chart-type">{{ getChartTypeLabel(chart.type) }}</div>
                            <div class="chart-dataset">{{ getDatasetName(chart.datasetId) }}</div>
                          </div>
                          <div class="chart-actions">
                            <el-button
                              type="danger"
                              text
                              size="small"
                              @click="removeChart(chart.id)"
                            >
                              <el-icon><Close /></el-icon>
                            </el-button>
                          </div>
                        </div>
                        
                        <div v-if="addedCharts.length === 0" class="chart-empty">
                          暂无已添加的图表
                        </div>
                      </div>
                    </el-tab-pane>
                    
                    <el-tab-pane label="可添加" name="available">
                      <div class="chart-list">
                        <div
                          v-for="chart in availableCharts"
                          :key="chart.id"
                          class="chart-item available"
                          @click="addChart(chart.id)"
                        >
                          <div class="chart-info">
                            <div class="chart-name">{{ chart.name }}</div>
                            <div class="chart-type">{{ getChartTypeLabel(chart.type) }}</div>
                            <div class="chart-dataset">{{ getDatasetName(chart.datasetId) }}</div>
                          </div>
                          <div class="chart-status">
                            <el-tag :type="getStatusType(chart.status)" size="small">
                              {{ getStatusLabel(chart.status) }}
                            </el-tag>
                          </div>
                        </div>
                        
                        <div v-if="availableCharts.length === 0" class="chart-empty">
                          暂无可用图表
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>
            </div>

            <!-- 布局配置 -->
            <div class="config-section" v-if="addedCharts.length > 0">
              <h4>布局配置</h4>
              <div class="layout-editor">
                <div class="layout-grid">
                  <div
                    v-for="(layoutItem, index) in form.config.layout"
                    :key="layoutItem.chartId"
                    class="layout-item"
                    :style="{
                      gridArea: `${layoutItem.position.y + 1} / ${layoutItem.position.x + 1} / span ${layoutItem.position.h} / span ${layoutItem.position.w}`
                    }"
                  >
                    <div class="layout-item-content">
                      <div class="item-header">
                        <span class="item-title">{{ getChartName(layoutItem.chartId) }}</span>
                        <el-button
                          type="text"
                          size="small"
                          @click="removeChart(layoutItem.chartId)"
                        >
                          <el-icon><Close /></el-icon>
                        </el-button>
                      </div>
                      <div class="item-body">
                        <el-icon class="item-icon">
                          <component :is="getChartTypeIcon(getChartType(layoutItem.chartId))" />
                        </el-icon>
                        <div class="item-info">
                          <div>{{ getChartTypeLabel(getChartType(layoutItem.chartId)) }}</div>
                          <div class="item-dataset">{{ getDatasetName(getChartDatasetId(layoutItem.chartId)) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="layout-controls">
                  <el-button @click="autoLayout" type="text" size="small">
                    <el-icon><Magic /></el-icon>
                    自动布局
                  </el-button>
                  <el-button @click="resetLayout" type="text" size="small">
                    <el-icon><Refresh /></el-icon>
                    重置布局
                  </el-button>
                  <el-button @click="clearAllCharts" type="text" size="small">
                    <el-icon><Delete /></el-icon>
                    清空所有
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 样式配置 -->
            <div class="config-section">
              <h4>样式配置</h4>
              <el-form :model="form.config" label-width="80px">
                <el-form-item label="背景颜色">
                  <el-color-picker v-model="form.config.backgroundColor" />
                </el-form-item>
                <el-form-item label="标题颜色">
                  <el-color-picker v-model="form.config.titleColor" />
                </el-form-item>
                <el-form-item label="边框样式">
                  <el-select v-model="form.config.borderStyle" placeholder="选择边框样式">
                    <el-option label="无边框" value="none" />
                    <el-option label="实线边框" value="solid" />
                    <el-option label="虚线边框" value="dashed" />
                  </el-select>
                </el-form-item>
                <el-form-item label="间距">
                  <el-input-number
                    v-model="form.config.spacing"
                    :min="0"
                    :max="50"
                    controls-position="right"
                  />
                  <span class="unit">px</span>
                </el-form-item>
              </el-form>
            </div>
          </el-card>
        </div>

        <!-- 右侧预览区域 -->
        <div class="preview-panel">
          <el-card class="preview-card">
            <template #header>
              <div class="card-header">
                <h3>仪表板预览</h3>
                <div class="preview-actions">
                  <el-button
                    type="primary"
                    text
                    @click="handleCopy"
                    :loading="copying"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    复制仪表板
                  </el-button>
                  <el-button
                    type="primary"
                    text
                    @click="handlePreview"
                    :loading="previewLoading"
                  >
                    <el-icon><Refresh /></el-icon>
                    刷新预览
                  </el-button>
                </div>
              </div>
            </template>

            <!-- 预览内容 -->
            <div class="preview-content">
              <div v-if="addedCharts.length === 0" class="preview-empty">
                <el-icon class="empty-icon"><DataBoard /></el-icon>
                <p>请先添加图表到仪表板</p>
              </div>
              
              <div v-else-if="previewLoading" class="preview-loading">
                <el-skeleton :rows="8" animated />
              </div>
              
              <div v-else class="preview-dashboard">
                <div class="dashboard-header">
                  <h3>{{ form.name || '仪表板预览' }}</h3>
                  <p v-if="form.description">{{ form.description }}</p>
                </div>
                
                <div class="dashboard-body">
                  <div
                    v-for="layoutItem in form.config.layout"
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
                        <el-button type="text" size="small">
                          <el-icon><FullScreen /></el-icon>
                        </el-button>
                        <el-button type="text" size="small">
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

            <!-- 预览信息 -->
            <div v-if="addedCharts.length > 0" class="preview-info">
              <div class="info-item">
                <span class="label">图表数量:</span>
                <span class="value">{{ addedCharts.length }} 个</span>
              </div>
              <div class="info-item">
                <span class="label">布局模板:</span>
                <span class="value">{{ getLayoutTemplateLabel(form.layoutTemplate) }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态:</span>
                <span class="value success">预览就绪</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
      :before-close="handleDeleteCancel"
    >
      <div class="delete-dialog">
        <el-icon class="dialog-icon"><Warning /></el-icon>
        <div class="dialog-content">
          <h4>确定要删除这个仪表板吗？</h4>
          <p>此操作将永久删除仪表板及其所有配置，且无法恢复。</p>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDeleteCancel">取消</el-button>
          <el-button type="danger" @click="confirmDelete" :loading="deleting">
            确认删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  DataBoard,
  Check,
  Close,
  Delete,
  Refresh,
  Search,
  Magic,
  FullScreen,
  CopyDocument,
  Warning
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import { useDatasetStore } from '@/store/dataset'
import type { AnalysisChart, AnalysisDashboard, DashboardConfig } from '@/types/analysis'
import type { Dataset } from '@/types/dataset'

const router = useRouter()
const route = useRoute()
const analysisStore = useAnalysisStore()
const datasetStore = useDatasetStore()

// 表单引用
const formRef = ref<FormInstance>()

// 响应式数据
const saving = ref(false)
const deleting = ref(false)
const copying = ref(false)
const previewLoading = ref(false)
const chartSearch = ref('')
const activeTab = ref('added')
const deleteDialogVisible = ref(false)

// 仪表板ID
const dashboardId = computed(() => parseInt(route.params.id as string))

// 表单数据
const form = reactive({
  name: '',
  description: '',
  layoutTemplate: 'double',
  isPublic: false,
  config: {
    layout: [],
    backgroundColor: '#ffffff',
    titleColor: '#303133',
    borderStyle: 'solid',
    spacing: 16
  } as DashboardConfig
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入仪表板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 图表数据
const charts = ref<AnalysisChart[]>([])
const dashboard = ref<AnalysisDashboard | null>(null)

// 计算属性
const addedChartIds = computed(() => {
  return form.config.layout.map(item => item.chartId)
})

const addedCharts = computed(() => {
  return charts.value.filter(chart => addedChartIds.value.includes(chart.id))
})

const availableCharts = computed(() => {
  return charts.value.filter(chart => !addedChartIds.value.includes(chart.id))
})

const filteredCharts = computed(() => {
  if (!chartSearch.value) {
    return activeTab.value === 'added' ? addedCharts.value : availableCharts.value
  }
  
  const searchTerm = chartSearch.value.toLowerCase()
  const targetCharts = activeTab.value === 'added' ? addedCharts.value : availableCharts.value
  
  return targetCharts.filter(chart =>
    chart.name.toLowerCase().includes(searchTerm) ||
    chart.type.toLowerCase().includes(searchTerm) ||
    getDatasetName(chart.datasetId).toLowerCase().includes(searchTerm)
  )
})

// 方法
const loadDashboard = async () => {
  try {
    await analysisStore.fetchDashboardDetail(dashboardId.value)
    const dashboardData = analysisStore.dashboardDetail
    
    if (dashboardData) {
      dashboard.value = dashboardData
      
      // 填充表单数据
      form.name = dashboardData.name
      form.description = dashboardData.description || ''
      form.layoutTemplate = dashboardData.layoutTemplate || 'double'
      form.isPublic = dashboardData.isPublic || false
      form.config = { ...dashboardData.config }
    }
  } catch (error) {
    ElMessage.error('加载仪表板详情失败')
    router.push('/analysis')
  }
}

const loadCharts = async () => {
  try {
    await analysisStore.fetchCharts()
    charts.value = analysisStore.charts.filter(chart => chart.status === 'active')
  } catch (error) {
    ElMessage.error('加载图表列表失败')
  }
}

const handleChartSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const addChart = (chartId: number) => {
  if (!addedChartIds.value.includes(chartId)) {
    form.config.layout.push({
      chartId,
      position: { x: 0, y: 0, w: 6, h: 4 }
    })
    ElMessage.success('图表已添加到仪表板')
  }
}

const removeChart = (chartId: number) => {
  const index = form.config.layout.findIndex(item => item.chartId === chartId)
  if (index > -1) {
    form.config.layout.splice(index, 1)
    ElMessage.success('图表已从仪表板移除')
  }
}

const autoLayout = () => {
  // 自动布局逻辑
  ElMessage.info('自动布局功能开发中')
}

const resetLayout = () => {
  form.config.layout.forEach((item, index) => {
    item.position = { x: index % 2, y: Math.floor(index / 2), w: 6, h: 4 }
  })
  ElMessage.success('布局已重置')
}

const clearAllCharts = () => {
  form.config.layout = []
  ElMessage.success('所有图表已清空')
}

const handlePreview = async () => {
  if (addedCharts.value.length === 0) {
    ElMessage.warning('请先添加图表到仪表板')
    return
  }

  previewLoading.value = true
  
  try {
    // 模拟预览加载
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('预览刷新完成')
  } catch (error) {
    ElMessage.error('预览刷新失败')
  } finally {
    previewLoading.value = false
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

const handleSave = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    if (addedCharts.value.length === 0) {
      ElMessage.warning('请至少添加一个图表到仪表板')
      return
    }

    saving.value = true
    
    const dashboardData = {
      name: form.name,
      description: form.description,
      layoutTemplate: form.layoutTemplate,
      isPublic: form.isPublic,
      config: form.config
    }

    await analysisStore.updateDashboard(dashboardId.value, dashboardData)
    ElMessage.success('仪表板更新成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('更新仪表板失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = () => {
  deleteDialogVisible.value = true
}

const handleDeleteCancel = () => {
  deleteDialogVisible.value = false
}

const confirmDelete = async () => {
  deleting.value = true
  
  try {
    await analysisStore.deleteDashboard(dashboardId.value)
    ElMessage.success('仪表板删除成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('删除仪表板失败')
  } finally {
    deleting.value = false
    deleteDialogVisible.value = false
  }
}

const handleCancel = () => {
  router.push('/analysis')
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

const getLayoutTemplateLabel = (template: string) => {
  const labelMap: Record<string, string> = {
    'single': '单列布局',
    'double': '双列布局',
    'triple': '三列布局',
    'grid': '网格布局'
  }
  return labelMap[template] || template
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
  return date.toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadDashboard()
  loadCharts()
})
</script>

<style scoped lang="scss">
.dashboard-edit-view {
  padding: var(--space-6);
  max-width: 1600px;
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
  .content-layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: var(--space-6);
    height: calc(100vh - 200px);
  }
  
  .config-panel {
    .config-card {
      height: 100%;
      
      :deep(.el-card__header) {
        padding: var(--space-4) var(--space-5);
        border-bottom: 1px solid var(--color-border-light);
        
        .card-header {
          h3 {
            margin: 0;
            font-size: var(--font-size-lg);
            font-weight: 600;
          }
        }
      }
      
      :deep(.el-card__body) {
        padding: var(--space-5);
        height: calc(100% - 60px);
        overflow-y: auto;
      }
    }
    
    .config-section {
      margin-bottom: var(--space-6);
      
      h4 {
        font-size: var(--font-size-base);
        color: var(--color-text-primary);
        margin-bottom: var(--space-4);
        font-weight: 600;
        padding-bottom: var(--space-2);
        border-bottom: 1px solid var(--color-border-light);
      }
      
      .chart-management {
        .chart-tabs {
          margin-top: var(--space-3);
          
          :deep(.el-tabs__content) {
            max-height: 300px;
            overflow-y: auto;
          }
        }
        
        .chart-list {
          .chart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-3);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            margin-bottom: var(--space-2);
            
            &.added {
              background: var(--color-bg-light);
              
              .chart-info {
                .chart-name {
                  color: var(--color-text-primary);
                }
              }
            }
            
            &.available {
              cursor: pointer;
              transition: all 0.3s ease;
              
              &:hover {
                border-color: var(--color-primary-light);
                background: var(--color-primary-light);
              }
            }
            
            .chart-info {
              .chart-name {
                font-weight: 600;
                margin-bottom: var(--space-1);
              }
              
              .chart-type {
                font-size: var(--font-size-sm);
                color: var(--color-text-secondary);
                margin-bottom: var(--space-1);
              }
              
              .chart-dataset {
                font-size: var(--font-size-xs);
                color: var(--color-text-tertiary);
              }
            }
            
            .chart-actions {
              display: flex;
              gap: var(--space-1);
            }
          }
          
          .chart-empty {
            text-align: center;
            color: var(--color-text-tertiary);
            padding: var(--space-8) 0;
          }
        }
      }
      
      .layout-editor {
        .layout-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: repeat(6, 60px);
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          padding: var(--space-2);
          background: var(--color-bg-light);
          
          .layout-item {
            border: 2px solid var(--color-primary);
            border-radius: var(--border-radius-md);
            background: var(--color-primary-light);
            
            .layout-item-content {
              padding: var(--space-2);
              height: 100%;
              
              .item-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--space-2);
                
                .item-title {
                  font-size: var(--font-size-xs);
                  font-weight: 600;
                  color: var(--color-text-primary);
                }
              }
              
              .item-body {
                display: flex;
                align-items: center;
                gap: var(--space-1);
                
                .item-icon {
                  font-size: 1rem;
                  color: var(--color-primary);
                }
                
                .item-info {
                  font-size: var(--font-size-xs);
                  color: var(--color-text-secondary);
                  
                  .item-dataset {
                    color: var(--color-text-tertiary);
                  }
                }
              }
            }
          }
        }
        
        .layout-controls {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-2);
        }
      }
      
      .unit {
        margin-left: var(--space-2);
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
      }
    }
  }
  
  .preview-panel {
    .preview-card {
      height: 100%;
      
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
          
          .preview-actions {
            display: flex;
            gap: var(--space-2);
          }
        }
      }
      
      :deep(.el-card__body) {
        padding: var(--space-5);
        height: calc(100% - 60px);
        display: flex;
        flex-direction: column;
      }
    }
    
    .preview-content {
      flex: 1;
      
      .preview-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--color-text-tertiary);
        
        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-3);
        }
        
        p {
          margin: 0;
        }
      }
      
      .preview-loading {
        height: 100%;
      }
      
      .preview-dashboard {
        height: 100%;
        
        .dashboard-header {
          margin-bottom: var(--space-4);
          
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
          grid-template-rows: repeat(6, 1fr);
          gap: var(--space-3);
          height: calc(100% - 80px);
          overflow-y: auto;
          
          .chart-widget {
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-lg);
            background: var(--color-bg-light);
            
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
    
    .preview-info {
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--color-border-light);
      
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--space-2);
        font-size: var(--font-size-sm);
        
        .label {
          color: var(--color-text-secondary);
        }
        
        .value {
          color: var(--color-text-primary);
          font-weight: 500;
          
          &.success {
            color: var(--color-success);
          }
        }
      }
    }
  }
}

.delete-dialog {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  
  .dialog-icon {
    font-size: 2.5rem;
    color: var(--color-warning);
    margin-top: var(--space-1);
  }
  
  .dialog-content {
    h4 {
      margin: 0 0 var(--space-2) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-lg);
    }
    
    p {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .page-content .content-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .config-panel {
    order: 2;
  }
  
  .preview-panel {
    order: 1;
    height: 600px;
  }
}

@media (max-width: 768px) {
  .dashboard-edit-view {
    padding: var(--space-4);
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: var(--space-4);
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
  
  .layout-editor .layout-grid {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(12, 30px);
  }
  
  .preview-dashboard .dashboard-body {
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(12, 1fr);
  }
}
</style>