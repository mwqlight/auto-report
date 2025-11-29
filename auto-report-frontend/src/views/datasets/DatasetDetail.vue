<template>
  <div class="dataset-detail">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><DataBoard /></el-icon>
          数据集详情
        </h1>
        <p class="page-description">查看数据集详细信息和使用情况</p>
      </div>
      <div class="header-actions">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>
    </div>

    <div class="detail-content">
      <!-- 基本信息卡片 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <el-tag :type="getStatusType(dataset.status)" size="small">
              {{ getStatusText(dataset.status) }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="数据集名称">{{ dataset.name || '--' }}</el-descriptions-item>
          <el-descriptions-item label="数据集类型">{{ getTypeText(dataset.type) }}</el-descriptions-item>
          <el-descriptions-item label="数据源">{{ dataset.datasourceName || '--' }}</el-descriptions-item>
          <el-descriptions-item label="访问权限">
            <el-tag :type="dataset.isPublic ? 'success' : 'info'" size="small">
              {{ dataset.isPublic ? '公开' : '私有' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="更新策略">{{ getRefreshStrategyText(dataset.refreshStrategy) }}</el-descriptions-item>
          <el-descriptions-item label="Cron表达式">{{ dataset.cronExpression || '--' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatDate(dataset.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{ formatDate(dataset.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="数据集描述" :span="2">
            <div class="description-text">{{ dataset.description || '暂无描述' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- SQL配置卡片 -->
      <el-card class="config-card" v-if="dataset.type === 'sql'">
        <template #header>
          <div class="card-header">
            <span class="card-title">SQL配置</span>
            <div class="card-actions">
              <el-button size="small" @click="handleFormatSql">
                <el-icon><Magic /></el-icon>
                格式化
              </el-button>
              <el-button size="small" type="primary" @click="handlePreviewData">
                <el-icon><View /></el-icon>
                预览数据
              </el-button>
            </div>
          </div>
        </template>

        <div class="sql-content">
          <pre class="sql-code">{{ dataset.sqlQuery || '暂无SQL配置' }}</pre>
        </div>
      </el-card>

      <!-- API配置卡片 -->
      <el-card class="config-card" v-if="dataset.type === 'api'">
        <template #header>
          <div class="card-header">
            <span class="card-title">API配置</span>
          </div>
        </template>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="API地址">{{ dataset.apiUrl || '--' }}</el-descriptions-item>
          <el-descriptions-item label="请求参数">
            <pre class="json-code">{{ formatJson(dataset.apiParams) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 数据预览卡片 -->
      <el-card class="preview-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">数据预览</span>
            <div class="card-actions">
              <el-button size="small" @click="handleRefreshPreview">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button size="small" type="primary" @click="handleExportData">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>
            </div>
          </div>
        </template>

        <div v-loading="previewLoading">
          <el-table :data="previewData" border style="width: 100%" height="400">
            <el-table-column
              v-for="column in previewColumns"
              :key="column"
              :prop="column"
              :label="column"
              min-width="120"
              show-overflow-tooltip
            />
          </el-table>
          <div class="preview-info">
            <span>共 {{ previewData.length }} 行数据，显示前 100 行</span>
          </div>
        </div>
      </el-card>

      <!-- 使用统计卡片 -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">使用统计</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.totalQueries || 0 }}</div>
              <div class="stat-label">总查询次数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.todayQueries || 0 }}</div>
              <div class="stat-label">今日查询</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.avgResponseTime || 0 }}ms</div>
              <div class="stat-label">平均响应时间</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ stats.successRate || 0 }}%</div>
              <div class="stat-label">成功率</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 数据预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="数据预览"
      width="90%"
      :close-on-click-modal="false"
    >
      <div v-loading="previewLoading">
        <el-table :data="previewData" border style="width: 100%" height="500">
          <el-table-column
            v-for="column in previewColumns"
            :key="column"
            :prop="column"
            :label="column"
            min-width="120"
            show-overflow-tooltip
          />
        </el-table>
        <div class="preview-info">
          <span>共 {{ previewData.length }} 行数据</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  DataBoard,
  ArrowLeft,
  Edit,
  Magic,
  View,
  Refresh,
  Download
} from '@element-plus/icons-vue'
import { useDatasetStore } from '@/store/dataset'
import type { Dataset } from '@/types/dataset'

const router = useRouter()
const route = useRoute()
const datasetStore = useDatasetStore()

const loading = ref(false)
const previewLoading = ref(false)
const previewDialogVisible = ref(false)

const dataset = reactive<Partial<Dataset>>({})
const previewData = ref([])
const previewColumns = ref([])

const stats = reactive({
  totalQueries: 0,
  todayQueries: 0,
  avgResponseTime: 0,
  successRate: 100
})

// 加载数据集详情
const loadDatasetDetail = async () => {
  const datasetId = parseInt(route.params.id as string)
  if (!datasetId) {
    ElMessage.error('数据集ID无效')
    router.push('/datasets')
    return
  }

  try {
    loading.value = true
    const datasetDetail = await datasetStore.getDatasetDetail(datasetId)
    
    if (datasetDetail) {
      Object.assign(dataset, datasetDetail)
      await loadPreviewData()
    } else {
      ElMessage.error('数据集不存在')
      router.push('/datasets')
    }
  } catch (error) {
    console.error('加载数据集详情失败:', error)
    ElMessage.error('加载数据集详情失败')
    router.push('/datasets')
  } finally {
    loading.value = false
  }
}

// 加载预览数据
const loadPreviewData = async () => {
  if (!dataset.datasourceId || !dataset.sqlQuery) return

  try {
    previewLoading.value = true
    const result = await datasetStore.executeSql({
      datasourceId: dataset.datasourceId,
      sql: dataset.sqlQuery,
      limit: 100
    })
    
    previewData.value = result.data || []
    if (previewData.value.length > 0) {
      previewColumns.value = Object.keys(previewData.value[0])
    }
  } catch (error) {
    console.error('加载预览数据失败:', error)
    ElMessage.error('加载预览数据失败')
  } finally {
    previewLoading.value = false
  }
}

// 格式化SQL
const handleFormatSql = () => {
  if (dataset.sqlQuery) {
    // 简单的SQL格式化逻辑
    const formatted = dataset.sqlQuery
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*=\s*/g, ' = ')
      .replace(/\s*\n\s*/g, '\n    ')
    dataset.sqlQuery = formatted
    ElMessage.success('SQL格式化完成')
  }
}

// 预览数据
const handlePreviewData = () => {
  previewDialogVisible.value = true
}

// 刷新预览数据
const handleRefreshPreview = async () => {
  await loadPreviewData()
  ElMessage.success('数据已刷新')
}

// 导出数据
const handleExportData = () => {
  if (previewData.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }
  
  // 简单的CSV导出逻辑
  const headers = previewColumns.value.join(',')
  const csvContent = previewData.value.map(row => 
    previewColumns.value.map(col => `"${row[col] || ''}"`).join(',')
  ).join('\n')
  
  const csv = `${headers}\n${csvContent}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${dataset.name}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  
  ElMessage.success('数据导出成功')
}

// 返回列表
const handleBack = () => {
  router.push('/datasets')
}

// 编辑数据集
const handleEdit = () => {
  router.push(`/datasets/${dataset.id}/edit`)
}

// 工具方法
const getStatusType = (status: string) => {
  const statusMap = {
    active: 'success',
    inactive: 'info',
    error: 'error'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusTextMap = {
    active: '活跃',
    inactive: '停用',
    error: '错误'
  }
  return statusTextMap[status] || '未知'
}

const getTypeText = (type: string) => {
  const typeTextMap = {
    sql: 'SQL查询',
    file: '文件上传',
    api: 'API接口',
    stream: '实时流'
  }
  return typeTextMap[type] || '未知'
}

const getRefreshStrategyText = (strategy: string) => {
  const strategyTextMap = {
    manual: '手动更新',
    scheduled: '定时更新',
    realtime: '实时同步'
  }
  return strategyTextMap[strategy] || '未知'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatJson = (jsonStr: string) => {
  if (!jsonStr) return '--'
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2)
  } catch {
    return jsonStr
  }
}

onMounted(() => {
  loadDatasetDetail()
})
</script>

<style scoped lang="scss">
.dataset-detail {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);

    .page-title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
      display: flex;
      align-items: center;

      i {
        margin-right: var(--space-3);
        color: var(--color-primary);
      }
    }

    .page-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-base);
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
    }
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    .info-card,
    .config-card,
    .preview-card,
    .stats-card {
      :deep(.el-card__header) {
        padding: var(--space-4);
        border-bottom: 1px solid var(--color-border-primary);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }

        .card-actions {
          display: flex;
          gap: var(--space-2);
        }
      }

      :deep(.el-card__body) {
        padding: var(--space-4);
      }
    }

    .description-text {
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .sql-content {
      .sql-code {
        margin: 0;
        padding: var(--space-3);
        background: var(--color-bg-secondary);
        border-radius: var(--radius-base);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: var(--font-size-sm);
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }

    .json-code {
      margin: 0;
      padding: var(--space-3);
      background: var(--color-bg-secondary);
      border-radius: var(--radius-base);
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--font-size-sm);
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .preview-info {
      margin-top: var(--space-3);
      text-align: center;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }

    .stats-card {
      .stat-item {
        text-align: center;
        padding: var(--space-4);

        .stat-value {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          margin-bottom: var(--space-2);
        }

        .stat-label {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dataset-detail {
    padding: var(--space-4);

    .page-header {
      flex-direction: column;
      gap: var(--space-4);

      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .detail-content {
      .info-card,
      .config-card,
      .preview-card,
      .stats-card {
        :deep(.el-card__body) {
          padding: var(--space-3);
        }

        .card-header {
          flex-direction: column;
          gap: var(--space-2);
          align-items: flex-start;

          .card-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      }
    }
  }
}
</style>