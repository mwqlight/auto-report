<template>
  <div class="dashboard-create-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><DataBoard /></el-icon>
          <div>
            <h1>创建仪表板</h1>
            <p>组合多个图表创建可视化仪表板</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><Check /></el-icon>
            保存仪表板
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

            <!-- 图表选择 -->
            <div class="config-section">
              <h4>添加图表</h4>
              <div class="chart-selection">
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
                
                <div class="chart-list">
                  <div
                    v-for="chart in filteredCharts"
                    :key="chart.id"
                    :class="['chart-item', { selected: selectedChartIds.includes(chart.id) }]"
                    @click="toggleChartSelection(chart.id)"
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
                  
                  <div v-if="filteredCharts.length === 0" class="chart-empty">
                    暂无可用图表
                  </div>
                </div>
              </div>
            </div>

            <!-- 布局配置 -->
            <div class="config-section" v-if="selectedCharts.length > 0">
              <h4>布局配置</h4>
              <div class="layout-preview">
                <div
                  v-for="(chart, index) in selectedCharts"
                  :key="chart.id"
                  class="layout-item"
                  :style="{ gridArea: `item${index + 1}` }"
                >
                  <div class="layout-item-content">
                    <div class="item-header">
                      <span class="item-title">{{ chart.name }}</span>
                      <el-button
                        type="danger"
                        text
                        size="small"
                        @click="removeChartFromLayout(chart.id)"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                    <div class="item-body">
                      <el-icon class="item-icon">
                        <component :is="getChartTypeIcon(chart.type)" />
                      </el-icon>
                      <div class="item-info">
                        <div>{{ getChartTypeLabel(chart.type) }}</div>
                        <div class="item-dataset">{{ getDatasetName(chart.datasetId) }}</div>
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
                <el-button @click="clearLayout" type="text" size="small">
                  <el-icon><Delete /></el-icon>
                  清空布局
                </el-button>
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
            </template>

            <!-- 预览内容 -->
            <div class="preview-content">
              <div v-if="selectedCharts.length === 0" class="preview-empty">
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
                    v-for="chart in selectedCharts"
                    :key="chart.id"
                    class="chart-widget"
                  >
                    <div class="widget-header">
                      <div class="widget-title">
                        <el-icon class="widget-icon">
                          <component :is="getChartTypeIcon(chart.type)" />
                        </el-icon>
                        <span>{{ chart.name }}</span>
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
                          <component :is="getChartTypeIcon(chart.type)" />
                        </el-icon>
                        <div class="chart-info">
                          <div class="chart-type">{{ getChartTypeLabel(chart.type) }}</div>
                          <div class="chart-dataset">{{ getDatasetName(chart.datasetId) }}</div>
                        </div>
                      </div>
                      <div class="chart-data">
                        <div class="data-item">
                          <span class="data-label">状态:</span>
                          <el-tag :type="getStatusType(chart.status)" size="small">
                            {{ getStatusLabel(chart.status) }}
                          </el-tag>
                        </div>
                        <div class="data-item">
                          <span class="data-label">最后更新:</span>
                          <span class="data-value">{{ formatTime(chart.updatedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 预览信息 -->
            <div v-if="selectedCharts.length > 0" class="preview-info">
              <div class="info-item">
                <span class="label">图表数量:</span>
                <span class="value">{{ selectedCharts.length }} 个</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  DataBoard,
  Check,
  Close,
  Delete,
  Refresh,
  Search,
  Magic,
  FullScreen
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import { useDatasetStore } from '@/store/dataset'
import type { AnalysisChart, DashboardConfig } from '@/types/analysis'
import type { Dataset } from '@/types/dataset'

const router = useRouter()
const analysisStore = useAnalysisStore()
const datasetStore = useDatasetStore()

// 表单引用
const formRef = ref<FormInstance>()

// 响应式数据
const saving = ref(false)
const previewLoading = ref(false)
const chartSearch = ref('')

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
const selectedChartIds = ref<number[]>([])

// 计算属性
const filteredCharts = computed(() => {
  if (!chartSearch.value) {
    return charts.value
  }
  
  const searchTerm = chartSearch.value.toLowerCase()
  return charts.value.filter(chart =>
    chart.name.toLowerCase().includes(searchTerm) ||
    chart.type.toLowerCase().includes(searchTerm) ||
    getDatasetName(chart.datasetId).toLowerCase().includes(searchTerm)
  )
})

const selectedCharts = computed(() => {
  return charts.value.filter(chart => selectedChartIds.value.includes(chart.id))
})

// 方法
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

const toggleChartSelection = (chartId: number) => {
  const index = selectedChartIds.value.indexOf(chartId)
  if (index > -1) {
    selectedChartIds.value.splice(index, 1)
  } else {
    selectedChartIds.value.push(chartId)
  }
}

const removeChartFromLayout = (chartId: number) => {
  const index = selectedChartIds.value.indexOf(chartId)
  if (index > -1) {
    selectedChartIds.value.splice(index, 1)
  }
}

const autoLayout = () => {
  // 自动布局逻辑
  ElMessage.info('自动布局功能开发中')
}

const clearLayout = () => {
  selectedChartIds.value = []
}

const handlePreview = async () => {
  if (selectedCharts.value.length === 0) {
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

const handleSave = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    if (selectedCharts.value.length === 0) {
      ElMessage.warning('请至少添加一个图表到仪表板')
      return
    }

    saving.value = true
    
    const dashboardData = {
      name: form.name,
      description: form.description,
      layoutTemplate: form.layoutTemplate,
      isPublic: form.isPublic,
      config: {
        ...form.config,
        layout: selectedCharts.value.map(chart => ({
          chartId: chart.id,
          position: { x: 0, y: 0, w: 6, h: 4 }
        }))
      }
    }

    await analysisStore.createDashboard(dashboardData)
    ElMessage.success('仪表板创建成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('创建仪表板失败')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/analysis')
}

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

const formatTime = (time?: string | Date) => {
  if (!time) return '未知'
  const date = typeof time === 'string' ? new Date(time) : time
  return date.toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadCharts()
})
</script>

<style scoped lang="scss">
.dashboard-create-view {
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
      
      .chart-selection {
        .chart-list {
          margin-top: var(--space-3);
          max-height: 300px;
          overflow-y: auto;
          
          .chart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--space-3);
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-md);
            margin-bottom: var(--space-2);
            cursor: pointer;
            transition: all 0.3s ease;
            
            &.selected {
              border-color: var(--color-primary);
              background: var(--color-primary-light);
            }
            
            &:hover:not(.selected) {
              border-color: var(--color-primary-light);
            }
            
            .chart-info {
              .chart-name {
                font-weight: 600;
                color: var(--color-text-primary);
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
          }
          
          .chart-empty {
            text-align: center;
            color: var(--color-text-tertiary);
            padding: var(--space-8) 0;
          }
        }
      }
      
      .layout-preview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: repeat(3, 80px);
        grid-template-areas:
          "item1 item2"
          "item3 item4"
          "item5 item6";
        gap: var(--space-3);
        margin-bottom: var(--space-3);
        
        .layout-item {
          border: 2px dashed var(--color-border);
          border-radius: var(--border-radius-md);
          
          .layout-item-content {
            padding: var(--space-2);
            height: 100%;
            
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: var(--space-2);
              
              .item-title {
                font-size: var(--font-size-sm);
                font-weight: 600;
                color: var(--color-text-primary);
              }
            }
            
            .item-body {
              display: flex;
              align-items: center;
              gap: var(--space-2);
              
              .item-icon {
                font-size: 1.2rem;
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
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
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
</style>