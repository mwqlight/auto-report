<template>
  <div class="data-source-filter">
    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索数据源名称或描述..."
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
        @clear="handleSearch"
        style="width: 300px"
      />
    </div>
    
    <!-- 筛选条件 -->
    <div class="filter-section">
      <!-- 类型筛选 -->
      <el-popover
        placement="bottom-start"
        :width="300"
        trigger="click"
        v-model:visible="typeFilterVisible"
      >
        <template #reference>
          <el-button :icon="Filter" class="filter-button">
            类型
            <el-badge 
              v-if="filters.types.length > 0" 
              :value="filters.types.length" 
              class="filter-badge"
            />
          </el-button>
        </template>
        
        <div class="filter-popover">
          <div class="filter-header">
            <span>数据源类型</span>
            <el-button 
              type="text" 
              size="small" 
              @click="clearTypeFilter"
              v-if="filters.types.length > 0"
            >
              清空
            </el-button>
          </div>
          
          <div class="filter-options">
            <el-checkbox-group v-model="filters.types">
              <div 
                v-for="type in dataSourceTypes" 
                :key="type.value"
                class="type-option"
              >
                <el-checkbox :label="type.value">
                  <div class="type-item">
                    <i :class="getTypeIcon(type.value)" class="type-icon"></i>
                    <span class="type-label">{{ type.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
          
          <div class="filter-actions">
            <el-button size="small" @click="typeFilterVisible = false">取消</el-button>
            <el-button type="primary" size="small" @click="applyTypeFilter">确定</el-button>
          </div>
        </div>
      </el-popover>
      
      <!-- 状态筛选 -->
      <el-popover
        placement="bottom-start"
        :width="200"
        trigger="click"
        v-model:visible="statusFilterVisible"
      >
        <template #reference>
          <el-button :icon="Filter" class="filter-button">
            状态
            <el-badge 
              v-if="filters.statuses.length > 0" 
              :value="filters.statuses.length" 
              class="filter-badge"
            />
          </el-button>
        </template>
        
        <div class="filter-popover">
          <div class="filter-header">
            <span>数据源状态</span>
            <el-button 
              type="text" 
              size="small" 
              @click="clearStatusFilter"
              v-if="filters.statuses.length > 0"
            >
              清空
            </el-button>
          </div>
          
          <div class="filter-options">
            <el-checkbox-group v-model="filters.statuses">
              <div 
                v-for="status in dataSourceStatuses" 
                :key="status.value"
                class="status-option"
              >
                <el-checkbox :label="status.value">
                  <div class="status-item">
                    <div 
                      class="status-indicator" 
                      :class="getStatusClass(status.value)"
                    ></div>
                    <span class="status-label">{{ status.label }}</span>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
          
          <div class="filter-actions">
            <el-button size="small" @click="statusFilterVisible = false">取消</el-button>
            <el-button type="primary" size="small" @click="applyStatusFilter">确定</el-button>
          </div>
        </div>
      </el-popover>
      
      <!-- 标签筛选 -->
      <el-popover
        placement="bottom-start"
        :width="300"
        trigger="click"
        v-model:visible="tagFilterVisible"
      >
        <template #reference>
          <el-button :icon="Filter" class="filter-button">
            标签
            <el-badge 
              v-if="filters.tags.length > 0" 
              :value="filters.tags.length" 
              class="filter-badge"
            />
          </el-button>
        </template>
        
        <div class="filter-popover">
          <div class="filter-header">
            <span>数据源标签</span>
            <el-button 
              type="text" 
              size="small" 
              @click="clearTagFilter"
              v-if="filters.tags.length > 0"
            >
              清空
            </el-button>
          </div>
          
          <div class="filter-options">
            <div class="tag-input-section">
              <el-input
                v-model="tagInputValue"
                placeholder="输入标签搜索..."
                :prefix-icon="Search"
                size="small"
                @input="searchTags"
                style="margin-bottom: var(--space-2)"
              />
            </div>
            
            <div class="tag-list">
              <el-checkbox-group v-model="filters.tags">
                <div 
                  v-for="tag in filteredTags" 
                  :key="tag"
                  class="tag-option"
                >
                  <el-checkbox :label="tag">
                    <el-tag size="small" class="tag-label">
                      {{ tag }}
                    </el-tag>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
              
              <div v-if="filteredTags.length === 0" class="empty-tags">
                <el-empty description="暂无标签" :image-size="60" />
              </div>
            </div>
          </div>
          
          <div class="filter-actions">
            <el-button size="small" @click="tagFilterVisible = false">取消</el-button>
            <el-button type="primary" size="small" @click="applyTagFilter">确定</el-button>
          </div>
        </div>
      </el-popover>
      
      <!-- 排序 -->
      <el-select
        v-model="filters.sortBy"
        placeholder="排序方式"
        @change="handleSortChange"
        style="width: 150px"
      >
        <el-option label="创建时间" value="createdAt" />
        <el-option label="更新时间" value="updatedAt" />
        <el-option label="名称" value="name" />
        <el-option label="类型" value="type" />
      </el-select>
      
      <el-select
        v-model="filters.sortOrder"
        @change="handleSortChange"
        style="width: 120px"
      >
        <el-option label="升序" value="asc" />
        <el-option label="降序" value="desc" />
      </el-select>
      
      <!-- 显示模式 -->
      <el-button-group class="view-mode-group">
        <el-button
          :icon="Grid"
          :type="filters.viewMode === 'grid' ? 'primary' : 'default'"
          @click="setViewMode('grid')"
          title="网格视图"
        />
        <el-button
          :icon="List"
          :type="filters.viewMode === 'list' ? 'primary' : 'default'"
          @click="setViewMode('list')"
          title="列表视图"
        />
      </el-button-group>
      
      <!-- 刷新按钮 -->
      <el-button :icon="Refresh" @click="handleRefresh" title="刷新">
        刷新
      </el-button>
      
      <!-- 清空筛选 -->
      <el-button 
        v-if="hasActiveFilters" 
        type="text" 
        @click="clearAllFilters"
        class="clear-filters"
      >
        清空筛选
      </el-button>
    </div>
    
    <!-- 筛选标签 -->
    <div v-if="hasActiveFilters" class="filter-tags">
      <div class="filter-tags-header">
        <span>当前筛选条件：</span>
        <el-button type="text" size="small" @click="clearAllFilters">
          清空全部
        </el-button>
      </div>
      
      <div class="filter-tags-list">
        <!-- 关键词标签 -->
        <el-tag 
          v-if="filters.keyword" 
          closable 
          @close="clearKeywordFilter"
          class="filter-tag"
        >
          关键词：{{ filters.keyword }}
        </el-tag>
        
        <!-- 类型标签 -->
        <el-tag 
          v-for="type in filters.types" 
          :key="type"
          closable 
          @close="removeTypeFilter(type)"
          class="filter-tag"
        >
          类型：{{ getTypeLabel(type) }}
        </el-tag>
        
        <!-- 状态标签 -->
        <el-tag 
          v-for="status in filters.statuses" 
          :key="status"
          closable 
          @close="removeStatusFilter(status)"
          class="filter-tag"
          :type="getStatusTagType(status)"
        >
          状态：{{ getStatusLabel(status) }}
        </el-tag>
        
        <!-- 标签筛选 -->
        <el-tag 
          v-for="tag in filters.tags" 
          :key="tag"
          closable 
          @close="removeTagFilter(tag)"
          class="filter-tag"
        >
          标签：{{ tag }}
        </el-tag>
        
        <!-- 排序标签 -->
        <el-tag 
          v-if="filters.sortBy" 
          closable 
          @close="clearSortFilter"
          class="filter-tag"
        >
          排序：{{ getSortLabel() }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Search, Filter, Refresh, Grid, List } from '@element-plus/icons-vue'
import { useDataSourceStore } from '@/store/datasource'
import type { DataSourceType, DataSourceStatus } from '@/types/datasource'

// 定义筛选器接口
type DataSourceFilters = {
  keyword: string
  types: DataSourceType[]
  statuses: DataSourceStatus[]
  tags: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
}

interface Props {
  modelValue: DataSourceFilters
}

interface Emits {
  (e: 'update:modelValue', value: DataSourceFilters): void
  (e: 'filter-change'): void
  (e: 'refresh'): void
}

interface DataSourceFilters {
  keyword: string
  types: DataSourceType[]
  statuses: DataSourceStatus[]
  tags: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dataSourceStore = useDataSourceStore()

// 筛选弹窗显示状态
const typeFilterVisible = ref(false)
const statusFilterVisible = ref(false)
const tagFilterVisible = ref(false)

// 标签搜索
const tagInputValue = ref('')

// 筛选条件
const filters = reactive<DataSourceFilters>({
  keyword: '',
  types: [],
  statuses: [],
  tags: [],
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  viewMode: 'grid'
})

// 监听props变化
watch(() => props.modelValue, (newVal) => {
  Object.assign(filters, newVal)
}, { deep: true, immediate: true })

// 计算属性
const dataSourceTypes = computed(() => dataSourceStore.dataSourceTypes)

const dataSourceStatuses = computed(() => [
  { label: '激活', value: 'ACTIVE' },
  { label: '停用', value: 'INACTIVE' },
  { label: '错误', value: 'ERROR' }
])

const allTags = computed(() => {
  const tags = new Set<string>()
  dataSourceStore.dataSources.forEach(ds => {
    ds.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const filteredTags = computed(() => {
  if (!tagInputValue.value) {
    return allTags.value
  }
  return allTags.value.filter(tag => 
    tag.toLowerCase().includes(tagInputValue.value.toLowerCase())
  )
})

const hasActiveFilters = computed(() => {
  return filters.keyword !== '' || 
         filters.types.length > 0 || 
         filters.statuses.length > 0 || 
         filters.tags.length > 0 ||
         filters.sortBy !== 'updatedAt' ||
         filters.sortOrder !== 'desc'
})

// 方法
const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'MYSQL': 'el-icon-mysql',
    'POSTGRESQL': 'el-icon-postgresql',
    'CLICKHOUSE': 'el-icon-clickhouse',
    'ORACLE': 'el-icon-oracle',
    'SQLSERVER': 'el-icon-sqlserver',
    'REDIS': 'el-icon-redis',
    'MONGODB': 'el-icon-mongodb',
    'ELASTICSEARCH': 'el-icon-elasticsearch',
    'API': 'el-icon-link',
    'FILE': 'el-icon-document'
  }
  return iconMap[type] || 'el-icon-question'
}

const getTypeLabel = (type: DataSourceType) => {
  const typeObj = dataSourceTypes.value.find(t => t.value === type)
  return typeObj ? typeObj.label : type
}

const getStatusClass = (status: DataSourceStatus) => {
  const classMap: Record<DataSourceStatus, string> = {
    'ACTIVE': 'status-active',
    'INACTIVE': 'status-inactive',
    'ERROR': 'status-error'
  }
  return classMap[status] || 'status-inactive'
}

const getStatusLabel = (status: DataSourceStatus) => {
  const statusObj = dataSourceStatuses.value.find(s => s.value === status)
  return statusObj ? statusObj.label : status
}

const getStatusTagType = (status: DataSourceStatus) => {
  const typeMap: Record<DataSourceStatus, string> = {
    'ACTIVE': 'success',
    'INACTIVE': 'info',
    'ERROR': 'danger'
  }
  return typeMap[status] || 'info'
}

const getSortLabel = () => {
  const sortMap: Record<string, string> = {
    'createdAt': '创建时间',
    'updatedAt': '更新时间',
    'name': '名称',
    'type': '类型'
  }
  const orderMap = {
    'asc': '升序',
    'desc': '降序'
  }
  return `${sortMap[filters.sortBy] || filters.sortBy} ${orderMap[filters.sortOrder]}`
}

// 筛选操作
const handleSearch = () => {
  emitFilterChange()
}

const applyTypeFilter = () => {
  typeFilterVisible.value = false
  emitFilterChange()
}

const clearTypeFilter = () => {
  filters.types = []
  applyTypeFilter()
}

const removeTypeFilter = (type: DataSourceType) => {
  filters.types = filters.types.filter(t => t !== type)
  emitFilterChange()
}

const applyStatusFilter = () => {
  statusFilterVisible.value = false
  emitFilterChange()
}

const clearStatusFilter = () => {
  filters.statuses = []
  applyStatusFilter()
}

const removeStatusFilter = (status: DataSourceStatus) => {
  filters.statuses = filters.statuses.filter(s => s !== status)
  emitFilterChange()
}

const searchTags = () => {
  // 标签搜索逻辑
}

const applyTagFilter = () => {
  tagFilterVisible.value = false
  emitFilterChange()
}

const clearTagFilter = () => {
  filters.tags = []
  applyTagFilter()
}

const removeTagFilter = (tag: string) => {
  filters.tags = filters.tags.filter(t => t !== tag)
  emitFilterChange()
}

const handleSortChange = () => {
  emitFilterChange()
}

const setViewMode = (mode: 'grid' | 'list') => {
  filters.viewMode = mode
  emitFilterChange()
}

const handleRefresh = () => {
  emit('refresh')
}

const clearKeywordFilter = () => {
  filters.keyword = ''
  emitFilterChange()
}

const clearSortFilter = () => {
  filters.sortBy = 'updatedAt'
  filters.sortOrder = 'desc'
  emitFilterChange()
}

const clearAllFilters = () => {
  filters.keyword = ''
  filters.types = []
  filters.statuses = []
  filters.tags = []
  filters.sortBy = 'updatedAt'
  filters.sortOrder = 'desc'
  emitFilterChange()
}

const emitFilterChange = () => {
  emit('update:modelValue', { ...filters })
  emit('filter-change')
}
</script>

<style scoped lang="scss">
.data-source-filter {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  border: 1px solid var(--color-border-primary);
}

.search-section {
  margin-bottom: var(--space-4);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-button {
  position: relative;
  
  .filter-badge {
    position: absolute;
    top: -6px;
    right: -6px;
  }
}

.view-mode-group {
  margin: 0 var(--space-2);
}

.clear-filters {
  margin-left: auto;
  color: var(--color-text-secondary);
  
  &:hover {
    color: var(--color-primary);
  }
}

.filter-popover {
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-border-primary);
    
    span {
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }
  }
  
  .filter-options {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: var(--space-3);
    
    .type-option,
    .status-option,
    .tag-option {
      margin-bottom: var(--space-2);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .type-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .type-icon {
        font-size: 16px;
        color: var(--color-text-secondary);
      }
      
      .type-label {
        color: var(--color-text-primary);
      }
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        
        &.status-active {
          background: var(--color-success);
        }
        
        &.status-inactive {
          background: var(--color-warning);
        }
        
        &.status-error {
          background: var(--color-error);
        }
      }
      
      .status-label {
        color: var(--color-text-primary);
      }
    }
    
    .tag-label {
      margin-left: var(--space-1);
    }
    
    .empty-tags {
      text-align: center;
      padding: var(--space-4) 0;
    }
  }
  
  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    border-top: 1px solid var(--color-border-primary);
    padding-top: var(--space-3);
  }
}

.filter-tags {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-primary);
  
  .filter-tags-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
    
    span {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
    }
  }
  
  .filter-tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  
  .filter-tag {
    margin-bottom: var(--space-1);
  }
}

@media (max-width: 768px) {
  .data-source-filter {
    padding: var(--space-3);
  }
  
  .filter-section {
    gap: var(--space-2);
    
    .el-input,
    .el-select {
      width: 100% !important;
      margin-bottom: var(--space-2);
    }
    
    .view-mode-group {
      margin: 0;
    }
  }
  
  .filter-tags-list {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>