import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, UserPreferences, Workspace } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const preferences = ref<UserPreferences>({
    theme: 'dark',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: 'en-US',
    defaultWorkspace: '',
    notificationSettings: {
      email: true,
      push: true,
      sound: false
    }
  })
  const workspaces = ref<Workspace[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  const permissions = ref<string[]>([])

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  const hasPermission = computed(() => (permission: string) => 
    permissions.value.includes(permission) || permissions.value.includes('*')
  )
  const userRole = computed(() => userInfo.value?.role || 'guest')

  // Actions
  const login = async (credentials: { username: string; password: string }) => {
    try {
      // TODO: 调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      
      // 更新状态
      token.value = data.token
      userInfo.value = data.userInfo
      permissions.value = data.permissions || []
      
      // 保存到本地存储
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
      
      return data
    } catch (error) {
      console.error('登录错误:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // TODO: 调用登出API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        }
      })
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      // 清除状态
      token.value = ''
      userInfo.value = null
      permissions.value = []
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      // TODO: 调用API更新偏好设置
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify(newPreferences)
      })
      
      // 更新本地状态
      preferences.value = { ...preferences.value, ...newPreferences }
      
      // 保存到本地存储
      localStorage.setItem('preferences', JSON.stringify(preferences.value))
    } catch (error) {
      console.error('更新偏好设置错误:', error)
      throw error
    }
  }

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = workspaces.value.find(w => w.id === workspaceId)
    if (workspace) {
      currentWorkspace.value = workspace
      preferences.value.defaultWorkspace = workspaceId
      
      // 保存到本地存储
      localStorage.setItem('currentWorkspace', workspaceId)
      
      // TODO: 可能需要重新加载工作空间相关数据
    }
  }

  const loadUserData = async () => {
    try {
      // 从本地存储加载
      const savedToken = localStorage.getItem('token')
      const savedUserInfo = localStorage.getItem('userInfo')
      const savedPreferences = localStorage.getItem('preferences')
      const savedWorkspace = localStorage.getItem('currentWorkspace')

      if (savedToken && savedUserInfo) {
        token.value = savedToken
        userInfo.value = JSON.parse(savedUserInfo)
        
        if (savedPreferences) {
          preferences.value = JSON.parse(savedPreferences)
        }
        
        // 加载工作空间数据
        await loadWorkspaces()
        
        if (savedWorkspace) {
          await switchWorkspace(savedWorkspace)
        } else if (preferences.value.defaultWorkspace) {
          await switchWorkspace(preferences.value.defaultWorkspace)
        }
      }
    } catch (error) {
      console.error('加载用户数据错误:', error)
      // 清除无效数据
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  const loadWorkspaces = async () => {
    try {
      // TODO: 调用API获取工作空间列表
      const response = await fetch('/api/workspaces', {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        workspaces.value = await response.json()
      }
    } catch (error) {
      console.error('加载工作空间错误:', error)
    }
  }

  const refreshToken = async () => {
    try {
      // TODO: 调用刷新token接口
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        const data = await response.json()
        token.value = data.token
        localStorage.setItem('token', data.token)
      } else {
        // token失效，需要重新登录
        await logout()
      }
    } catch (error) {
      console.error('刷新token错误:', error)
      await logout()
    }
  }

  // 初始化
  const initialize = async () => {
    await loadUserData()
    
    // 设置token刷新定时器
    setInterval(refreshToken, 30 * 60 * 1000) // 30分钟刷新一次
  }

  return {
    // 状态
    token,
    userInfo,
    preferences,
    workspaces,
    currentWorkspace,
    permissions,
    
    // 计算属性
    isAuthenticated,
    hasPermission,
    userRole,
    
    // Actions
    login,
    logout,
    updatePreferences,
    switchWorkspace,
    loadUserData,
    loadWorkspaces,
    refreshToken,
    initialize
  }
})