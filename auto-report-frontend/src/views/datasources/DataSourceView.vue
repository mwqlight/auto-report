<template>
  <div class="data-source-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          数据源管理
        </h1>
        <p class="page-description">
          连接和管理您的数据源，支持多种数据库类型和API接口
        </p>
      </div>
      
      <div class="header-actions">
        <el-button 
          type="primary" 
          @click="handleCreateDataSource"
          :icon="Plus"
        >
          新建数据源
        </el-button>
        <el-button 
          @click="refreshDataSources"
          :icon="Refresh"
        >
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索数据源名称或描述"
        :prefix-icon="Search"
        style="width: 300px"
        @input="handleSearch"
      />
      
      <el-select
        v-model="filterTypes"
        multiple
        placeholder="选择类型"
        style="width: 200px; margin-left: 12px"
        @change="handleFilterChange"
      >
        <el-option
          v-for="type in dataSourceTypes"
          :key="type.value"
          :label="type.label"
          :value="type.value"
        />
      </el-select>
      
      <el-select
        v-model="filterStatuses"
        multiple
        placeholder="选择状态"
        style="width: 200px; margin-left: 12px"
        @change="handleFilterChange"
      >
        <el-option label="激活" value="ACTIVE" />
        <el-option label="停用" value="INACTIVE" />
        <el-option label="错误" value="ERROR" />
      </el-select>
    </div>
    
    <!-- 数据源列表 -->
    <div class="data-source-list">
      <div v-if="!isLoading && filteredDataSources.length === 0" class="empty-state">
        <el-empty description="暂无数据源">
          <el-button type="primary" @click="handleCreateDataSource">
            创建第一个数据源
          </el-button>
        </el-empty>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <el-skeleton :rows="6" animated />
      </div>
      
      <!-- 数据源卡片列表 -->
      <div v-if="!isLoading && filteredDataSources.length > 0" class="data-source-grid">
        <el-card 
          v-for="dataSource in filteredDataSources" 
          :key="dataSource.id"
          class="data-source-card"
          :class="{ 'active': dataSource.status === 'ACTIVE', 'inactive': dataSource.status === 'INACTIVE', 'error': dataSource.status === 'ERROR' }"
        >
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-tag :type="getStatusType(dataSource.status)" size="small">
                  {{ getStatusText(dataSource.status) }}
                </el-tag>
                <h3 class="data-source-name">{{ dataSource.name }}</h3>
              </div>
              <div class="header-right">
                <el-tag size="small" effect="plain">
                  {{ getTypeText(dataSource.type) }}
                </el-tag>
              </div>
            </div>
          </template>
          
          <div class="card-content">
            <p class="description" v-if="dataSource.description">
              {{ dataSource.description }}
            </p>
            <p class="connection-info">
              <el-icon><Connection /></el-icon>
              {{ dataSource.host }}:{{ dataSource.port }}/{{ dataSource.database }}
            </p>
            <p class="update-time">
              <el-icon><Clock /></el-icon>
              更新于: {{ formatDate(dataSource.updatedAt) }}
            </p>
          </div>
          
          <template #footer>
            <div class="card-actions">
              <el-button 
                size="small" 
                :type="dataSource.status === 'ACTIVE' ? 'warning' : 'success'"
                @click="handleToggleStatus(dataSource)"
                :loading="toggleLoading[dataSource.id]"
              >
                {{ dataSource.status === 'ACTIVE' ? '停用' : '激活' }}
              </el-button>
              <el-button 
                size="small" 
                @click="handleViewDetail(dataSource)"
              >
                详情
              </el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="handleEditDataSource(dataSource)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteDataSource(dataSource)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-card>
      </div>
      
      <!-- 分页 -->
      <div v-if="!isLoading && filteredDataSources.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除数据源 "{{ currentDataSource?.name }}" 吗？此操作不可逆。</p>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleteLoading">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search, Connection, Clock } from '@element-plus/icons-vue'
import { useDataSourceStore } from '@/store/datasource'
import type { DataSource } from '@/types/datasource'

