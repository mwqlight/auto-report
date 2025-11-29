import { request } from '@/utils/request'
import type { 
  AlertRule, 
  AlertRuleCreate, 
  AlertRuleUpdate,
  AlertHistory,
  AlertStats,
  NotificationChannel,
  NotificationChannelCreate,
  NotificationChannelUpdate
} from '@/types/alerts'

/**
 * 预警规则API
 */
export class AlertsApi {
  /**
   * 获取预警规则列表
   */
  static async getAlertRules(params: {
    page?: number
    size?: number
    keyword?: string
    status?: 'active' | 'inactive'
    type?: string
  } = {}) {
    return request.get<{
      items: AlertRule[]
      total: number
    }>('/api/v1/alerts/rules', { params })
  }

  /**
   * 获取预警规则详情
   */
  static async getAlertRule(id: string) {
    return request.get<AlertRule>(`/api/v1/alerts/rules/${id}`)
  }

  /**
   * 创建预警规则
   */
  static async createAlertRule(data: AlertRuleCreate) {
    return request.post<AlertRule>('/api/v1/alerts/rules', data)
  }

  /**
   * 更新预警规则
   */
  static async updateAlertRule(id: string, data: AlertRuleUpdate) {
    return request.put<AlertRule>(`/api/v1/alerts/rules/${id}`, data)
  }

  /**
   * 删除预警规则
   */
  static async deleteAlertRule(id: string) {
    return request.delete(`/api/v1/alerts/rules/${id}`)
  }

  /**
   * 启用/禁用预警规则
   */
  static async toggleAlertRule(id: string, enabled: boolean) {
    return request.patch<AlertRule>(`/api/v1/alerts/rules/${id}/status`, { enabled })
  }

  /**
   * 测试预警规则
   */
  static async testAlertRule(id: string) {
    return request.post<{ triggered: boolean; message: string }>(`/api/v1/alerts/rules/${id}/test`)
  }

  /**
   * 批量操作预警规则
   */
  static async batchAlertRules(ids: string[], action: 'enable' | 'disable' | 'delete') {
    return request.post('/api/v1/alerts/rules/batch', { ids, action })
  }

  /**
   * 获取预警历史记录
   */
  static async getAlertHistory(params: {
    page?: number
    size?: number
    ruleId?: string
    status?: 'triggered' | 'resolved'
    startTime?: string
    endTime?: string
  } = {}) {
    return request.get<{
      items: AlertHistory[]
      total: number
    }>('/api/v1/alerts/history', { params })
  }

  /**
   * 获取预警统计信息
   */
  static async getAlertStats(params: {
    startTime?: string
    endTime?: string
  } = {}) {
    return request.get<AlertStats>('/api/v1/alerts/stats', { params })
  }

  /**
   * 标记预警为已处理
   */
  static async markAlertAsHandled(id: string) {
    return request.patch(`/api/v1/alerts/history/${id}/handled`)
  }

  /**
   * 批量处理预警
   */
  static async batchHandleAlerts(ids: string[]) {
    return request.post('/api/v1/alerts/history/batch-handle', { ids })
  }

  /**
   * 获取通知渠道列表
   */
  static async getNotificationChannels() {
    return request.get<NotificationChannel[]>('/api/v1/alerts/notification-channels')
  }

  /**
   * 创建通知渠道
   */
  static async createNotificationChannel(data: NotificationChannelCreate) {
    return request.post<NotificationChannel>('/api/v1/alerts/notification-channels', data)
  }

  /**
   * 更新通知渠道
   */
  static async updateNotificationChannel(id: string, data: NotificationChannelUpdate) {
    return request.put<NotificationChannel>(`/api/v1/alerts/notification-channels/${id}`, data)
  }

  /**
   * 删除通知渠道
   */
  static async deleteNotificationChannel(id: string) {
    return request.delete(`/api/v1/alerts/notification-channels/${id}`)
  }

  /**
   * 测试通知渠道
   */
  static async testNotificationChannel(id: string) {
    return request.post<{ success: boolean; message: string }>(`/api/v1/alerts/notification-channels/${id}/test`)
  }

  /**
   * 获取系统监控指标
   */
  static async getSystemMetrics(params: {
    metric: string
    startTime?: string
    endTime?: string
    interval?: string
  }) {
    return request.get<any>('/api/v1/alerts/metrics', { params })
  }

  /**
   * 获取实时监控数据
   */
  static async getRealtimeMetrics() {
    return request.get<{
      cpu: number
      memory: number
      disk: number
      activeAlerts: number
      activeTasks: number
    }>('/api/v1/alerts/realtime')
  }

  /**
   * 订阅实时监控
   */
  static subscribeRealtime(callback: (data: any) => void) {
    // WebSocket 或 SSE 实现
    const eventSource = new EventSource('/api/v1/alerts/realtime/stream')
    eventSource.onmessage = (event) => {
      callback(JSON.parse(event.data))
    }
    return () => eventSource.close()
  }

  /**
   * 获取预警规则模板
   */
  static async getAlertTemplates() {
    return request.get<Array<{
      id: string
      name: string
      description: string
      template: AlertRuleCreate
    }>>('/api/v1/alerts/templates')
  }

  /**
   * 导入预警规则模板
   */
  static async importAlertTemplate(templateId: string, config: any) {
    return request.post<AlertRule>(`/api/v1/alerts/templates/${templateId}/import`, config)
  }
}

export default AlertsApi