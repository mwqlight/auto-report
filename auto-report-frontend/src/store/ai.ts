import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AiApi } from '@/api/ai'
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
  AiInsightItem,
  AiConversationState,
  AiAnalysisHistory,
  AiAnalysisStats,
  AiServiceHealth
} from '@/types/ai'

/**
 * AI增强分析Store
 */
export const useAiStore = defineStore('ai', () => {
  // 状态
  const analysisTasks = ref<AiAnalysisTask[]>([])
  const currentTask = ref<AiAnalysisTask | null>(null)
  const insights = ref<AiInsightItem[]>([])
  const conversationState = ref<AiConversationState | null>(null)
  const modelConfig = ref<AiModelConfig | null>(null)
  const analysisHistory = ref<AiAnalysisHistory[]>([])
  const analysisStats = ref<AiAnalysisStats | null>(null)
  const serviceHealth = ref<AiServiceHealth | null>(null)
  
  // 加载状态
  const loading = ref({
    analysis: false,
    insights: false,
    conversation: false,
    config: false,
    history: false,
    stats: false,
    health: false
  })

  // 错误状态
  const error = ref<string | null>(null)

  // 计算属性
  const completedTasks = computed(() => 
    analysisTasks.value.filter(task => task.status === 'completed')
  )

  const pendingTasks = computed(() => 
    analysisTasks.value.filter(task => task.status === 'pending' || task.status === 'processing')
  )

  const highConfidenceInsights = computed(() => 
    insights.value.filter(insight => insight.confidence >= 0.8)
  )

  const highImpactInsights = computed(() => 
    insights.value.filter(insight => insight.impact === 'high')
  )

  const insightsByType = computed(() => {
    const grouped: Record<string, AiInsightItem[]> = {}
    insights.value.forEach(insight => {
      if (!grouped[insight.type]) {
        grouped[insight.type] = []
      }
      grouped[insight.type].push(insight)
    })
    return grouped
  })

  // Actions
  
  /**
   * 执行AI分析
   */
  async function analyzeData(params: AiAnalysisRequest): Promise<AiAnalysisResponse> {
    loading.value.analysis = true
    error.value = null
    
    try {
      const response = await AiApi.analyzeData(params)
      
      // 添加到任务列表
      if (response.taskId) {
        const task: AiAnalysisTask = {
          id: response.taskId,
          datasetId: params.datasetId,
          datasetName: '', // 需要从数据集获取
          question: params.question,
          status: response.status,
          progress: 0,
          result: response.result,
          error: response.error,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
          createdBy: 'currentUser' // 需要从用户信息获取
        }
        analysisTasks.value.unshift(task)
        currentTask.value = task
      }
      
      return response
    } catch (err: any) {
      error.value = err.message || '分析执行失败'
      throw err
    } finally {
      loading.value.analysis = false
    }
  }

  /**
   * 获取数据洞察
   */
  async function getInsights(params: AiInsightRequest): Promise<AiInsightResponse> {
    loading.value.insights = true
    error.value = null
    
    try {
      const response = await AiApi.getInsights(params)
      insights.value = response.insights
      return response
    } catch (err: any) {
      error.value = err.message || '获取洞察失败'
      throw err
    } finally {
      loading.value.insights = false
    }
  }

  /**
   * 获取智能推荐
   */
  async function getRecommendations(params: AiRecommendationRequest): Promise<AiRecommendationResponse> {
    try {
      return await AiApi.getRecommendations(params)
    } catch (err: any) {
      error.value = err.message || '获取推荐失败'
      throw err
    }
  }

  /**
   * 对话式分析
   */
  async function chatAnalysis(params: AiConversationRequest): Promise<AiConversationResponse> {
    loading.value.conversation = true
    error.value = null
    
    try {
      const response = await AiApi.chatAnalysis(params)
      
      // 更新会话状态
      if (!conversationState.value) {
        conversationState.value = {
          conversationId: response.conversationId,
          messages: [],
          context: {},
          isLoading: false
        }
      }
      
      // 添加消息到会话
      conversationState.value.messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
        analysis: response.analysis
      })
      
      return response
    } catch (err: any) {
      error.value = err.message || '对话分析失败'
      throw err
    } finally {
      loading.value.conversation = false
    }
  }

  /**
   * 获取AI模型配置
   */
  async function fetchModelConfig(): Promise<void> {
    loading.value.config = true
    error.value = null
    
    try {
      modelConfig.value = await AiApi.getModelConfig()
    } catch (err: any) {
      error.value = err.message || '获取模型配置失败'
    } finally {
      loading.value.config = false
    }
  }

  /**
   * 更新AI模型配置
   */
  async function updateModelConfig(config: AiModelConfig): Promise<void> {
    try {
      await AiApi.updateModelConfig(config)
      modelConfig.value = config
    } catch (err: any) {
      error.value = err.message || '更新模型配置失败'
      throw err
    }
  }

  /**
   * 获取分析任务列表
   */
  async function fetchTasks(): Promise<void> {
    try {
      analysisTasks.value = await AiApi.getTasks()
    } catch (err: any) {
      error.value = err.message || '获取任务列表失败'
    }
  }

  /**
   * 获取任务详情
   */
  async function fetchTaskDetail(taskId: string): Promise<void> {
    try {
      currentTask.value = await AiApi.getTaskDetail(taskId)
    } catch (err: any) {
      error.value = err.message || '获取任务详情失败'
    }
  }

  /**
   * 取消分析任务
   */
  async function cancelTask(taskId: string): Promise<void> {
    try {
      await AiApi.cancelTask(taskId)
      
      // 更新任务状态
      const task = analysisTasks.value.find(t => t.id === taskId)
      if (task) {
        task.status = 'cancelled'
        task.updatedAt = new Date().toISOString()
      }
      
      if (currentTask.value?.id === taskId) {
        currentTask.value.status = 'cancelled'
        currentTask.value.updatedAt = new Date().toISOString()
      }
    } catch (err: any) {
      error.value = err.message || '取消任务失败'
      throw err
    }
  }

  /**
   * 删除分析任务
   */
  async function deleteTask(taskId: string): Promise<void> {
    try {
      await AiApi.deleteTask(taskId)
      
      // 从列表中移除
      analysisTasks.value = analysisTasks.value.filter(t => t.id !== taskId)
      
      if (currentTask.value?.id === taskId) {
        currentTask.value = null
      }
    } catch (err: any) {
      error.value = err.message || '删除任务失败'
      throw err
    }
  }

  /**
   * 获取历史洞察记录
   */
  async function fetchHistoryInsights(params: {
    datasetId?: string
    startTime?: string
    endTime?: string
    page?: number
    size?: number
  }): Promise<void> {
    loading.value.history = true
    
    try {
      const response = await AiApi.getHistoryInsights(params)
      insights.value = response.items
    } catch (err: any) {
      error.value = err.message || '获取历史洞察失败'
    } finally {
      loading.value.history = false
    }
  }

  /**
   * 保存洞察结果
   */
  async function saveInsight(insight: Omit<AiInsightItem, 'id' | 'createdAt'>): Promise<AiInsightItem> {
    try {
      const savedInsight = await AiApi.saveInsight(insight)
      insights.value.unshift(savedInsight)
      return savedInsight
    } catch (err: any) {
      error.value = err.message || '保存洞察失败'
      throw err
    }
  }

  /**
   * 更新洞察结果
   */
  async function updateInsight(insightId: string, insight: Partial<AiInsightItem>): Promise<AiInsightItem> {
    try {
      const updatedInsight = await AiApi.updateInsight(insightId, insight)
      
      // 更新列表中的洞察
      const index = insights.value.findIndex(i => i.id === insightId)
      if (index !== -1) {
        insights.value[index] = { ...insights.value[index], ...updatedInsight }
      }
      
      return updatedInsight
    } catch (err: any) {
      error.value = err.message || '更新洞察失败'
      throw err
    }
  }

  /**
   * 删除洞察结果
   */
  async function deleteInsight(insightId: string): Promise<void> {
    try {
      await AiApi.deleteInsight(insightId)
      insights.value = insights.value.filter(i => i.id !== insightId)
    } catch (err: any) {
      error.value = err.message || '删除洞察失败'
      throw err
    }
  }

  /**
   * 获取分析历史记录
   */
  async function fetchAnalysisHistory(params: {
    datasetId?: string
    startTime?: string
    endTime?: string
    page?: number
    size?: number
  }): Promise<void> {
    loading.value.history = true
    
    try {
      // 这里需要调用后端API获取历史记录
      // 暂时使用模拟数据
      analysisHistory.value = []
    } catch (err: any) {
      error.value = err.message || '获取分析历史失败'
    } finally {
      loading.value.history = false
    }
  }

  /**
   * 获取分析统计信息
   */
  async function fetchAnalysisStats(): Promise<void> {
    loading.value.stats = true
    
    try {
      // 这里需要调用后端API获取统计信息
      // 暂时使用模拟数据
      analysisStats.value = null
    } catch (err: any) {
      error.value = err.message || '获取分析统计失败'
    } finally {
      loading.value.stats = false
    }
  }

  /**
   * 检查AI服务健康状态
   */
  async function checkServiceHealth(): Promise<void> {
    loading.value.health = true
    
    try {
      const health = await AiApi.checkConnection()
      serviceHealth.value = {
        status: health.connected ? 'healthy' : 'unhealthy',
        connectedModels: [],
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errors: health.connected ? [] : [{ model: 'default', error: health.message || '连接失败', timestamp: new Date().toISOString() }]
      }
    } catch (err: any) {
      error.value = err.message || '检查服务健康状态失败'
    } finally {
      loading.value.health = false
    }
  }

  /**
   * 清除错误
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * 重置会话状态
   */
  function resetConversation(): void {
    conversationState.value = null
  }

  /**
   * 添加用户消息到会话
   */
  function addUserMessage(message: string, context?: any): void {
    if (!conversationState.value) {
      conversationState.value = {
        conversationId: Date.now().toString(),
        messages: [],
        context: context || {},
        isLoading: false
      }
    }
    
    conversationState.value.messages.push({
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })
  }

  return {
    // 状态
    analysisTasks,
    currentTask,
    insights,
    conversationState,
    modelConfig,
    analysisHistory,
    analysisStats,
    serviceHealth,
    loading,
    error,
    
    // 计算属性
    completedTasks,
    pendingTasks,
    highConfidenceInsights,
    highImpactInsights,
    insightsByType,
    
    // Actions
    analyzeData,
    getInsights,
    getRecommendations,
    chatAnalysis,
    fetchModelConfig,
    updateModelConfig,
    fetchTasks,
    fetchTaskDetail,
    cancelTask,
    deleteTask,
    fetchHistoryInsights,
    saveInsight,
    updateInsight,
    deleteInsight,
    fetchAnalysisHistory,
    fetchAnalysisStats,
    checkServiceHealth,
    clearError,
    resetConversation,
    addUserMessage
  }
})