<template>
  <div class="chart-create-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <el-icon class="header-icon"><PieChart /></el-icon>
          <div>
            <h1>创建图表</h1>
            <p>基于数据集创建可视化图表</p>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <el-icon><Check /></el-icon>
            保存图表
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
                <h3>图表配置</h3>
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
                  >
                    <el-option
                      v-for="dataset in datasets"
                      :key="dataset.id"
                      :label="dataset.name"
                      :value="dataset.id"
                    />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>

            <!-- 图表类型选择 -->
            <div class="config-section">
              <h4>图表类型</h4>
              <div class="chart-type-grid">
                <div
                  v-for="type in chartTypes"
                  :key="type.value"
                  :class="['type-card', { active: form.type === type.value }]"
                  @click="handleTypeSelect(type)"
                >
                  <el-icon class="type-icon">
                    <component :is="type.icon" />
                  </el-icon>
                  <div class="type-info">
                    <div class="type-name">{{ type.label }}</div>
                    <div class="type-desc">{{ type.description }}</div>
                  </div>
                </div>
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
              <div v-if="!form.datasetId || !form.type" class="preview-empty">
                <el-icon class="empty-icon"><DataAnalysis /></el-icon>
                <p>请先选择数据集和图表类型</p>
              </div>
              
              <div v-else-if="previewLoading" class="preview-loading">
                <el-skeleton :rows="5" animated />
              </div>
              
              <div v-else-if="previewError" class="preview-error">
                <el-icon class="error-icon"><Warning /></el-icon>
                <p>{{ previewError }}</p>
              </div>
              
              <div v-else-if="previewData" class="preview-chart">
                <!-- 这里可以集成实际的图表组件 -->
                <div class="chart-placeholder">
                  <el-icon class="chart-icon"><PieChart /></el-icon>
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
                <span class="label">状态:</span>
                <span class="value success">预览成功</span>
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
  PieChart,
  Check,
  Close,
  Plus,
  Refresh,
  DataAnalysis,
  Warning,
  LineChart,
  Histogram,
  TrendCharts,
  MapLocation
} from '@element-plus/icons-vue'
import { useAnalysisStore } from '@/store/analysis'
import { useDatasetStore } from '@/store/dataset'
import type { ChartTypeOption, ChartConfig, ChartPreviewResponse } from '@/types/analysis'
import type { Dataset } from '@/types/dataset'

const router = useRouter()
const analysisStore = useAnalysisStore()
const datasetStore = useDatasetStore()

// 表单引用
const formRef = ref<FormInstance>()

// 响应式数据
const saving = ref(false)
const previewLoading = ref(false)
const previewError = ref('')
const previewResult = ref<ChartPreviewResponse | null>(null)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  datasetId: null as number | null,
  type: '',
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
    sort: []
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
  ],
  type: [
    { required: true, message: '请选择图表类型', trigger: 'change' }
  ]
}

// 图表类型选项
const chartTypes = ref<ChartTypeOption[]>([
  {
    value: 'line',
    label: '折线图',
    icon: 'LineChart',
    category: 'basic',
    description: '显示数据趋势',
    dimensions: 1,
    measures: 1,
    supportedAggregations: ['sum', 'avg', 'count', 'max', 'min']
  },
  {
    value: 'bar',
    label: '柱状图',
    icon: 'Histogram',
    category: 'basic',
    description: '比较不同类别数据',
    dimensions: 1,
    measures: 1,
    supportedAggregations: ['sum', 'avg', 'count', 'max', 'min']
  },
  {
    value: 'pie',
    label: '饼图',
    icon: 'PieChart',
    category: 'basic',
    description: '显示部分与整体关系',
    dimensions: 1,
    measures: 1,
    supportedAggregations: ['sum', 'avg', 'count']
  },
  {
    value: 'scatter',
    label: '散点图',
    icon: 'TrendCharts',
    category: 'statistical',
    description: '显示两个变量关系',
    dimensions: 2,
    measures: 0,
    supportedAggregations: []
  }
])

// 数据集列表
const datasets = ref<Dataset[]>([])

// 计算属性
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

const handleTypeSelect = (type: ChartTypeOption) => {
  form.type = type.value
  form.config.type = type.value
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
      config: form.config
    }

    await analysisStore.createChart(chartData)
    ElMessage.success('图表创建成功')
    router.push('/analysis')
  } catch (error) {
    ElMessage.error('创建图表失败')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/analysis')
}

const getChartTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'line': '折线图',
    'bar': '柱状图',
    'pie': '饼图',
    'scatter': '散点图'
  }
  return typeMap[type] || type
}

// 生命周期
onMounted(() => {
  loadDatasets()
})
</script>

<style scoped lang="scss">
.chart-create-view {
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
      
      .chart-type-grid {
        display: grid;
        gap: var(--space-3);
        
        .type-card {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          cursor: pointer;
          transition: all 0.3s ease;
          
          &.active {
            border-color: var(--color-primary);
            background: var(--color-primary-light);
          }
          
          &:hover:not(.active) {
            border-color: var(--color-primary-light);
          }
          
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
      display: flex;
      align-items: center;
      justify-content: center;
      
      .preview-empty,
      .preview-error {
        text-align: center;
        color: var(--color-text-tertiary);
        
        .empty-icon,
        .error-icon {
          font-size: 3rem;
          margin-bottom: var(--space-3);
        }
        
        .error-icon {
          color: var(--color-danger);
        }
        
        p {
          margin: 0;
        }
      }
      
      .preview-loading {
        width: 100%;
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
    height: 400px;
  }
}
</style>