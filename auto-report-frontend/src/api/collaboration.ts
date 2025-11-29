import request from '@/utils/request'
import type {
  CreateTeamRequest,
  AddMemberRequest,
  ShareResourceRequest,
  CreateCommentRequest,
  TeamResponse,
  SharedResource,
  CommentResponse
} from '@/types/collaboration'

// 团队管理API
export const collaborationApi = {
  // 创建团队
  createTeam: (data: CreateTeamRequest) =>
    request.post<TeamResponse>('/api/v1/collaboration/teams', data),

  // 获取用户团队列表
  getUserTeams: () =>
    request.get<TeamResponse[]>('/api/v1/collaboration/teams'),

  // 获取团队详情
  getTeamById: (teamId: number) =>
    request.get<TeamResponse>(`/api/v1/collaboration/teams/${teamId}`),

  // 添加团队成员
  addMember: (teamId: number, data: AddMemberRequest) =>
    request.post(`/api/v1/collaboration/teams/${teamId}/members`, data),

  // 资源共享API
  
  // 分享资源到团队
  shareResource: (teamId: number, data: ShareResourceRequest) =>
    request.post(`/api/v1/collaboration/teams/${teamId}/resources`, data),

  // 获取用户共享资源列表
  getUserSharedResources: () =>
    request.get<SharedResource[]>('/api/v1/collaboration/resources'),

  // 评论API
  
  // 创建评论
  createComment: (data: CreateCommentRequest) =>
    request.post<CommentResponse>('/api/v1/collaboration/comments', data),

  // 获取资源评论列表
  getResourceComments: (resourceType: string, resourceId: string) =>
    request.get<CommentResponse[]>('/api/v1/collaboration/comments', {
      params: { resourceType, resourceId }
    })
}

// 评论相关工具函数
export const commentUtils = {
  // 格式化评论时间
  formatCommentTime: (time: string): string => {
    const now = new Date()
    const commentTime = new Date(time)
    const diffMs = now.getTime() - commentTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    
    return commentTime.toLocaleDateString('zh-CN')
  },

  // 检查是否有新评论
  hasNewComments: (comments: CommentResponse[], lastViewed: string): boolean => {
    if (!lastViewed) return comments.length > 0
    
    const lastViewedTime = new Date(lastViewed)
    return comments.some(comment => 
      new Date(comment.createdAt) > lastViewedTime
    )
  }
}

// 团队权限检查
export const permissionUtils = {
  // 检查用户是否有管理权限
  canManageTeam: (team: TeamResponse, userId: string): boolean => {
    const member = team.members.find(m => m.userId === userId)
    return member ? ['OWNER', 'ADMIN'].includes(member.role) : false
  },

  // 检查用户是否有资源操作权限
  canOperateResource: (
    resource: SharedResource, 
    userId: string, 
    operation: 'read' | 'write' | 'admin'
  ): boolean => {
    // 这里需要根据实际权限逻辑实现
    // 暂时返回true，实际项目中需要根据权限配置检查
    return true
  },

  // 获取用户角色显示名称
  getRoleDisplayName: (role: string): string => {
    const roleMap: Record<string, string> = {
      'OWNER': '创建者',
      'ADMIN': '管理员',
      'MEMBER': '成员',
      'VIEWER': '查看者'
    }
    return roleMap[role] || role
  }
}