import { request } from '@/utils/request'
import type { 
  AiAnalysisRequest, 
  AiAnalysisResponse,
  AiInsightRequest,
  AiInsightResponse,
  AiRecommendationRequest,
  AiRecommendationResponse,
  AiConversationRequest,
  AiConversationResponse,
  AiModelConfig,
  AiAnalysisTask,
  AiInsightItem
} from '@/types/ai'

/**
 * AI增强分析API接口
 */
export class AiApi {
  
  /**
   * 智能分析数据
   */
  static async analyzeData(params: AiAnalysisRequest): Promise<AiAnalysisResponse> {
    return request.post('/api/v1/ai/analyze', params)
  }

  /**
   * 获取数据洞察
   */
  static async getInsights(params: AiInsightRequest): Promise<AiInsightResponse> {
    return request.post('/api/v1/ai/insights', params)
  }

  /**
   * 获取智能推荐
   */
  static async getRecommendations(params: AiRecommendationRequest): Promise<AiRecommendationResponse> {
    return request.post('/api/v1/ai/recommendations', params)
  }

  /**
   * 对话式分析
   */
  static async chatAnalysis(params: AiConversationRequest): Promise<AiConversationResponse> {
    return request.post('/api/v1/ai/chat', params)
  }

  /**
   * 获取AI模型配置
   */
  static async getModelConfig(): Promise<AiModelConfig> {
    return request.get('/api/v1/ai/config')
  }

  /**
   * 更新AI模型配置
   */
  static async updateModelConfig(config: AiModelConfig): Promise<void> {
    return request.put('/api/v1/ai/config', config)
  }

  /**
   * 获取分析任务列表
   */
  static async getTasks(): Promise<AiAnalysisTask[]> {
    return request.get('/api/v1/ai/tasks')
  }

  /**
   * 获取分析任务详情
   */
  static async getTaskDetail(taskId: string): Promise<AiAnalysisTask> {
    return request.get(`/api/v1/ai/tasks/${taskId}`)
  }

  /**
   * 取消分析任务
   */
  static async cancelTask(taskId: string): Promise<void> {
    return request.post(`/api/v1/ai/tasks/${taskId}/cancel`)
  }

  /**
   * 删除分析任务
   */
  static async deleteTask(taskId: string): Promise<void> {
    return request.delete(`/api/v1/ai/tasks/${taskId}`)
  }

  /**
   * 获取历史洞察记录
   */
  static async getHistoryInsights(params: {
    datasetId?: string
    startTime?: string
    endTime?: string
    page?: number
    size?: number
  }): Promise<{
    items: AiInsightItem[]
    total: number
  }> {
    return request.get('/api/v1/ai/insights/history', { params })
  }

  /**
   * 保存洞察结果
   */
  static async saveInsight(insight: Omit<AiInsightItem, 'id' | 'createdAt'>): Promise<AiInsightItem> {
    return request.post('/api/v1/ai/insights', insight)
  }

  /**
   * 更新洞察结果
   */
  static async updateInsight(insightId: string, insight: Partial<AiInsightItem>): Promise<AiInsightItem> {
    return request.put(`/api/v1/ai/insights/${insightId}`, insight)
  }

  /**
   * 删除洞察结果
   */
  static async deleteInsight(insightId: string): Promise<void> {
    return request.delete(`/api/v1/ai/insights/${insightId}`)
  }

  /**
   * 导出洞察结果
   */
  static async exportInsight(insightId: string): Promise<Blob> {
    return request.get(`/api/v1/ai/insights/${insightId}/export`, {
      responseType: 'blob'
    })
  }

  /**
   * 获取相似洞察
   */
  static async getSimilarInsights(insightId: string): Promise<AiInsightItem[]> {
    return request.get(`/api/v1/ai/insights/${insightId}/similar`)
  }

  /**
   * 验证AI服务连接
   */
  static async checkConnection(): Promise<{ connected: boolean; message?: string }> {
    return request.get('/api/v1/ai/health')
  }

  /**
   * 获取支持的AI模型列表
   */
  static async getSupportedModels(): Promise<string[]> {
    return request.get('/api/v1/ai/models')
  }

  /**
   * 测试AI模型响应
   */
  static async testModel(modelName: string, testData: string): Promise<{ success: boolean; response?: string }> {
    return request.post('/api/v1/ai/models/test', {
      model: modelName,
      data: testData
    })
  }
}