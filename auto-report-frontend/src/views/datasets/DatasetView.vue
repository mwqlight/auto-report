<template>
  <div class="dataset-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon><DataBoard /></el-icon>
          数据集管理
        </h1>
        <p class="page-description">创建和管理数据分析数据集，支持SQL查询、文件导入、API接入等多种数据源</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreate">
          新建数据集
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索数据集名称或描述"
        :prefix-icon="Search"
        style="width: 300px"
        clearable
        @input="handleSearch"
      />
      <el-select
        v-model="filterType"
        placeholder="数据类型"
        clearable
        style="width: 150px; margin-left: 12px"
      >
        <el-option label="SQL查询" value="sql" />
        <el-option label="文件导入" value="file" />
        <el-option label="API接入" value="api" />
        <el-option label="自定义" value="custom" />
      </el-select>
      <el-select
        v-model="filterStatus"
        placeholder="状态"
        clearable
        style="width: 120px; margin-left: 12px"
      >
        <el-option label="激活" value="active" />
        <el-option label="停用" value="inactive" />
        <el-option label="错误" value="error" />
      </el-select>
      <el-checkbox v-model="showPublicOnly" style="margin-left: 12px">
        仅显示公开数据集
      </el-checkbox>
      <div class="stats-info">
        <div class="stat-item">
          <span class="stat-label">总数</span>
          <span class="stat-value">{{ datasetStore.datasetStats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">激活</span>
          <span class="stat-value active">{{ datasetStore.datasetStats.active }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">错误</span>
          <span class="stat-value error">{{ datasetStore.datasetStats.error }}</span>
        </div>
      </div>
    </div>

    <!-- 数据集列表 -->
    <div class="dataset-list">
      <!-- 加载状态 -->
      <div v-if="datasetStore.loading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredDatasets.length === 0" class="empty-state">
        <el-empty description="暂无数据集">
          <template #image>
            <el-icon size="64"><DataAnalysis /></el-icon>
          </template>
          <el-button type="primary" @click="handleCreate">创建第一个数据集</el-button>
        </el-empty>
      </div>

      <!-- 数据集网格 -->
      <div v-else class="dataset-grid">
        <el-card
          v-for="dataset in filteredDatasets"
          :key="dataset.id"
          class="dataset-card"
          :class="dataset.status"
        >
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-tag :type="getStatusType(dataset.status)" size="small">
                  {{ getStatusText(dataset.status) }}
                </el-tag>
                <h3 class="dataset-name">{{ dataset.name }}</h3>
                <el-tag v-if="dataset.isPublic" type="success" size="small">公开</el-tag>
              </div>
              <div class="header-actions">
                <el-dropdown trigger="click">
                  <el-button text :icon="More" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handlePreview(dataset.id)">
                        <el-icon><View /></el-icon>
                        预览数据
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleEdit(dataset.id)">
                        <el-icon><Edit /></el-icon>
                        编辑
                      </el-dropdown-item>
                      <el-dropdown-item 
                        v-if="dataset.status === 'active'"
                        @click="handleRefresh(dataset.id)"
                      >
                        <el-icon><Refresh /></el-icon>
                        刷新数据
                      </el-dropdown-item>
                      <el-dropdown-item divided @click="handleExport(dataset.id)">
                        <el-icon><Download /></el-icon>
                        导出
                      </el-dropdown-item>
                      <el-dropdown-item @click="handleCopy(dataset.id)">
                        <el-icon><CopyDocument /></el-icon>
                        复制
                      </el-dropdown-item>
                      <el-dropdown-item 
                        divided 
                        class="danger-item"
                        @click="handleDelete(dataset.id)"
                      >
                        <el-icon><Delete /></el-icon>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>

          <div class="card-content">
            <p class="description" :title="dataset.description">
              {{ dataset.description || '暂无描述' }}
            </p>
            
            <div class="dataset-info">
              <div class="info-item">
                <el-icon><Collection /></el-icon>
                <span>{{ getTypeText(dataset.type) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>{{ dataset.rowCount }} 行 × {{ dataset.columnCount }} 列</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>{{ dataset.createdBy }}</span>
              </div>
            </div>

            <div class="update-time">
              <el-icon><Clock /></el-icon>
              <span>更新于 {{ formatDate(dataset.updatedAt) }}</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="filteredDatasets.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 48, 96]"
        :total="datasetStore.totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Refresh, Search, More, View, Edit, Download, 
  CopyDocument, Delete, Collection, Document, User, Clock,
  DataBoard, DataAnalysis
} from '@element-plus/icons-vue'
import { useDatasetStore } from '@/store/dataset'
import type { Dataset } from '@/types/dataset'

const router = useRouter()
const datasetStore = useDatasetStore()

// 响应式数据
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showPublicOnly = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)

// 计算属性
const filteredDatasets = computed(() => {
  let datasets = datasetStore.datasets
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    datasets = datasets.filter(dataset => 
      dataset.name.toLowerCase().includes(keyword) ||
      (dataset.description && dataset.description.toLowerCase().includes(keyword))
    )
  }
  
  // 类型过滤
  if (filterType.value) {
    datasets = datasets.filter(dataset => dataset.type === filterType.value)
  }
  
  // 状态过滤
  if (filterStatus.value) {
    datasets = datasets.filter(dataset => dataset.status === filterStatus.value)
  }
  
  // 公开数据集过滤
  if (showPublicOnly.value) {
    datasets = datasets.filter(dataset => dataset.isPublic)
  }
  
  return datasets
})

const pagination = computed(() => ({
  page: currentPage.value,
  size: pageSize.value,
  search: searchKeyword.value,
  type: filterType.value,
  status: filterStatus.value,
  isPublic: showPublicOnly.value ? true : undefined
}))

// 生命周期
onMounted(() => {
  loadDatasets()
  datasetStore.fetchDatasetTypes()
})

// 方法
const loadDatasets = async () => {
  try {
    await datasetStore.fetchDatasets(pagination.value)
  } catch (error) {
    ElMessage.error('加载数据集失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadDatasets()
}

const handleCreate = () => {
  router.push('/datasets/create')
}

const handleRefresh = async (datasetId?: string) => {
  if (datasetId) {
    try {
      await datasetStore.refreshDataset(datasetId)
      ElMessage.success('数据集刷新成功')
    } catch (error) {
      ElMessage.error('刷新数据集失败')
    }
  } else {
    await loadDatasets()
    ElMessage.success('数据刷新成功')
  }
}

const handlePreview = (datasetId: string) => {
  router.push(`/datasets/${datasetId}/detail`)
}

const handleEdit = (datasetId: string) => {
  router.push(`/datasets/${datasetId}/edit`)
}

const handleExport = async (datasetId: string) => {
  try {
    await datasetStore.exportDataset(datasetId, 'csv')
    ElMessage.success('数据集导出成功')
  } catch (error) {
    ElMessage.error('导出数据集失败')
  }
}

const handleCopy = async (datasetId: string) => {
  try {
    const dataset = datasetStore.datasets.find(d => d.id === datasetId)
    if (!dataset) return
    
    const { value: name } = await ElMessageBox.prompt(
      '请输入新数据集的名称',
      '复制数据集',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `${dataset.name} - 副本`,
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return '数据集名称不能为空'
          }
          return true
        }
      }
    )
    
    await datasetStore.copyDataset(datasetId, name.trim())
    ElMessage.success('数据集复制成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('复制数据集失败')
    }
  }
}

const handleDelete = async (datasetId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个数据集吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await datasetStore.deleteDataset(datasetId)
    ElMessage.success('数据集删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除数据集失败')
    }
  }
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadDatasets()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadDatasets()
}

