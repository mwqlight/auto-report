<template>
  <div class="dataset-edit">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><DataBoard /></el-icon>
          编辑数据集
        </h1>
        <p class="page-description">编辑数据集配置信息</p>
      </div>
    </div>

    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据集基本信息</span>
          <div class="header-actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handleSubmit">
              <el-icon><Check /></el-icon>
              保存修改
            </el-button>
          </div>
        </div>
      </template>

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="数据集名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入数据集名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据集类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择数据集类型" style="width: 100%" disabled>
                <el-option label="SQL查询" value="sql" />
                <el-option label="文件上传" value="file" />
                <el-option label="API接口" value="api" />
                <el-option label="实时流" value="stream" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="数据源" prop="datasourceId">
          <el-select
            v-model="formData.datasourceId"
            placeholder="请选择数据源"
            filterable
            style="width: 100%"
            @change="handleDatasourceChange"
          >
            <el-option
              v-for="datasource in datasourceList"
              :key="datasource.id"
              :label="datasource.name"
              :value="datasource.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="数据集描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入数据集描述信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="SQL查询" prop="sqlQuery" v-if="formData.type === 'sql'">
          <div class="sql-editor-container">
            <div class="editor-header">
              <span class="editor-title">SQL编辑器</span>
              <div class="editor-actions">
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
            <el-input
              v-model="formData.sqlQuery"
              type="textarea"
              :rows="8"
              placeholder="请输入SQL查询语句，支持参数化查询"
              class="sql-editor"
            />
          </div>
        </el-form-item>

        <el-form-item label="API配置" v-if="formData.type === 'api'">
          <el-input
            v-model="formData.apiUrl"
            placeholder="请输入API接口地址"
            style="margin-bottom: 12px"
          />
          <el-input
            v-model="formData.apiParams"
            type="textarea"
            :rows="2"
            placeholder="请输入请求参数（JSON格式）"
          />
        </el-form-item>

        <el-form-item label="访问权限" prop="isPublic">
          <el-radio-group v-model="formData.isPublic">
            <el-radio :label="true">公开数据集（所有用户可访问）</el-radio>
            <el-radio :label="false">私有数据集（仅创建者可访问）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="数据更新策略" prop="refreshStrategy">
          <el-select v-model="formData.refreshStrategy" placeholder="请选择更新策略" style="width: 100%">
            <el-option label="手动更新" value="manual" />
            <el-option label="定时更新" value="scheduled" />
            <el-option label="实时同步" value="realtime" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="formData.refreshStrategy === 'scheduled'">
          <el-input
            v-model="formData.cronExpression"
            placeholder="请输入Cron表达式，如：0 0 2 * * ?（每天凌晨2点）"
          />
        </el-form-item>

        <el-form-item label="创建信息">
          <div class="readonly-info">
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatDate(formData.createdAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">更新时间：</span>
              <span class="value">{{ formatDate(formData.updatedAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag :type="getStatusType(formData.status)" size="small">
                {{ getStatusText(formData.status) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="数据预览"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-loading="previewLoading">
        <el-table :data="previewData" border style="width: 100%">
          <el-table-column
            v-for="column in previewColumns"
            :key="column"
            :prop="column"
            :label="column"
            min-width="120"
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
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  DataBoard,
  Check,
  Magic,
  View
} from '@element-plus/icons-vue'
import { useDatasetStore } from '@/store/dataset'
import { useDatasourceStore } from '@/store/datasource'
import type { Dataset } from '@/types/dataset'

const router = useRouter()
const route = useRoute()
const datasetStore = useDatasetStore()
const datasourceStore = useDatasourceStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const previewDialogVisible = ref(false)
const previewLoading = ref(false)

const formData = reactive<Partial<Dataset>>({
  id: null,
  name: '',
  type: 'sql',
  description: '',
  datasourceId: null,
  sqlQuery: '',
  apiUrl: '',
  apiParams: '',
  isPublic: false,
  refreshStrategy: 'manual',
  cronExpression: '',
  status: 'active',
  createdAt: '',
  updatedAt: ''
})

const datasourceList = ref([])
const previewData = ref([])
const previewColumns = ref([])

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入数据集名称', trigger: 'blur' },
    { min: 2, max: 50, message: '数据集名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择数据集类型', trigger: 'change' }
  ],
  datasourceId: [
    { required: true, message: '请选择数据源', trigger: 'change' }
  ],
  sqlQuery: [
    { required: true, message: '请输入SQL查询语句', trigger: 'blur' }
  ]
}

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
    const dataset = await datasetStore.getDatasetDetail(datasetId)
    
    if (dataset) {
      Object.assign(formData, dataset)
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

// 加载数据源列表
const loadDatasources = async () => {
  try {
    await datasourceStore.loadDatasources()
    datasourceList.value = datasourceStore.datasources.filter(ds => ds.status === 'active')
  } catch (error) {
    console.error('加载数据源失败:', error)
    ElMessage.error('加载数据源失败')
  }
}

// 数据源变更处理
const handleDatasourceChange = (datasourceId: number) => {
  console.log('选择的数据源ID:', datasourceId)
}

// 格式化SQL
const handleFormatSql = () => {
  if (formData.sqlQuery) {
    // 简单的SQL格式化逻辑
    const formatted = formData.sqlQuery
      .replace(/\s+/g, ' ')
      .replace(/\s*,\s*/g, ', ')
      .replace(/\s*=\s*/g, ' = ')
      .replace(/\s*\n\s*/g, '\n    ')
    formData.sqlQuery = formatted
    ElMessage.success('SQL格式化完成')
  }
}

// 预览数据
const handlePreviewData = async () => {
  if (!formData.sqlQuery) {
    ElMessage.warning('请输入SQL查询语句')
    return
  }
  
  if (!formData.datasourceId) {
    ElMessage.warning('请先选择数据源')
    return
  }

  previewLoading.value = true
  previewDialogVisible.value = true

  try {
    const result = await datasetStore.executeSql({
      datasourceId: formData.datasourceId,
      sql: formData.sqlQuery,
      limit: 100
    })
    
    previewData.value = result.data || []
    if (previewData.value.length > 0) {
      previewColumns.value = Object.keys(previewData.value[0])
    }
  } catch (error) {
    console.error('数据预览失败:', error)
    ElMessage.error('数据预览失败')
  } finally {
    previewLoading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await datasetStore.updateDataset(formData.id!, formData)
    ElMessage.success('数据集更新成功')
    router.push('/datasets')
  } catch (error) {
    console.error('更新数据集失败:', error)
    ElMessage.error('更新数据集失败')
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  router.push('/datasets')
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

const formatDate = (dateStr: string) => {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadDatasources()
  loadDatasetDetail()
})
</script>

<style scoped lang="scss">
.dataset-edit {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
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
  }

  .form-card {
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

      .header-actions {
        display: flex;
        gap: var(--space-3);
      }
    }

    :deep(.el-card__body) {
      padding: var(--space-6);
    }

    .sql-editor-container {
      border: 1px solid var(--color-border-primary);
      border-radius: var(--radius-base);
      overflow: hidden;

      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-3) var(--space-4);
        background: var(--color-bg-secondary);
        border-bottom: 1px solid var(--color-border-primary);

        .editor-title {
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
        }
      }

      .sql-editor {
        :deep(.el-textarea__inner) {
          border: none;
          border-radius: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: var(--font-size-sm);
        }
      }
    }

    .readonly-info {
      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: var(--space-2);

        .label {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          min-width: 80px;
        }

        .value {
          color: var(--color-text-primary);
          font-size: var(--font-size-sm);
        }
      }
    }
  }

  .preview-info {
    margin-top: var(--space-4);
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 768px) {
  .dataset-edit {
    padding: var(--space-4);

    .form-card {
      :deep(.el-card__body) {
        padding: var(--space-4);
      }

      .card-header {
        flex-direction: column;
        gap: var(--space-3);
        align-items: flex-start;

        .header-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>