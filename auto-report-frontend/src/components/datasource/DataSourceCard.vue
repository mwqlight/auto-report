<template>
  <div class="data-source-card" :class="cardClass">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="type-icon">
        <i :class="typeIconClass" />
      </div>
      <div class="header-content">
        <h3 class="data-source-name" :title="dataSource.name">
          {{ dataSource.name }}
        </h3>
        <span class="data-source-type">{{ typeLabel }}</span>
      </div>
      <div class="status-indicator" :class="statusClass"></div>
    </div>
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <p class="data-source-description" v-if="dataSource.description">
        {{ dataSource.description }}
      </p>
      
      <div class="connection-info">
        <div class="info-item">
          <span class="label">主机:</span>
          <span class="value">{{ dataSource.connection.host }}</span>
        </div>
        <div class="info-item">
          <span class="label">数据库:</span>
          <span class="value">{{ dataSource.connection.database }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户:</span>
          <span class="value">{{ dataSource.connection.username }}</span>
        </div>
      </div>
      
      <div class="metadata">
        <span class="create-time">
          {{ formatTime(dataSource.createdAt) }}
        </span>
        <span v-if="dataSource.lastTestedAt" class="last-tested">
          最后测试: {{ formatTime(dataSource.lastTestedAt) }}
        </span>
      </div>
    </div>
    
    <!-- 卡片底部 -->
    <div class="card-footer">
      <div class="actions">
        <el-tooltip content="测试连接" placement="top">
          <el-button 
            size="small" 
            :icon="Connection"
            @click="$emit('test', dataSource)"
            :loading="testing"
          />
        </el-tooltip>
        
        <el-tooltip content="查看详情" placement="top">
          <el-button 
            size="small" 
            :icon="View"
            @click="$emit('view-detail', dataSource)"
          />
        </el-tooltip>
        
        <el-tooltip content="编辑" placement="top">
          <el-button 
            size="small" 
            :icon="Edit"
            @click="$emit('edit', dataSource)"
          />
        </el-tooltip>
        
        <el-dropdown 
          trigger="click" 
          @command="handleDropdownCommand"
          size="small"
        >
          <el-button size="small" :icon="More" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                :command="{ action: 'toggle-status', dataSource }"
                :icon="dataSource.status === 'ACTIVE' ? SwitchButton : Check"
              >
                {{ dataSource.status === 'ACTIVE' ? '停用' : '激活' }}
              </el-dropdown-item>
              <el-dropdown-item 
                :command="{ action: 'delete', dataSource }"
                :icon="Delete"
                divided
              >
                删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <div class="tags" v-if="dataSource.tags && dataSource.tags.length > 0">
        <el-tag 
          v-for="tag in dataSource.tags.slice(0, 2)" 
          :key="tag"
          size="small"
          effect="plain"
        >
          {{ tag }}
        </el-tag>
        <el-tag 
          v-if="dataSource.tags.length > 2" 
          size="small"
          effect="plain"
        >
          +{{ dataSource.tags.length - 2 }}
        </el-tag>
      </div>
    </div>
    
    <!-- 错误信息提示 -->
    <div v-if="dataSource.status === 'ERROR' && dataSource.errorMessage" class="error-message">
      <el-alert
        :title="dataSource.errorMessage"
        type="error"
        :closable="false"
        show-icon
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Connection, 
  View, 
  Edit, 
  More, 
  SwitchButton, 
  Check, 
  Delete 
} from '@element-plus/icons-vue'
import type { DataSource } from '@/types/datasource'

interface Props {
  dataSource: DataSource
}

interface Emits {
  (e: 'edit', dataSource: DataSource): void
  (e: 'delete', dataSource: DataSource): void
  (e: 'test', dataSource: DataSource): void
  (e: 'toggle-status', dataSource: DataSource): void
  (e: 'view-detail', dataSource: DataSource): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const testing = ref(false)

// 计算属性
const typeLabel = computed(() => {
  const typeMap: Record<string, string> = {
    'MYSQL': 'MySQL',
    'POSTGRESQL': 'PostgreSQL',
    'CLICKHOUSE': 'ClickHouse',
    'ORACLE': 'Oracle',
    'SQLSERVER': 'SQL Server',
    'REDIS': 'Redis',
    'MONGODB': 'MongoDB',
    'ELASTICSEARCH': 'Elasticsearch',
    'API': 'API接口',
    'FILE': '文件'
  }
  return typeMap[props.dataSource.type] || props.dataSource.type
})

const typeIconClass = computed(() => {
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
  return iconMap[props.dataSource.type] || 'el-icon-question'
})

const statusClass = computed(() => {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'active',
    'INACTIVE': 'inactive',
    'ERROR': 'error',
    'TESTING': 'testing'
  }
  return statusMap[props.dataSource.status] || 'unknown'
})

