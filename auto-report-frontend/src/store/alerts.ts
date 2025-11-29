import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AlertsApi from '@/api/alerts'
import type {
  AlertRule,
  AlertRuleCreate,
  AlertRuleUpdate,
  AlertHistory,
  AlertStats,
  NotificationChannel,
  NotificationChannelCreate,
  NotificationChannelUpdate,
  RealtimeMetrics
} from '@/types/alerts'

export const useAlertsStore = defineStore('alerts', () => {
  // 预警规则相关状态
  const alertRules = ref<AlertRule[]>([])
  const alertRulesLoading = ref(false)
  const alertRulesPagination = ref({
    page: 1,
    size: 20,
    total: 0
  })

  // 预警历史相关状态
  const alertHistory = ref<AlertHistory[]>([])
  const alertHistoryLoading = ref(false)
  const alertHistoryPagination = ref({
    page: 1,
    size: 20,
    total: 0
  })

  // 通知渠道相关状态
  const notificationChannels = ref<NotificationChannel[]>([])
  const notificationChannelsLoading = ref(false)

  // 预警统计信息
  const alertStats = ref<AlertStats | null>(null)
  const alertStatsLoading = ref(false)

  // 实时监控数据
  const realtimeMetrics = ref<RealtimeMetrics | null>(null)
  const realtimeMetricsLoading = ref(false)

  // 当前选中的预警规则
  const currentAlertRule = ref<AlertRule | null>(null)

  // 当前选中的预警历史
  const currentAlertHistory = ref<AlertHistory | null>(null)

  // 搜索和筛选条件
  const searchFilters = ref({
    keyword: '',
    status: '' as '' | 'active' | 'inactive',
    type: '' as '' | 'threshold' | 'anomaly' | 'trend' | 'custom',
    severity: '' as '' | 'low' | 'medium' | 'high' | 'critical'
  })

  // 历史记录筛选条件
  const historyFilters = ref({
    ruleId: '',
    status: '' as '' | 'triggered' | 'resolved' | 'handled',
    startTime: '',
    endTime: ''
  })

  // 计算属性
  const activeAlertRules = computed(() => 
    alertRules.value.filter(rule => rule.enabled)
  )

  const criticalAlertRules = computed(() => 
    alertRules.value.filter(rule => rule.severity === 'critical')
  )

  const triggeredAlerts = computed(() => 
    alertHistory.value.filter(alert => alert.status === 'triggered')
  )

  const unhandledAlerts = computed(() => 
    alertHistory.value.filter(alert => alert.status !== 'handled')
  )

  const enabledNotificationChannels = computed(() => 
    notificationChannels.value.filter(channel => channel.enabled)
  )

  // 预警规则相关操作
  const fetchAlertRules = async (params?: {
    page?: number
    size?: number
    keyword?: string
    status?: 'active' | 'inactive'
    type?: string
  }) => {
    alertRulesLoading.value = true
    try {
      const response = await AlertsApi.getAlertRules({
        ...params,
        page: params?.page || alertRulesPagination.value.page,
        size: params?.size || alertRulesPagination.value.size
      })
      alertRules.value = response.data.items
      alertRulesPagination.value.total = response.data.total
      if (params?.page) alertRulesPagination.value.page = params.page
      if (params?.size) alertRulesPagination.value.size = params.size
    } catch (error) {
      console.error('获取预警规则失败:', error)
      throw error
    } finally {
      alertRulesLoading.value = false
    }
  }

  const fetchAlertRule = async (id: string) => {
    try {
      const response = await AlertsApi.getAlertRule(id)
      currentAlertRule.value = response.data
      return response.data
    } catch (error) {
      console.error('获取预警规则详情失败:', error)
      throw error
    }
  }

  const createAlertRule = async (data: AlertRuleCreate) => {
    try {
      const response = await AlertsApi.createAlertRule(data)
      alertRules.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('创建预警规则失败:', error)
      throw error
    }
  }

  const updateAlertRule = async (id: string, data: AlertRuleUpdate) => {
    try {
      const response = await AlertsApi.updateAlertRule(id, data)
      const index = alertRules.value.findIndex(rule => rule.id === id)
      if (index !== -1) {
        alertRules.value[index] = response.data
      }
      if (currentAlertRule.value?.id === id) {
        currentAlertRule.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新预警规则失败:', error)
      throw error
    }
  }

  const deleteAlertRule = async (id: string) => {
    try {
      await AlertsApi.deleteAlertRule(id)
      alertRules.value = alertRules.value.filter(rule => rule.id !== id)
    } catch (error) {
      console.error('删除预警规则失败:', error)
      throw error
    }
  }

  const toggleAlertRule = async (id: string, enabled: boolean) => {
    try {
      const response = await AlertsApi.toggleAlertRule(id, enabled)
      const index = alertRules.value.findIndex(rule => rule.id === id)
      if (index !== -1) {
        alertRules.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('切换预警规则状态失败:', error)
      throw error
    }
  }

  const testAlertRule = async (id: string) => {
    try {
      const response = await AlertsApi.testAlertRule(id)
      return response.data
    } catch (error) {
      console.error('测试预警规则失败:', error)
      throw error
    }
  }

  const batchAlertRules = async (ids: string[], action: 'enable' | 'disable' | 'delete') => {
    try {
      await AlertsApi.batchAlertRules(ids, action)
      if (action === 'delete') {
        alertRules.value = alertRules.value.filter(rule => !ids.includes(rule.id))
      } else {
        const enabled = action === 'enable'
        alertRules.value.forEach(rule => {
          if (ids.includes(rule.id)) {
            rule.enabled = enabled
          }
        })
      }
    } catch (error) {
      console.error('批量操作预警规则失败:', error)
      throw error
    }
  }

  // 预警历史相关操作
  const fetchAlertHistory = async (params?: {
    page?: number
    size?: number
    ruleId?: string
    status?: 'triggered' | 'resolved' | 'handled'
    startTime?: string
    endTime?: string
  }) => {
    alertHistoryLoading.value = true
    try {
      const response = await AlertsApi.getAlertHistory({
        ...params,
        page: params?.page || alertHistoryPagination.value.page,
        size: params?.size || alertHistoryPagination.value.size
      })
      alertHistory.value = response.data.items
      alertHistoryPagination.value.total = response.data.total
      if (params?.page) alertHistoryPagination.value.page = params.page
      if (params?.size) alertHistoryPagination.value.size = params.size
    } catch (error) {
      console.error('获取预警历史失败:', error)
      throw error
    } finally {
      alertHistoryLoading.value = false
    }
  }

  const markAlertAsHandled = async (id: string) => {
    try {
      await AlertsApi.markAlertAsHandled(id)
      const index = alertHistory.value.findIndex(alert => alert.id === id)
      if (index !== -1) {
        alertHistory.value[index].status = 'handled'
        alertHistory.value[index].handledAt = new Date().toISOString()
      }
    } catch (error) {
      console.error('标记预警为已处理失败:', error)
      throw error
    }
  }

  const batchHandleAlerts = async (ids: string[]) => {
    try {
      await AlertsApi.batchHandleAlerts(ids)
      alertHistory.value.forEach(alert => {
        if (ids.includes(alert.id)) {
          alert.status = 'handled'
          alert.handledAt = new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('批量处理预警失败:', error)
      throw error
    }
  }

  // 预警统计相关操作
  const fetchAlertStats = async (params?: { startTime?: string; endTime?: string }) => {
    alertStatsLoading.value = true
    try {
      const response = await AlertsApi.getAlertStats(params)
      alertStats.value = response.data
      return response.data
    } catch (error) {
      console.error('获取预警统计失败:', error)
      throw error
    } finally {
      alertStatsLoading.value = false
    }
  }

  // 通知渠道相关操作
  const fetchNotificationChannels = async () => {
    notificationChannelsLoading.value = true
    try {
      const response = await AlertsApi.getNotificationChannels()
      notificationChannels.value = response.data
      return response.data
    } catch (error) {
      console.error('获取通知渠道失败:', error)
      throw error
    } finally {
      notificationChannelsLoading.value = false
    }
  }

  const createNotificationChannel = async (data: NotificationChannelCreate) => {
    try {
      const response = await AlertsApi.createNotificationChannel(data)
      notificationChannels.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('创建通知渠道失败:', error)
      throw error
    }
  }

  const updateNotificationChannel = async (id: string, data: NotificationChannelUpdate) => {
    try {
      const response = await AlertsApi.updateNotificationChannel(id, data)
      const index = notificationChannels.value.findIndex(channel => channel.id === id)
      if (index !== -1) {
        notificationChannels.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新通知渠道失败:', error)
      throw error
    }
  }

  const deleteNotificationChannel = async (id: string) => {
    try {
      await AlertsApi.deleteNotificationChannel(id)
      notificationChannels.value = notificationChannels.value.filter(channel => channel.id !== id)
    } catch (error) {
      console.error('删除通知渠道失败:', error)
      throw error
    }
  }

  const testNotificationChannel = async (id: string) => {
    try {
      const response = await AlertsApi.testNotificationChannel(id)
      return response.data
    } catch (error) {
      console.error('测试通知渠道失败:', error)
      throw error
    }
  }

  // 实时监控相关操作
  const fetchRealtimeMetrics = async () => {
    realtimeMetricsLoading.value = true
    try {
      const response = await AlertsApi.getRealtimeMetrics()
      realtimeMetrics.value = response.data
      return response.data
    } catch (error) {
      console.error('获取实时监控数据失败:', error)
      throw error
    } finally {
      realtimeMetricsLoading.value = false
    }
  }

  const subscribeRealtimeMetrics = (callback: (data: any) => void) => {
    return AlertsApi.subscribeRealtime(callback)
  }

  // 预警规则模板相关操作
  const fetchAlertTemplates = async () => {
    try {
      const response = await AlertsApi.getAlertTemplates()
      return response.data
    } catch (error) {
      console.error('获取预警规则模板失败:', error)
      throw error
    }
  }

  const importAlertTemplate = async (templateId: string, config: any) => {
    try {
      const response = await AlertsApi.importAlertTemplate(templateId, config)
      alertRules.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('导入预警规则模板失败:', error)
      throw error
    }
  }

  // 重置状态
  const resetState = () => {
    alertRules.value = []
    alertHistory.value = []
    notificationChannels.value = []
    alertStats.value = null
    realtimeMetrics.value = null
    currentAlertRule.value = null
    currentAlertHistory.value = null
  }

  return {
    // 状态
    alertRules,
    alertRulesLoading,
    alertRulesPagination,
    alertHistory,
    alertHistoryLoading,
    alertHistoryPagination,
    notificationChannels,
    notificationChannelsLoading,
    alertStats,
    alertStatsLoading,
    realtimeMetrics,
    realtimeMetricsLoading,
    currentAlertRule,
    currentAlertHistory,
    searchFilters,
    historyFilters,

    // 计算属性
    activeAlertRules,
    criticalAlertRules,
    triggeredAlerts,
    unhandledAlerts,
    enabledNotificationChannels,

    // 方法
    fetchAlertRules,
    fetchAlertRule,
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    toggleAlertRule,
    testAlertRule,
    batchAlertRules,
    fetchAlertHistory,
    markAlertAsHandled,
    batchHandleAlerts,
    fetchAlertStats,
    fetchNotificationChannels,
    createNotificationChannel,
    updateNotificationChannel,
    deleteNotificationChannel,
    testNotificationChannel,
    fetchRealtimeMetrics,
    subscribeRealtimeMetrics,
    fetchAlertTemplates,
    importAlertTemplate,
    resetState
  }
})