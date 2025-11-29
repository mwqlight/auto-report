/**
 * 预警规则状态
 */
export type AlertRuleStatus = 'active' | 'inactive'

/**
 * 预警规则类型
 */
export type AlertRuleType = 'threshold' | 'anomaly' | 'trend' | 'custom'

/**
 * 比较操作符
 */
export type ComparisonOperator = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq'

/**
 * 聚合函数
 */
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'last'

/**
 * 时间窗口
 */
export interface TimeWindow {
  value: number
  unit: 'seconds' | 'minutes' | 'hours' | 'days'
}

/**
 * 预警条件
 */
export interface AlertCondition {
  field: string
  operator: ComparisonOperator
  value: number | string
  aggregation?: {
    function: AggregationFunction
    window: TimeWindow
  }
}

/**
 * 预警规则
 */
export interface AlertRule {
  id: string
  name: string
  description?: string
  type: AlertRuleType
  status: AlertRuleStatus
  conditions: AlertCondition[]
  datasetId?: string
  chartId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  checkInterval: TimeWindow
  notificationChannels: string[]
  enabled: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  lastTriggeredAt?: string
  triggerCount: number
}

/**
 * 创建预警规则请求
 */
export interface AlertRuleCreate {
  name: string
  description?: string
  type: AlertRuleType
  conditions: AlertCondition[]
  datasetId?: string
  chartId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  checkInterval: TimeWindow
  notificationChannels: string[]
}

/**
 * 更新预警规则请求
 */
export interface AlertRuleUpdate {
  name?: string
  description?: string
  conditions?: AlertCondition[]
  severity?: 'low' | 'medium' | 'high' | 'critical'
  checkInterval?: TimeWindow
  notificationChannels?: string[]
  enabled?: boolean
}

/**
 * 预警历史记录状态
 */
export type AlertHistoryStatus = 'triggered' | 'resolved' | 'handled'

/**
 * 预警历史记录
 */
export interface AlertHistory {
  id: string
  ruleId: string
  ruleName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: AlertHistoryStatus
  message: string
  triggeredValue: number
  thresholdValue: number
  datasetId?: string
  chartId?: string
  triggeredAt: string
  resolvedAt?: string
  handledAt?: string
  handledBy?: string
  notificationSent: boolean
  data?: Record<string, any>
}

/**
 * 预警统计信息
 */
export interface AlertStats {
  totalAlerts: number
  activeAlerts: number
  resolvedAlerts: number
  handledAlerts: number
  todayAlerts: number
  thisWeekAlerts: number
  thisMonthAlerts: number
  bySeverity: {
    low: number
    medium: number
    high: number
    critical: number
  }
  byStatus: {
    triggered: number
    resolved: number
    handled: number
  }
  topRules: Array<{
    ruleId: string
    ruleName: string
    triggerCount: number
  }>
}

/**
 * 通知渠道类型
 */
export type NotificationChannelType = 'email' | 'webhook' | 'slack' | 'dingtalk' | 'wechat' | 'sms'

/**
 * 通知渠道配置
 */
export interface NotificationChannelConfig {
  // 邮箱配置
  email?: {
    recipients: string[]
    subjectTemplate?: string
    bodyTemplate?: string
  }
  // Webhook配置
  webhook?: {
    url: string
    method: 'POST' | 'PUT'
    headers?: Record<string, string>
    bodyTemplate?: string
  }
  // Slack配置
  slack?: {
    webhookUrl: string
    channel: string
    username?: string
    iconEmoji?: string
  }
  // 钉钉配置
  dingtalk?: {
    webhookUrl: string
    secret?: string
    atMobiles?: string[]
    atAll?: boolean
  }
  // 微信配置
  wechat?: {
    corpId: string
    agentId: string
    secret: string
    toUser?: string
    toParty?: string
    toTag?: string
  }
  // 短信配置
  sms?: {
    provider: string
    accessKey: string
    accessSecret: string
    signName: string
    templateCode: string
    phoneNumbers: string[]
  }
}

/**
 * 通知渠道
 */
export interface NotificationChannel {
  id: string
  name: string
  type: NotificationChannelType
  config: NotificationChannelConfig
  enabled: boolean
  testResult?: {
    success: boolean
    message: string
    testedAt: string
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建通知渠道请求
 */
export interface NotificationChannelCreate {
  name: string
  type: NotificationChannelType
  config: NotificationChannelConfig
  enabled?: boolean
}

/**
 * 更新通知渠道请求
 */
export interface NotificationChannelUpdate {
  name?: string
  config?: NotificationChannelConfig
  enabled?: boolean
}

/**
 * 实时监控数据
 */
export interface RealtimeMetrics {
  cpu: {
    usage: number
    cores: number
    loadAverage: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    bytesSent: number
    bytesReceived: number
  }
  alerts: {
    active: number
    triggeredToday: number
  }
  tasks: {
    active: number
    queued: number
    completedToday: number
  }
  timestamp: string
}

/**
 * 监控指标数据点
 */
export interface MetricDataPoint {
  timestamp: string
  value: number
  label?: string
}

/**
 * 监控指标
 */
export interface Metric {
  name: string
  description: string
  unit: string
  data: MetricDataPoint[]
}

/**
 * 预警规则模板
 */
export interface AlertRuleTemplate {
  id: string
  name: string
  description: string
  category: string
  type: AlertRuleType
  conditions: AlertCondition[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  checkInterval: TimeWindow
  configurableFields: Array<{
    field: string
    label: string
    type: 'number' | 'string' | 'select'
    required: boolean
    options?: Array<{ label: string; value: any }>
    defaultValue?: any
  }>
}

/**
 * 预警规则导入配置
 */
export interface AlertRuleImportConfig {
  templateId: string
  name: string
  description?: string
  datasetId?: string
  chartId?: string
  notificationChannels: string[]
  config: Record<string, any>
}