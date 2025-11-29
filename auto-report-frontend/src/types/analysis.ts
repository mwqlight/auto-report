// 图表类型定义
export interface ChartConfig {
  type: string
  title?: string
  xAxis?: {
    field: string
    type?: 'category' | 'value' | 'time'
    name?: string
  }
  yAxis?: {
    field: string
    type?: 'value'
    name?: string
  }
  series?: Array<{
    type: string
    field: string
    name?: string
    stack?: string
  }>
  dimensions?: string[]
  measures?: string[]
  filters?: Array<{
    field: string
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'like' | 'notLike'
    value: any
  }>
  sort?: Array<{
    field: string
    order: 'asc' | 'desc'
  }>
  limit?: number
  groupBy?: string[]
  aggregations?: Array<{
    field: string
    type: 'count' | 'sum' | 'avg' | 'max' | 'min' | 'distinct'
    alias?: string
  }>
}

// 图表数据接口
export interface ChartData {
  columns: Array<{
    name: string
    type: string
  }>
  rows: any[]
  total?: number
  summary?: any
}

// 图表基础信息
export interface AnalysisChart {
  id: number
  name: string
  type: string
  datasetId: number
  datasetName?: string
  config: ChartConfig
  description?: string
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  lastRefreshAt?: string
  refreshInterval?: number
  status: 'active' | 'inactive' | 'error'
  errorMessage?: string
  viewCount: number
  favoriteCount: number
  tags?: string[]
}

// 仪表板布局配置
export interface DashboardLayout {
  type: 'grid' | 'free'
  rows: number
  cols: number
  items: Array<{
    id: string
    chartId: number
    x: number
    y: number
    w: number
    h: number
    minW?: number
    minH?: number
    maxW?: number
    maxH?: number
  }>
}

// 仪表板信息
export interface AnalysisDashboard {
  id: number
  name: string
  description?: string
  layout: DashboardLayout
  charts: AnalysisChart[]
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  viewCount: number
  favoriteCount: number
  tags?: string[]
  theme?: string
  background?: string
}

// 图表类型选项
export interface ChartTypeOption {
  value: string
  label: string
  icon: string
  category: 'basic' | 'statistical' | 'map' | 'advanced' | 'custom'
  description: string
  dimensions: number
  measures: number
  supportedAggregations: string[]
}

// 数据集字段信息
export interface DatasetField {
  name: string
  type: string
  label?: string
  description?: string
  isNullable: boolean
  isPrimaryKey: boolean
  isForeignKey: boolean
  sampleData?: any[]
  statistics?: {
    count: number
    distinctCount: number
    nullCount: number
    min?: any
    max?: any
    avg?: number
  }
}

// 图表预览请求
export interface ChartPreviewRequest {
  datasetId: number
  config: ChartConfig
  filters?: any
  limit?: number
}

// 图表预览响应
export interface ChartPreviewResponse {
  success: boolean
  data?: ChartData
  error?: string
  executionTime: number
  sql?: string
}

// 图表统计信息
export interface ChartStats {
  chartId: number
  totalViews: number
  uniqueViews: number
  avgViewTime: number
  lastViewedAt?: string
  favoriteCount: number
  shareCount: number
  errorRate: number
  refreshSuccessRate: number
  avgExecutionTime: number
  dataPoints: number
}

// 仪表板统计信息
export interface DashboardStats {
  dashboardId: number
  totalViews: number
  uniqueViews: number
  avgViewTime: number
  lastViewedAt?: string
  favoriteCount: number
  shareCount: number
  chartCount: number
  activeCharts: number
}

// 图表查询参数
export interface ChartQueryParams {
  page?: number
  size?: number
  keyword?: string
  type?: string
  datasetId?: number
  status?: string
  isPublic?: boolean
  createdBy?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

// 仪表板查询参数
export interface DashboardQueryParams {
  page?: number
  size?: number
  keyword?: string
  isPublic?: boolean
  createdBy?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

// 图表创建请求
export interface CreateChartRequest {
  name: string
  type: string
  datasetId: number
  config: ChartConfig
  description?: string
  isPublic?: boolean
  tags?: string[]
}

// 仪表板创建请求
export interface CreateDashboardRequest {
  name: string
  description?: string
  layout: DashboardLayout
  charts: number[]
  isPublic?: boolean
  tags?: string[]
  theme?: string
  background?: string
}

// 图表更新请求
export interface UpdateChartRequest {
  name?: string
  config?: ChartConfig
  description?: string
  isPublic?: boolean
  tags?: string[]
  refreshInterval?: number
}

// 仪表板更新请求
export interface UpdateDashboardRequest {
  name?: string
  description?: string
  layout?: DashboardLayout
  charts?: number[]
  isPublic?: boolean
  tags?: string[]
  theme?: string
  background?: string
}

// 图表操作结果
export interface ChartOperationResult {
  success: boolean
  message: string
  data?: AnalysisChart
  error?: string
}

// 仪表板操作结果
export interface DashboardOperationResult {
  success: boolean
  message: string
  data?: AnalysisDashboard
  error?: string
}

// 图表数据导出选项
export interface ChartExportOptions {
  format: 'csv' | 'excel' | 'json'
  includeHeaders?: boolean
  filename?: string
  sheetName?: string
}

// 可视化分析统计信息
export interface AnalysisStats {
  totalCharts: number
  totalDashboards: number
  activeCharts: number
  chartsByType: Array<{
    type: string
    count: number
  }>
  popularCharts: AnalysisChart[]
  recentDashboards: AnalysisDashboard[]
  dataRefreshStats: {
    successRate: number
    avgExecutionTime: number
    lastRefreshAt: string
  }
}