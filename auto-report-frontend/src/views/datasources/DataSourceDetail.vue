<template>
  <div class="data-source-detail">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1>{{ dataSource.name }}</h1>
          <div class="status-badge" :class="dataSource.status">
            {{ getStatusText(dataSource.status) }}
          </div>
        </div>
        <p class="subtitle">数据源详细信息</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="editDataSource">编辑</button>
        <button class="btn-primary" @click="testConnection">测试连接</button>
      </div>
    </div>
    
    <div class="detail-content">
      <div class="info-grid">
        <div class="info-card">
          <h3>基本信息</h3>
          <div class="info-item">
            <label>数据源ID</label>
            <span>{{ dataSource.id }}</span>
          </div>
          <div class="info-item">
            <label>类型</label>
            <span>{{ getTypeText(dataSource.type) }}</span>
          </div>
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ dataSource.createTime }}</span>
          </div>
          <div class="info-item">
            <label>更新时间</label>
            <span>{{ dataSource.updateTime }}</span>
          </div>
        </div>
        
        <div class="info-card">
          <h3>连接信息</h3>
          <div class="info-item">
            <label>主机地址</label>
            <span>{{ dataSource.host }}</span>
          </div>
          <div class="info-item">
            <label>端口</label>
            <span>{{ dataSource.port }}</span>
          </div>
          <div class="info-item">
            <label>数据库名</label>
            <span>{{ dataSource.database }}</span>
          </div>
          <div class="info-item">
            <label>用户名</label>
            <span>{{ dataSource.username }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-section">
        <h3>使用统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ dataSource.stats.tableCount }}</div>
            <div class="stat-label">数据表</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ dataSource.stats.datasetCount }}</div>
            <div class="stat-label">数据集</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ dataSource.stats.lastUsed }}</div>
            <div class="stat-label">最后使用</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface DataSource {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'error'
  host: string
  port: number
  database: string
  username: string
  createTime: string
  updateTime: string
  stats: {
    tableCount: number
    datasetCount: number
    lastUsed: string
  }
}

const dataSource = ref<DataSource>({
  id: '',
  name: '',
  type: '',
  status: 'active',
  host: '',
  port: 3306,
  database: '',
  username: '',
  createTime: '',
  updateTime: '',
  stats: {
    tableCount: 0,
    datasetCount: 0,
    lastUsed: ''
  }
})

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '未激活',
    error: '错误'
  }
  return statusMap[status] || status
}

// 获取类型文本
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    mysql: 'MySQL',
    postgresql: 'PostgreSQL',
    oracle: 'Oracle',
    sqlserver: 'SQL Server'
  }
  return typeMap[type] || type
}

// 加载数据源详情
const loadDataSourceDetail = () => {
  const id = route.params.id as string
  // 模拟数据
  dataSource.value = {
    id,
    name: `数据源-${id}`,
    type: 'mysql',
    status: 'active',
    host: 'localhost',
    port: 3306,
    database: 'test_db',
    username: 'root',
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-15 14:30:00',
    stats: {
      tableCount: 25,
      datasetCount: 8,
      lastUsed: '2小时前'
    }
  }
}

// 编辑数据源
const editDataSource = () => {
  router.push(`/datasources/${dataSource.value.id}/edit`)
}

// 测试连接
const testConnection = () => {
  console.log('测试连接:', dataSource.value)
  // TODO: 调用测试连接API
}

onMounted(() => {
  loadDataSourceDetail()
})
</script>

<style scoped>
.data-source-detail {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--color-success);
  color: white;
}

.status-badge.inactive {
  background: var(--color-warning);
  color: white;
}

.status-badge.error {
  background: var(--color-error);
  color: white;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-card {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
}

.info-card h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border-primary);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info-item span {
  color: var(--color-text-primary);
}

.stats-section {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
}

.stats-section h3 {
  margin: 0 0 1rem 0;
  color: var(--color-text-primary);
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--color-bg-primary);
  border-radius: 4px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
</style>