// 团队相关类型
export interface CollaborationTeam {
  id: number
  name: string
  description?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  members: TeamMember[]
  sharedResources: SharedResource[]
}

export interface TeamMember {
  id: number
  userId: string
  role: TeamRole
  joinedAt: string
}

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

// 资源共享相关类型
export interface SharedResource {
  id: number
  teamId: number
  resourceType: ResourceType
  resourceId: string
  resourceName: string
  permissionLevel: PermissionLevel
  sharedBy: string
  sharedAt: string
}

export enum ResourceType {
  DASHBOARD = 'DASHBOARD',
  CHART = 'CHART',
  DATASET = 'DATASET',
  DATASOURCE = 'DATASOURCE',
  REPORT = 'REPORT'
}

export enum PermissionLevel {
  READ_ONLY = 'READ_ONLY',
  READ_WRITE = 'READ_WRITE',
  ADMIN = 'ADMIN'
}

// 评论相关类型
export interface Comment {
  id: number
  resourceType: ResourceType
  resourceId: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  parentCommentId?: number
  replies: Comment[]
}

// 请求DTO类型
export interface CreateTeamRequest {
  name: string
  description?: string
}

export interface AddMemberRequest {
  userId: string
  role: TeamRole
}

export interface ShareResourceRequest {
  resourceType: ResourceType
  resourceId: string
  resourceName: string
  permissionLevel?: PermissionLevel
}

export interface CreateCommentRequest {
  resourceType: ResourceType
  resourceId: string
  content: string
  parentCommentId?: number
}

// 响应DTO类型
export interface TeamResponse {
  id: number
  name: string
  description?: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  members: TeamMemberResponse[]
  sharedResources: SharedResourceResponse[]
}

export interface TeamMemberResponse {
  id: number
  userId: string
  role: TeamRole
  joinedAt: string
}

export interface SharedResourceResponse {
  id: number
  resourceType: string
  resourceId: string
  resourceName: string
  permissionLevel: string
  sharedBy: string
  sharedAt: string
}

export interface CommentResponse {
  id: number
  resourceType: string
  resourceId: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt?: string
  parentCommentId?: number
  replies: CommentResponse[]
}