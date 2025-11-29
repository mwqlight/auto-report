<template>
  <div class="chart-edit-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><PieChart /></el-icon>
          <div>
            <h1>编辑图表</h1>
            <p>修改图表配置和样式</p>
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
            保存修改
          </el-button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <div v-else-if="!chart" class="error-container">
        <el-result icon="error" title="图表不存在" sub-title="请检查图表ID是否正确">
          <template #extra>
            <el-button type="primary" @click="router.push('/analysis')">返回列表</el-button>
          </template>
        </el-result>
      </div>

      <div v-else class="content-layout">
        <!-- 左侧配置面板 -->
        <div class="config-panel">
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <h3>图表配置</h3>
                <div class="chart-status">
                  <el-tag :type="getStatusType(chart.status)" size="small">
                    {{ getStatusLabel(chart.status) }}
                  </el-tag>
                </div>
              </div>
            </template>

            <!-- 基本信息 -->
            <div class="config-section">
              <h4>基本信息</h4>
              <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="图表名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入图表名称" />
                </el-form-item>
                <el-form-item label="图表描述" prop="description">
                  <el-input
                    v-model="form.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入图表描述"
                  />
                </el-form-item>
                <el-form-item label="数据集" prop="datasetId">
                  <el-select
                    v-model="form.datasetId"
                    placeholder="请选择数据集"
                    filterable
                    @change="handleDatasetChange"
                    :disabled="!canChangeDataset"
                  >
                    <el-option
                      v-for="dataset in datasets"
                      :key="dataset.id"
                      :label="dataset.name"
                      :value="dataset.id"
                    />
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

            <!-- 图表类型 -->
            <div class="config-section">
              <h4>图表类型</h4>
              <div class="current-type">
                <el-icon class="type-icon">
                  <component :is="getChartTypeIcon(form.type)" />
                </el-icon>
                <div class="type-info">
                  <div class="type-name">{{ getChartTypeLabel(form.type) }}</div>
                  <div class="type-desc">{{ getChartTypeDescription(form.type) }}</div>
                </div>
              </div>
              <div class="type-change-tip" v-if="!canChangeType">
                <el-alert
                  title="图表类型不可更改"
                  type="warning"
                  :closable="false"
                  show-icon
                  description="创建后图表类型不可更改，如需更改类型请创建新图表"
                />
              </div>
            </div>

            <!-- 数据配置 -->
            <div v-if="form.datasetId && form.type" class="config-section">
              <h4>数据配置</h4>
              
              <!-- 维度配置 -->
              <div class="field-config">
                <div class="field-label">维度字段</div>
                <el-select
                  v-model="form.config.xAxis.field"
                  placeholder="选择X轴字段"
                  clearable
                  @change="handleFieldChange"
                >
                  <el-option-group
                    v-for="group in fieldGroups"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="field in group.fields"
                      :key="field.name"
                      :label="field.label || field.name"
                      :value="field.name"
                    />
                  </el-option-group>
                </el-select>
              </div>

              <!-- 度量配置 -->
              <div class="field-config">
                <div class="field-label">度量字段</div>
                <el-select
                  v-model="form.config.yAxis.field"
                  placeholder="选择Y轴字段"
                  clearable
                  @change="handleFieldChange"
                >
                  <el-option-group
                    v-for="group in fieldGroups"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="field in group.fields"
                      :key="field.name"
                      :label="field.label || field.name"
                      :value="field.name"
                    />
                  </el-option-group>
                </el-select>
              </div>

              <!-- 聚合方式 -->
              <div class="field-config" v-if="form.config.yAxis.field">
                <div class="field-label">聚合方式</div>
                <el-select v-model="form.config.aggregations[0].type" placeholder="选择聚合方式">
                  <el-option label="求和" value="sum" />
                  <el-option label="平均值" value="avg" />
                  <el-option label="计数" value="count" />
                  <el-option label="最大值" value="max" />
                  <el-option label="最小值" value="min" />
                </el-select>
              </div>

              <!-- 筛选条件 -->
              <div class="field-config">
                <div class="field-label">数据筛选</div>
                <div class="filter-list">
                  <div
                    v-for="(filter, index) in form.config.filters"
                    :key="index"
                    class="filter-item"
                  >
                    <el-select v-model="filter.field" placeholder="选择字段" style="width: 120px;">
                      <el-option
                        v-for="field in allFields"
                        :key="field.name"
                        :label="field.label || field.name"
                        :value="field.name"
                      />
                    </el-select>
                    <el-select v-model="filter.operator" placeholder="操作符" style="width: 100px;">
                      <el-option label="等于" value="eq" />
                      <el-option label="不等于" value="ne" />
                      <el-option label="大于" value="gt" />
                      <el-option label="大于等于" value="gte" />
                      <el-option label="小于" value="lt" />
                      <el-option label="小于等于" value="lte" />
                    </el-select>
                    <el-input v-model="filter.value" placeholder="值" style="width: 120px;" />
                    <el-button
                      type="danger"
                      text
                      @click="removeFilter(index)"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                  <el-button @click="addFilter" type="text">
                    <el-icon><Plus /></el-icon>
                    添加筛选条件
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 样式配置 -->
            <div v-if="form.type" class="config-section">
              <h4>样式配置</h4>
              <el-form :model="form.config" label-width="80px">
                <el-form-item label="标题">
                  <el-input v-model="form.config.title" placeholder="图表标题" />
                </el-form-item>
                <el-form-item label="X轴名称">
                  <el-input v-model="form.config.xAxis.name" placeholder="X轴名称" />
                </el-form-item>
                <el-form-item label="Y轴名称">
                  <el-input v-model="form.config.yAxis.name" placeholder="Y轴名称" />
                </el-form-item>
                <el-form-item label="颜色主题">
                  <el-select v-model="form.config.theme" placeholder="选择颜色主题">
                    <el-option label="默认" value="default" />
                    <el-option label="明亮" value="light" />
                    <el-option label="深色" value="dark" />
                    <el-option label="渐变" value="gradient" />
                  </el-select>
                </el-form-item>
                <el-form-item label="显示网格">
                  <el-switch v-model="form.config.showGrid" />
                </el-form-item>
                <el-form-item label="显示图例">
                  <el-switch v-model="form.config.showLegend" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 高级配置 -->
            <div class="config-section">
              <h4>高级配置</h4>
              <el-form :model="form.config" label-width="100px">
                <el-form-item label="缓存时间">
                  <el-input-number
                    v-model="form.config.cacheDuration"
                    :min="0"
                    :max="3600"
                    controls-position="right"
                  />
                  <span class="unit">秒</span>
                </el-form-item>
                <el-form-item label="自动刷新">
                  <el-switch v-model="form.config.autoRefresh" />
                </el-form-item>
                <el-form-item label="刷新间隔" v-if="form.config.autoRefresh">
                  <el-input-number
                    v-model="form.config.refreshInterval"
                    :min="10"
                    :max="3600"
                    controls-position="right"
                  />
                  <span class="unit">秒</span>
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
                <h3>图表预览</h3>
                <div class="preview-actions">
                  <el-button
                    type="primary"
                    text
                    @click="handlePreview"
                    :loading="previewLoading"
                  >
                    <el-icon><Refresh /></el-icon>
                    刷新预览
                  </el-button>
                  <el-button
                    type="success"
                    text
                    @click="handleCopy"
                  >
                    <el-icon><CopyDocument /></el-icon>
                    复制图表
                  </el-button>
                </div>
              </div>
            </template>

            <!-- 预览内容 -->
            <div class="preview-content">
              <div v-if="previewLoading" class="preview-loading">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="previewError" class="preview-error">
                <el-icon class="error-icon"><Warning /></el-icon>
                <p>{{ previewError }}</p>
                <el-button @click="handlePreview" type="text">重试</el-button>
              </div>
              
              <div v-else-if="previewData" class="preview-chart">
                <!-- 这里可以集成实际的图表组件 -->
                <div class="chart-placeholder">
                  <el-icon class="chart-icon">
                    <component :is="getChartTypeIcon(form.type)" />
                  </el-icon>
                  <h4>{{ form.config.title || form.name }}</h4>
                  <p>图表类型: {{ getChartTypeLabel(form.type) }}</p>
                  <div class="chart-data">
                    <div v-for="(row, index) in previewData.rows.slice(0, 5)" :key="index" class="data-row">
                      <span class="data-label">{{ row[form.config.xAxis.field] }}</span>
                      <span class="data-value">{{ row[form.config.yAxis.field] }}</span>
                    </div>
                    <div v-if="previewData.rows.length > 5" class="data-more">
                      ... 还有 {{ previewData.rows.length - 5 }} 条数据
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="preview-empty">
                <el-icon class="empty-icon"><DataAnalysis /></el-icon>
                <p>点击刷新预览查看图表效果</p>
              </div>
            </div>

            <!-- 预览信息 -->
            <div v-if="previewData" class="preview-info">
              <div class="info-item">
                <span class="label">数据量:</span>
                <span class="value">{{ previewData.rows.length }} 行</span>
              </div>
              <div class="info-item">
                <span class="label">执行时间:</span>
                <span class="value">{{ previewResult?.executionTime || 0 }}ms</span>
              </div>
              <div class="info-item">
                <span class="label">最后更新:</span>
                <span class="value">{{ formatTime(chart.updatedAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态:</span>
                <span class="value success">预览成功</span>
              </div>
            </div>
          </el-card>

          <!-- 操作历史 -->
          <el-card class="history-card">
            <template #header>
              <h3>操作历史</h3>
            </template>
            <div class="history-list">
              <div v-for="(item, index) in operationHistory" :key="index" class="history-item">
                <div class="history-content">
                  <div class="history-action">{{ item.action }}</div>
                  <div class="history-time">{{ formatTime(item.time) }}</div>
                </div>
              </div>
              <div v-if="operationHistory.length === 0" class="history-empty">
                暂无操作记录
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
        <el-icon class="delete-icon"><Warning /></el-icon>
        <p>确定要删除图表 "{{ form.name }}" 吗？</p>
        <p class="delete-warning">此操作不可恢复，请谨慎操作！</p>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  PieChart,
  Check,
  Delete,
  Close,
  Plus,
  Refresh,
  CopyDocument,
  DataAnalysis,
  Warning,
  LineChart,
  Histogram,
  TrendCharts
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import { useDatasetStore } from '@/store/dataset'
import type { AnalysisChart, ChartConfig, ChartPreviewResponse } from '@/types/analysis'
import type { Dataset } from '@/types/dataset'

const route = useRoute()
const router = useRouter()
const analysisStore = useAnalysisStore()
const datasetStore = useDatasetStore()

// 路由参数
const chartId = computed(() => parseInt(route.params.id as string))

// 表单引用
const formRef = ref<FormInstance>()

// 响应式数据
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const previewLoading = ref(false)
const previewError = ref('')
const previewResult = ref<ChartPreviewResponse | null>(null)
const deleteDialogVisible = ref(false)

// 图表数据
const chart = ref<AnalysisChart | null>(null)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  datasetId: null as number | null,
  type: '',
  isPublic: false,
  config: {
    type: '',
    title: '',
    xAxis: {
      field: '',
      type: 'category',
      name: ''
    },
    yAxis: {
      field: '',
      type: 'value',
      name: ''
    },
    aggregations: [
      {
        field: '',
        type: 'sum',
        alias: ''
      }
    ],
    filters: [] as Array<{
      field: string
      operator: string
      value: any
    }>,
    sort: [],
    theme: 'default',
    showGrid: true,
    showLegend: true,
    cacheDuration: 300,
    autoRefresh: false,
    refreshInterval: 60
  } as ChartConfig
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入图表名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  datasetId: [
    { required: true, message: '请选择数据集', trigger: 'change' }
  ]
}

// 数据集列表
const datasets = ref<Dataset[]>([])

// 操作历史（模拟数据）
const operationHistory = ref([
  { action: '创建图表', time: new Date(Date.now() - 86400000) },
  { action: '修改配置', time: new Date(Date.now() - 43200000) },
  { action: '更新数据', time: new Date(Date.now() - 21600000) }
])

// 计算属性
const canChangeDataset = computed(() => {
  return chart.value?.status === 'draft' || chart.value?.status === 'active'
})

const canChangeType = computed(() => {
  return chart.value?.status === 'draft'
})

const allFields = computed(() => {
  if (!form.datasetId) return []
  const dataset = datasets.value.find(d => d.id === form.datasetId)
  return dataset?.columns || []
})

const fieldGroups = computed(() => {
  const fields = allFields.value
  return [
    {
      label: '文本字段',
      fields: fields.filter(f => f.type.includes('char') || f.type.includes('text'))
    },
    {
      label: '数值字段',
      fields: fields.filter(f => f.type.includes('int') || f.type.includes('decimal') || f.type.includes('float'))
    },
    {
      label: '日期字段',
      fields: fields.filter(f => f.type.includes('date') || f.type.includes('time'))
    }
  ].filter(group => group.fields.length > 0)
})

const previewData = computed(() => {
  return previewResult.value?.data || null
})

// 方法
const loadChart = async () => {
  loading.value = true
  try {
    await analysisStore.fetchChartDetail(chartId.value)
    chart.value = analysisStore.currentChart
    
    if (chart.value) {
      // 填充表单数据
      form.name = chart.value.name
      form.description = chart.value.description || ''
      form.datasetId = chart.value.datasetId
      form.type = chart.value.type
      form.isPublic = chart.value.isPublic || false
      
      // 合并配置
      if (chart.value.config) {
        Object.assign(form.config, chart.value.config)
      }
      
      // 加载数据集
      await loadDatasets()
      
      // 自动预览
      setTimeout(() => {
        handlePreview()
      }, 500)
    }
  } catch (error) {
    ElMessage.error('加载图表信息失败')
  } finally {
    loading.value = false
  }
}

const loadDatasets = async () => {
  try {
    await datasetStore.fetchDatasets()
    datasets.value = datasetStore.datasets
  } catch (error) {
    ElMessage.error('加载数据集失败')
  }
}

const handleDatasetChange = async (datasetId: number) => {
  if (datasetId) {
    try {
      await analysisStore.fetchDatasetFields(datasetId)
      // 重置字段选择
      form.config.xAxis.field = ''
      form.config.yAxis.field = ''
      form.config.aggregations[0].field = ''
    } catch (error) {
      ElMessage.error('加载字段信息失败')
    }
  }
}

const handleFieldChange = () => {
  if (form.config.yAxis.field) {
    form.config.aggregations[0].field = form.config.yAxis.field
  }
}

const addFilter = () => {
  form.config.filters.push({
    field: '',
    operator: 'eq',
    value: ''
  })
}

const removeFilter = (index: number) => {
  form.config.filters.splice(index, 1)
}

const handlePreview = async () => {
  if (!form.datasetId || !form.type) {
    ElMessage.warning('请先选择数据集和图表类型')
    return
  }

  previewLoading.value = true
  previewError.value = ''
  
  try {
    await analysisStore.previewChart({
      datasetId: form.datasetId,
      config: form.config,
      filters: form.config.filters
    })
    
    previewResult.value = analysisStore.previewResult
    
    if (!previewResult.value?.success) {
      previewError.value = previewResult.value?.error || '预览失败'
    }
  } catch (error) {
    previewError.value = '预览请求失败'
  } finally {
    previewLoading.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    if (!form.datasetId || !form.type) {
      ElMessage.warning('请完善图表配置')
      return
    }

    saving.value = true
    
    const chartData = {
      name: form.name,
      description: form.description,
      datasetId: form.datasetId,
      type: form.type,
      isPublic: form.isPublic,
      config: form.config
    }

    await analysisStore.updateChart(chartId.value, chartData)
    ElMessage.success('图表更新成功')
    
    // 重新加载图表信息
    await loadChart()
  } catch (error) {
    ElMessage.error('更新图表失败')
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
    await analysisStore.deleteChart(chartId.value)
    ElMessage.success('图表删除成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('删除图表失败')
  } finally {
    deleting.value = false
    deleteDialogVisible.value = false
  }
}

const handleCopy = async () => {
  try {
    await analysisStore.copyChart(chartId.value)
    ElMessage.success('图表复制成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('复制图表失败')
  }
}

const handleCancel = () => {
  router.push('/analysis')
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

const getChartTypeDescription = (type: string) => {
  const descMap: Record<string, string> = {
    'line': '显示数据趋势',
    'bar': '比较不同类别数据',
    'pie': '显示部分与整体关系',
    'scatter': '显示两个变量关系'
  }
  return descMap[type] || '图表'
}

const formatTime = (time?: string | Date) => {
  if (!time) return '未知'
  const date = typeof time === 'string' ? new Date(time) : time
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadChart()
})
</script>

<style scoped lang="scss">
.chart-edit-view {
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
  .loading-container,
  .error-container {
    padding: var(--space-20) 0;
  }
  
  .content-layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: var(--space-6);
    min-height: 600px;
  }
  
  .config-panel {
    .config-card {
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
      display: flex;
      align-items: center;
      justify-content: center;
      
      .preview-loading {
        width: 100%;
      }
      
      .preview-error {
        text-align: center;
        color: var(--color-danger);
        
        .error-icon {
          font-size: 3rem;
          margin-bottom: var(--space-3);
        }
        
        p {
          margin-bottom: var(--space-3);
        }
      }
      
      .preview-chart {
        width: 100%;
        height: 100%;
        
        .chart-placeholder {
          text-align: center;
          padding: var(--space-8);
          
          .chart-icon {
            font-size: 4rem;
            color: var(--color-primary);
            margin-bottom: var(--space-3);
          }
          
          h4 {
            margin-bottom: var(--space-2);
            color: var(--color-text-primary);
          }
          
          p {
            color: var(--color-text-secondary);
            margin-bottom: var(--space-4);
          }
          
          .chart-data {
            .data-row {
              display: flex;
              justify-content: space-between;
              padding: var(--space-2) 0;
              border-bottom: 1px solid var(--color-border-light);
              
              .data-label {
                color: var(--color-text-secondary);
              }
              
              .data-value {
                font-weight: 600;
                color: var(--color-text-primary);
              }
            }
            
            .data-more {
              text-align: center;
              color: var(--color-text-tertiary);
              font-size: var(--font-size-sm);
              margin-top: var(--space-2);
            }
          }
        }
      }
      
      .preview-empty {
        text-align: center;
        color: var(--color-text-tertiary);
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: var(--space-3);
        }
        
        p {
          margin: 0;
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
    
    .history-card {
      :deep(.el-card__header) {
        padding: var(--space-4) var(--space-5);
        border-bottom: 1px solid var(--color-border-light);
        
        h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          font-weight: 600;
        }
      }
      
      :deep(.el-card__body) {
        padding: var(--space-4);
      }
      
      .history-list {
        .history-item {
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--color-border-light);
          
          &:last-child {
            border-bottom: none;
          }
          
          .history-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .history-action {
              color: var(--color-text-primary);
              font-weight: 500;
            }
            
            .history-time {
              color: var(--color-text-secondary);
              font-size: var(--font-size-sm);
            }
          }
        }
        
        .history-empty {
          text-align: center;
          color: var(--color-text-tertiary);
          padding: var(--space-4) 0;
        }
      }
    }
  }
}

.delete-dialog {
  text-align: center;
  
  .delete-icon {
    font-size: 4rem;
    color: var(--color-warning);
    margin-bottom: var(--space-4);
  }
  
  p {
    margin-bottom: var(--space-3);
    color: var(--color-text-primary);
  }
  
  .delete-warning {
    color: var(--color-danger);
    font-weight: 500;
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
    
    .preview-card {
      height: 400px;
    }
  }
}

@media (max-width: 768px) {
  .chart-edit-view {
    padding: var(--space-4);
  }
  
  .page-header .header-content {
    flex-direction: column;
    gap: var(--space-4);
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>flex;
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
      
      .current-type {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3);
        background: var(--color-bg-light);
        border-radius: var(--border-radius-md);
        
        .type-icon {
          font-size: 1.5rem;
          color: var(--color-primary);
        }
        
        .type-info {
          .type-name {
            font-weight: 600;
            color: var(--color-text-primary);
          }
          
          .type-desc {
            font-size: var(--font-size-sm);
            color: var(--color-text-secondary);
          }
        }
      }
      
      .type-change-tip {
        margin-top: var(--space-3);
      }
      
      .field-config {
        margin-bottom: var(--space-4);
        
        .field-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-2);
          font-weight: 500;
        }
        
        .filter-list {
          .filter-item {
            display: flex;
            gap: var(--space-2);
            align-items: center;
            margin-bottom: var(--space-2);
          }
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
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    
    .preview-card {
      flex: 1;
      
      :deep(.el-card__header) {
        padding: var(--space-4) var(--space-5);
        border-bottom: 1px solid var(--color-border-light);
        
        .card-header {
          display: flex;