// 工具方法
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'info'
    case 'error': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '激活'
    case 'inactive': return '停用'
    case 'error': return '错误'
    default: return status
  }
}

const getTypeText = (type: string) => {
  switch (type) {
    case 'sql': return 'SQL查询'
    case 'file': return '文件导入'
    case 'api': return 'API接入'
    case 'custom': return '自定义'
    default: return type
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.dataset-view {
  padding: var(--space-6);
  min-height: 100%;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-6);
    
    .header-content {
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
        line-height: 1.5;
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--space-3);
    }
  }
  
  .filter-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-primary);
    
    .stats-info {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-6);
      margin-left: auto;
      
      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
        }
        
        .stat-value {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          
          &.active {
            color: var(--color-success);
          }
          
          &.error {
            color: var(--color-error);
          }
        }
      }
    }
  }
  
  .dataset-list {
    min-height: 400px;
    
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      
      :deep(.el-empty) {
        .el-empty__description p {
          color: var(--color-text-secondary);
        }
      }
    }
    
    .loading-state {
      padding: var(--space-8);
      
      :deep(.el-skeleton) {
        .el-skeleton__item {
          background: var(--color-bg-tertiary);
        }
      }
    }
    
    .dataset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: var(--space-5);
      margin-bottom: var(--space-6);
    }
    
    .dataset-card {
      transition: all 0.3s ease;
      border: 1px solid var(--color-border-primary);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
      
      &.active {
        border-left: 4px solid var(--color-success);
      }
      
      &.inactive {
        border-left: 4px solid var(--color-info);
      }
      
      &.error {
        border-left: 4px solid var(--color-error);
      }
      
      :deep(.el-card__header) {
        padding: var(--space-4);
        border-bottom: 1px solid var(--color-border-primary);
      }
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          
          .dataset-name {
            margin: 0;
            font-size: var(--font-size-lg);
            font-weight: var(--font-weight-semibold);
            color: var(--color-text-primary);
          }
        }
        
        .header-actions {
          :deep(.el-dropdown) {
            .el-button {
              padding: 4px;
              
              &:hover {
                background: var(--color-bg-tertiary);
              }
            }
          }
          
          :deep(.el-dropdown-menu) {
            .danger-item {
              color: var(--color-error);
              
              &:hover {
                background: rgba(var(--color-error-rgb), 0.1);
              }
            }
          }
        }
      }
      
      :deep(.el-card__body) {
        padding: var(--space-4);
      }
      
      .card-content {
        .description {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-4);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .dataset-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          
          .info-item {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            color: var(--color-text-tertiary);
            font-size: var(--font-size-sm);
            
            .el-icon {
              font-size: var(--font-size-base);
              color: var(--color-text-secondary);
            }
          }
        }
        
        .update-time {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--color-text-tertiary);
          font-size: var(--font-size-sm);
          
          .el-icon {
            font-size: var(--font-size-base);
            color: var(--color-text-secondary);
          }
        }
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: var(--space-6);
    padding: var(--space-4);
    
    :deep(.el-pagination) {
      .btn-prev, .btn-next, .number {
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border-primary);
        color: var(--color-text-primary);
        
        &:hover {
          border-color: var(--color-primary);
        }
        
        &.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
      }
      
      .el-pagination__jump {
        color: var(--color-text-primary);
      }
      
      .el-input__inner {
        background: var(--color-bg-secondary);
        border-color: var(--color-border-primary);
        color: var(--color-text-primary);
      }
    }
  }
}

@media (max-width: 768px) {
  .dataset-view {
    padding: var(--space-4);
    
    .page-header {
      flex-direction: column;
      gap: var(--space-4);
      
      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
    
    .filter-toolbar {
      flex-direction: column;
      gap: var(--space-3);
      
      .stats-info {
        justify-content: flex-start;
        gap: var(--space-4);
        margin-top: var(--space-3);
        margin-left: 0;
      }
    }
    
    .dataset-list {
      .dataset-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>