const cardClass = computed(() => ({
  'card-active': props.dataSource.status === 'ACTIVE',
  'card-inactive': props.dataSource.status === 'INACTIVE',
  'card-error': props.dataSource.status === 'ERROR'
}))

// 方法
const handleDropdownCommand = (command: { action: string; dataSource: DataSource }) => {
  switch (command.action) {
    case 'toggle-status':
      emit('toggle-status', command.dataSource)
      break
    case 'delete':
      emit('delete', command.dataSource)
      break
  }
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  return date.toLocaleDateString('zh-CN')
}

// 处理测试连接
const handleTestConnection = async () => {
  testing.value = true
  try {
    emit('test', props.dataSource)
  } finally {
    testing.value = false
  }
}
</script>

<style scoped lang="scss">
.data-source-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-normal);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    border-color: var(--color-border-secondary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  &.card-active {
    border-left: 4px solid var(--color-success);
  }
  
  &.card-inactive {
    border-left: 4px solid var(--color-warning);
  }
  
  &.card-error {
    border-left: 4px solid var(--color-error);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border-primary);
    gap: var(--space-3);
    
    .type-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 1.5rem;
        color: white;
      }
    }
    
    .header-content {
      flex: 1;
      min-width: 0;
      
      .data-source-name {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        margin: 0 0 var(--space-1) 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .data-source-type {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        background: var(--color-bg-tertiary);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-sm);
      }
    }
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.active {
        background: var(--color-success);
        box-shadow: 0 0 6px var(--color-success);
      }
      
      &.inactive {
        background: var(--color-warning);
        box-shadow: 0 0 6px var(--color-warning);
      }
      
      &.error {
        background: var(--color-error);
        box-shadow: 0 0 6px var(--color-error);
      }
      
      &.testing {
        background: var(--color-info);
        animation: pulse 2s infinite;
      }
    }
  }
  
  .card-content {
    flex: 1;
    padding: var(--space-4);
    
    .data-source-description {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin: 0 0 var(--space-3) 0;
      line-height: var(--line-height-normal);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .connection-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--space-2);
        font-size: var(--font-size-sm);
        
        .label {
          color: var(--color-text-tertiary);
          font-weight: var(--font-weight-medium);
        }
        
        .value {
          color: var(--color-text-secondary);
          font-family: var(--font-family-accent);
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    
    .metadata {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-primary);
      
      .create-time,
      .last-tested {
        font-size: var(--font-size-xs);
        color: var(--color-text-muted);
      }
    }
  }
  
  .card-footer {
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--color-border-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .actions {
      display: flex;
      gap: var(--space-1);
      
      :deep(.el-button) {
        background: transparent;
        border: 1px solid var(--color-border-primary);
        color: var(--color-text-secondary);
        
        &:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: rgba(99, 102, 241, 0.1);
        }
      }
    }
    
    .tags {
      display: flex;
      gap: var(--space-1);
      
      :deep(.el-tag) {
        background: transparent;
        border-color: var(--color-border-primary);
        color: var(--color-text-secondary);
        
        &:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
      }
    }
  }
  
  .error-message {
    padding: var(--space-3) var(--space-4);
    background: rgba(239, 68, 68, 0.1);
    border-top: 1px solid var(--color-error);
    
    :deep(.el-alert) {
      background: transparent;
      padding: 0;
      
      .el-alert__content {
        padding: 0;
      }
      
      .el-alert__title {
        font-size: var(--font-size-sm);
        color: var(--color-error);
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .data-source-card {
    .card-header {
      padding: var(--space-3);
      
      .type-icon {
        width: 32px;
        height: 32px;
        
        i {
          font-size: 1.2rem;
        }
      }
      
      .header-content {
        .data-source-name {
          font-size: var(--font-size-base);
        }
      }
    }
    
    .card-content {
      padding: var(--space-3);
      
      .connection-info {
        .info-item {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--space-1);
          
          .value {
            max-width: 100%;
          }
        }
      }
    }
    
    .card-footer {
      flex-direction: column;
      gap: var(--space-2);
      align-items: stretch;
      
      .actions {
        justify-content: center;
      }
      
      .tags {
        justify-content: center;
      }
    }
  }
}
</style>