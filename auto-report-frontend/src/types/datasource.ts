// 数据源类型枚举
export type DataSourceType = 
  | 'MYSQL'
  | 'POSTGRESQL'
  | 'CLICKHOUSE'
  | 'ORACLE'
  | 'SQLSERVER'
  | 'REDIS'
  | 'MONGODB'
  | 'ELASTICSEARCH'
  | 'API'
  | 'FILE'

// 数据源状态枚举
export type DataSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING'

// 数据源连接参数
export interface DataSourceConnection {
  host: string
  port: number
  database: string
  username: string
  password: string
  schema?: string
  ssl?: boolean
  timeout?: number
  maxConnections?: number
  connectionString?: string
  additionalParams?: Record<string, string>
}

// 数据源基本信息
export interface DataSource {
  id: string
  name: string
  description?: string
  type: DataSourceType
  status: DataSourceStatus
  connection: DataSourceConnection
  workspaceId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastTestedAt?: string
  errorMessage?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// 连接测试结果
export interface ConnectionTestResult {
  success: boolean
  message: string
  error?: string
  connectionTime?: number
  databaseVersion?: string
  maxConnections?: number
  activeConnections?: number
  timestamp: string
}

// 数据源创建请求
export interface CreateDataSourceRequest {
  name: string
  description?: string
  type: DataSourceType
  connection: DataSourceConnection
  workspaceId: string
  tags?: string[]
}

// 数据源更新请求
export interface UpdateDataSourceRequest {
  name?: string
  description?: string
  connection?: Partial<DataSourceConnection>
  status?: DataSourceStatus
  tags?: string[]
}

// 数据源列表查询参数
export interface DataSourceQueryParams {
  page?: number
  pageSize?: number
  type?: DataSourceType
  status?: DataSourceStatus
  search?: string
  workspaceId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 数据源统计信息
export interface DataSourceStats {
  total: number
  byType: Record<DataSourceType, number>
  byStatus: Record<DataSourceStatus, number>
  activeConnections: number
  totalQueries: number
  avgQueryTime: number
}

// 数据源连接池信息
export interface ConnectionPoolInfo {
  activeConnections: number
  idleConnections: number
  maxConnections: number
  waitingConnections: number
  connectionTimeout: number
  lastActivity: string
}

// 数据源性能指标
export interface DataSourceMetrics {
  queryCount: number
  avgResponseTime: number
  errorRate: number
  throughput: number
  connectionPoolUsage: number
  lastUpdated: string
}

// 数据源测试历史
export interface ConnectionTestHistory {
  id: string
  dataSourceId: string
  success: boolean
  message: string
  connectionTime?: number
  error?: string
  timestamp: string
}

// 数据源同步配置
export interface DataSourceSyncConfig {
  enabled: boolean
  syncInterval: number // 分钟
  lastSyncAt?: string
  nextSyncAt?: string
  syncStatus: 'idle' | 'syncing' | 'error'
  errorMessage?: string
}

// 数据源权限
export interface DataSourcePermission {
  userId: string
  dataSourceId: string
  permission: 'read' | 'write' | 'admin'
  grantedAt: string
  grantedBy: string
}

// API响应类型
export interface DataSourceListResponse {
  data: DataSource[]
  total: number
  page: number
  pageSize: number
  stats: DataSourceStats
}

export interface DataSourceDetailResponse {
  data: DataSource
  connectionPoolInfo?: ConnectionPoolInfo
  metrics?: DataSourceMetrics
  testHistory?: ConnectionTestHistory[]
  syncConfig?: DataSourceSyncConfig
}

export interface ConnectionTestResponse {
  data: ConnectionTestResult
}

export interface DataSourceCreateResponse {
  data: DataSource
  connectionTest: ConnectionTestResult
}

export interface DataSourceUpdateResponse {
  data: DataSource
}

// 数据源类型配置
export interface DataSourceTypeConfig {
  type: DataSourceType
  label: string
  icon: string
  defaultPort: number
  supportedFeatures: string[]
  connectionFields: ConnectionField[]
  validationRules: ValidationRule[]
}

// 连接字段定义
export interface ConnectionField {
  name: string
  label: string
  type: 'text' | 'password' | 'number' | 'select' | 'checkbox'
  required: boolean
  placeholder?: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  validation?: string
  helpText?: string
}

// 验证规则
export interface ValidationRule {
  field: string
  rule: string
  message: string
}

// 数据源操作日志
export interface DataSourceOperationLog {
  id: string
  dataSourceId: string
  operation: 'create' | 'update' | 'delete' | 'test' | 'sync'
  userId: string
  details?: Record<string, any>
  ipAddress?: string
  timestamp: string
}

// 数据源导入/导出配置
export interface DataSourceImportExport {
  format: 'json' | 'yaml'
  includeSensitiveData: boolean
  includeMetadata: boolean
  includePermissions: boolean
}

// 批量操作结果
export interface BatchOperationResult {
  total: number
  success: number
  failed: number
  errors: Array<{
    dataSourceId: string
    error: string
  }>
}