/**
 * AI分析请求参数
 */
export interface AiAnalysisRequest {
  datasetId: string
  question: string
  analysisType?: 'trend' | 'correlation' | 'anomaly' | 'prediction' | 'custom'
  timeRange?: {
    start: string
    end: string
  }
  dimensions?: string[]
  metrics?: string[]
  filters?: Array<{
    field: string
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'like'
    value: any
  }>
  modelConfig?: {
    model: string
    temperature?: number
    maxTokens?: number
  }
}

/**
 * AI分析响应结果
 */
export interface AiAnalysisResponse {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: {
    summary: string
    insights: AiInsightItem[]
    charts?: Array<{
      type: string
      title: string
      data: any
      config: any
    }>
    recommendations?: string[]
    confidence: number
  }
  error?: string
  createdAt: string
  updatedAt: string
}

/**
 * 数据洞察请求
 */
export interface AiInsightRequest {
  datasetId: string
  insightType?: 'trend' | 'pattern' | 'outlier' | 'correlation' | 'seasonality'
  focusAreas?: string[]
  timeGranularity?: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  confidenceThreshold?: number
}

/**
 * 数据洞察响应
 */
export interface AiInsightResponse {
  insights: AiInsightItem[]
  summary: string
  confidence: number
  processingTime: number
}

/**
 * 洞察项
 */
export interface AiInsightItem {
  id: string
  title: string
  description: string
  type: 'trend' | 'pattern' | 'outlier' | 'correlation' | 'seasonality' | 'prediction'
  confidence: number
  impact: 'high' | 'medium' | 'low'
  dataPoints: Array<{
    dimension: string
    metric: string
    value: any
    timestamp?: string
  }>
  visualization?: {
    type: string
    data: any
    config: any
  }
  recommendations?: string[]
  tags?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 智能推荐请求
 */
export interface AiRecommendationRequest {
  datasetId: string
  recommendationType?: 'chart' | 'dashboard' | 'analysis' | 'optimization'
  context?: {
    currentCharts?: string[]
    userPreferences?: any
    businessGoals?: string[]
  }
}

/**
 * 智能推荐响应
 */
export interface AiRecommendationResponse {
  recommendations: Array<{
    type: 'chart' | 'dashboard' | 'analysis' | 'optimization'
    title: string
    description: string
    confidence: number
    implementation?: {
      chartType?: string
      dimensions?: string[]
      metrics?: string[]
      filters?: any[]
      layout?: any
    }
    benefits?: string[]
    effort: 'low' | 'medium' | 'high'
  }>
}

/**
 * 对话式分析请求
 */
export interface AiConversationRequest {
  conversationId?: string
  message: string
  context?: {
    datasetId?: string
    currentChart?: string
    previousMessages?: Array<{
      role: 'user' | 'assistant'
      content: string
      timestamp: string
    }>
  }
  modelConfig?: {
    model: string
    temperature?: number
    maxTokens?: number
  }
}

/**
 * 对话式分析响应
 */
export interface AiConversationResponse {
  conversationId: string
  message: string
  analysis?: {
    summary: string
    insights?: AiInsightItem[]
    charts?: Array<{
      type: string
      title: string
      data: any
      config: any
    }>
  }
  suggestions?: string[]
  timestamp: string
}

/**
 * AI模型配置
 */
export interface AiModelConfig {
  defaultModel: string
  availableModels: Array<{
    name: string
    provider: 'openai' | 'azure' | 'anthropic' | 'local'
    description: string
    capabilities: string[]
    maxTokens: number
    temperatureRange: {
      min: number
      max: number
      default: number
    }
    costPerToken?: number
    enabled: boolean
  }>
  apiConfig: {
    baseUrl?: string
    apiKey?: string
    timeout: number
    retryAttempts: number
  }
  analysisSettings: {
    maxProcessingTime: number
    confidenceThreshold: number
    autoSaveInsights: boolean
    enableRealTimeAnalysis: boolean
  }
}

/**
 * AI分析任务
 */
export interface AiAnalysisTask {
  id: string
  datasetId: string
  datasetName: string
  question: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress?: number
  result?: AiAnalysisResponse['result']
  error?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  createdBy: string
}

/**
 * AI分析会话状态
 */
export interface AiConversationState {
  conversationId: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    analysis?: AiAnalysisResponse['result']
  }>
  context: {
    datasetId?: string
    currentChart?: string
    userPreferences?: any
  }
  isLoading: boolean
  error?: string
}

/**
 * AI分析历史记录
 */
export interface AiAnalysisHistory {
  id: string
  datasetId: string
  datasetName: string
  question: string
  analysisType: string
  resultSummary: string
  confidence: number
  insightsCount: number
  createdAt: string
  duration: number
}

/**
 * AI分析统计信息
 */
export interface AiAnalysisStats {
  totalAnalyses: number
  successfulAnalyses: number
  averageConfidence: number
  mostUsedModels: Array<{
    model: string
    count: number
    successRate: number
  }>
  insightsByType: Record<string, number>
  dailyUsage: Array<{
    date: string
    count: number
  }>
}

/**
 * AI服务健康状态
 */
export interface AiServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  connectedModels: string[]
  lastCheck: string
  responseTime: number
  errors: Array<{
    model: string
    error: string
    timestamp: string
  }>
}

/**
 * AI分析配置表单
 */
export interface AiAnalysisForm {
  datasetId: string
  question: string
  analysisType: string
  timeRange?: {
    start: string
    end: string
  }
  dimensions: string[]
  metrics: string[]
  filters: Array<{
    field: string
    operator: string
    value: any
  }>
  modelConfig: {
    model: string
    temperature: number
    maxTokens: number
  }
}

/**
 * AI洞察过滤器
 */
export interface AiInsightFilter {
  type?: string[]
  confidence?: {
    min: number
    max: number
  }
  impact?: string[]
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
}