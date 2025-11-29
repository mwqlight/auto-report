/**
 * 数据集类型定义
 */

/**
 * 数据集基础信息
 */
export interface Dataset {
  id: string
  name: string
  description?: string
  type: 'sql' | 'file' | 'api' | 'custom'
  dataSourceId?: string
  sqlQuery?: string
  filePath?: string
  apiEndpoint?: string
  status: 'active' | 'inactive' | 'error'
  rowCount: number
  columnCount: number
  memoryUsage: string
  lastUpdated: string
  createdBy: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  isPublic: boolean
  permissions?: DatasetPermission[]
  schema?: DatasetColumn[]
  statistics?: DatasetStatistics
}

/**
 * 数据集列定义
 */
export interface DatasetColumn {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'timestamp'
  nullable: boolean
  defaultValue?: any
  description?: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  foreignTable?: string
  foreignColumn?: string
  statistics?: ColumnStatistics
}

/**
 * 列统计信息
 */
export interface ColumnStatistics {
  distinctCount: number
  nullCount: number
  minValue?: any
  maxValue?: any
  meanValue?: number
  medianValue?: number
  stdDeviation?: number
  histogram?: Array<{
    bucket: string
    count: number
    frequency: number
  }>
}

/**
 * 数据集统计信息
 */
export interface DatasetStatistics {
  totalRows: number
  totalColumns: number
  totalSize: string
  lastRefreshTime: string
  refreshDuration: number
  dataQuality: {
    completeness: number
    accuracy: number
    consistency: number
    timeliness: number
    overallScore: number
  }
  columnStats: Record<string, ColumnStatistics>
}

/**
 * 数据集权限
 */
export interface DatasetPermission {
  userId: string
  userName: string
  permission: 'read' | 'write' | 'admin'
  grantedAt: string
  grantedBy: string
}

/**
 * 创建数据集请求
 */
export interface DatasetCreateRequest {
  name: string
  description?: string
  type: 'sql' | 'file' | 'api' | 'custom'
  dataSourceId?: string
  sqlQuery?: string
  file?: File
  apiConfig?: ApiConfig
  tags?: string[]
  isPublic?: boolean
  permissions?: DatasetPermission[]
}

/**
 * 更新数据集请求
 */
export interface DatasetUpdateRequest {
  name?: string
  description?: string
  sqlQuery?: string
  tags?: string[]
  isPublic?: boolean
  permissions?: DatasetPermission[]
}

/**
 * API配置
 */
export interface ApiConfig {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  parameters?: Record<string, any>
  body?: any
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key'
    credentials?: Record<string, string>
  }
}

/**
 * 数据集查询参数
 */
export interface DatasetQueryParams {
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  type?: string
  status?: string
  dataSourceId?: string
  tags?: string[]
  isPublic?: boolean
  createdBy?: string
}

/**
 * 数据集预览结果
 */
export interface DatasetPreview {
  columns: Array<{
    name: string
    type: string
    sampleData: any[]
  }>
  data: any[]
  total: number
  hasMore: boolean
}

/**
 * SQL执行结果
 */
export interface SqlExecutionResult {
  success: boolean
  data?: any[]
  columns?: Array<{
    name: string
    type: string
  }>
  executionTime: number
  rowCount: number
  error?: string
}

/**
 * 数据集操作日志
 */
export interface DatasetLog {
  id: string
  datasetId: string
  datasetName: string
  operation: 'create' | 'update' | 'delete' | 'refresh' | 'export' | 'import'
  operator: string
  operatorName: string
  timestamp: string
  details: string
  ipAddress?: string
  userAgent?: string
}

/**
 * 数据集质量评估
 */
export interface DataQualityAssessment {
  datasetId: string
  assessmentDate: string
  overallScore: number
  dimensions: Array<{
    dimension: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity'
    score: number
    issues: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      affectedRows: number
      suggestion: string
    }>
  }>
  recommendations: string[]
}

/**
 * 数据集血缘关系
 */
export interface DataLineage {
  datasetId: string
  upstream: Array<{
    id: string
    name: string
    type: string
    relationship: 'source' | 'derived' | 'transformed'
    transformation?: string
  }>
  downstream: Array<{
    id: string
    name: string
    type: string
    relationship: 'consumer' | 'dependent' | 'reference'
    usage: string
  }>
}

/**
 * 数据集版本信息
 */
export interface DatasetVersion {
  version: string
  datasetId: string
  changes: string
  createdBy: string
  createdAt: string
  snapshot?: Dataset
  rollbackSupported: boolean
}

/**
 * 数据集监控指标
 */
export interface DatasetMetrics {
  datasetId: string
  timestamp: string
  rowCount: number
  sizeBytes: number
  queryCount: number
  errorCount: number
  avgQueryTime: number
  lastQueryTime: string
  activeUsers: number
  cacheHitRate: number
}

/**
 * 数据集缓存配置
 */
export interface CacheConfig {
  enabled: boolean
  ttl: number // 缓存时间（秒）
  refreshStrategy: 'lazy' | 'eager' | 'manual'
  maxSize: number // 最大缓存大小（MB）
  compression: boolean
}

/**
 * 数据集安全配置
 */
export interface SecurityConfig {
  encryption: {
    enabled: boolean
    algorithm: string
    keyRotation: boolean
  }
  masking: {
    enabled: boolean
    rules: Array<{
      column: string
      method: 'hash' | 'mask' | 'redact' | 'tokenize'
      pattern?: string
    }>
  }
  accessControl: {
    rowLevel: boolean
    columnLevel: boolean
    dynamicFiltering: boolean
  }
}