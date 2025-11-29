// 用户信息接口
export interface UserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  displayName: string
  role: UserRole
  department?: string
  phone?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// 用户角色枚举
export type UserRole = 'admin' | 'editor' | 'viewer' | 'guest'

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: string
  numberFormat: string
  defaultWorkspace: string
  notificationSettings: {
    email: boolean
    push: boolean
    sound: boolean
  }
}

// 工作空间接口
export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  members: WorkspaceMember[]
  storageLimit: number
  usedStorage: number
  createdAt: string
  updatedAt: string
}

// 工作空间成员
export interface WorkspaceMember {
  userId: string
  role: WorkspaceRole
  joinedAt: string
  userInfo?: UserInfo
}

// 工作空间角色枚举
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

// 权限定义
export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

// 用户会话信息
export interface UserSession {
  token: string
  expiresAt: string
  refreshToken: string
  userInfo: UserInfo
}

// 登录请求参数
export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

// 注册请求参数
export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName: string
  inviteCode?: string
}

// 密码重置请求参数
export interface ResetPasswordRequest {
  email: string
  token?: string
  newPassword?: string
}

// 用户统计信息
export interface UserStats {
  dashboardCount: number
  datasetCount: number
  queryCount: number
  storageUsage: number
  lastActivity: string
}

// 用户活动记录
export interface UserActivity {
  id: string
  userId: string
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

// 通知设置
export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  soundEnabled: boolean
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
}

// 用户配置文件
export interface UserProfile {
  userInfo: UserInfo
  preferences: UserPreferences
  workspaces: Workspace[]
  currentWorkspace?: Workspace
  permissions: string[]
  stats: UserStats
  recentActivities: UserActivity[]
}

// API响应类型
export interface LoginResponse {
  token: string
  refreshToken: string
  expiresAt: string
  userInfo: UserInfo
  permissions: string[]
}

export interface UserProfileResponse {
  data: UserProfile
}

export interface WorkspaceListResponse {
  data: Workspace[]
  total: number
  page: number
  pageSize: number
}

// 错误响应
export interface ErrorResponse {
  code: number
  message: string
  details?: Record<string, any>
  timestamp: string
}