const router = useRouter()
const dataSourceStore = useDataSourceStore()

// 响应式数据
const deleteDialogVisible = ref(false)
const deleteLoading = ref(false)
const currentDataSource = ref<DataSource | null>(null)
const searchKeyword = ref('')
const filterTypes = ref<string[]>([])
const filterStatuses = ref<string[]>([])
const toggleLoading = ref<Record<string, boolean>>({})

// 计算属性
const filteredDataSources = computed(() => dataSourceStore.filteredDataSources)
const isLoading = computed(() => dataSourceStore.isLoading)
const pagination = computed(() => dataSourceStore.pagination)
const dataSourceTypes = computed(() => dataSourceStore.dataSourceTypes)

// 生命周期
onMounted(() => {
  loadDataSources()
})

// 方法
const loadDataSources = async () => {
  try {
    await dataSourceStore.fetchDataSources({
      keyword: searchKeyword.value,
      types: filterTypes.value,
      statuses: filterStatuses.value,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    })
  } catch (error) {
    ElMessage.error('加载数据源列表失败')
  }
}

const refreshDataSources = () => {
  loadDataSources()
  ElMessage.success('数据已刷新')
}

const handleSearch = () => {
  pagination.value.page = 1
  loadDataSources()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadDataSources()
}

const handleCreateDataSource = () => {
  router.push('/datasources/create')
}

const handleEditDataSource = (dataSource: DataSource) => {
  router.push(`/datasources/${dataSource.id}/edit`)
}

const handleDeleteDataSource = (dataSource: DataSource) => {
  currentDataSource.value = dataSource
  deleteDialogVisible.value = true
}

const handleToggleStatus = async (dataSource: DataSource) => {
  toggleLoading.value[dataSource.id] = true
  try {
    if (dataSource.status === 'ACTIVE') {
      await dataSourceStore.deactivateDataSource(dataSource.id)
      ElMessage.success('数据源已停用')
    } else {
      await dataSourceStore.activateDataSource(dataSource.id)
      ElMessage.success('数据源已激活')
    }
    await loadDataSources()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    toggleLoading.value[dataSource.id] = false
  }
}

const handleViewDetail = (dataSource: DataSource) => {
  router.push(`/datasources/${dataSource.id}/detail`)
}

const handlePageChange = (page: number) => {
  dataSourceStore.pagination.page = page
  loadDataSources()
}

const handlePageSizeChange = (size: number) => {
  dataSourceStore.pagination.pageSize = size
  dataSourceStore.pagination.page = 1
  loadDataSources()
}

const confirmDelete = async () => {
  if (!currentDataSource.value) return
  
  deleteLoading.value = true
  try {
    await dataSourceStore.deleteDataSource(currentDataSource.value.id)
    deleteDialogVisible.value = false
    ElMessage.success('数据源删除成功')
    await loadDataSources()
  } catch (error) {
    ElMessage.error('删除数据源失败')
  } finally {
    deleteLoading.value = false
  }
}

// 工具方法
const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'INACTIVE': return 'info'
    case 'ERROR': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE': return '激活'
    case 'INACTIVE': return '停用'
    case 'ERROR': return '错误'
    default: return status
  }
}

const getTypeText = (type: string) => {
  const typeInfo = dataSourceTypes.value.find(t => t.value === type)
  return typeInfo ? typeInfo.label : type
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.data-source-view {
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
    
    .header-actions {
      display: flex;
      gap: var(--space-3);
    }
  }
  
  .filter-section {
    background: var(--color-bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    margin-bottom: var(--space-6);
    border: 1px solid var(--color-border-primary);
    
    .stats-info {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-6);
      
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
  
  .data-source-list {
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
  }
  
  .pagination-section {
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
  .data-source-view {
    padding: var(--space-4);
    
    .page-header {
      flex-direction: column;
      gap: var(--space-4);
      
      .header-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
    
    .filter-section {
      .stats-info {
        justify-content: flex-start;
        gap: var(--space-4);
        margin-top: var(--space-4);
      }
    }
  }
}
</style>