# Auto Report API 文档

## 概述

Auto Report 是一个基于 SpringBoot + Vue3 的前后端分离报表系统，提供数据源管理、数据集管理、数据建模、智能分析、报表生成、协作共享等功能。

**基础信息**
- **API 基础路径**: `/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证与授权

### 登录认证

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user1",
      "username": "admin",
      "email": "admin@example.com",
      "displayName": "系统管理员"
    }
  },
  "timestamp": 1650000000000
}
```

### 请求头认证

后续请求需要在 Header 中携带 Token：
```
Authorization: Bearer <token>
```

## 协作与共享 API

### 团队管理

#### 1. 获取团队列表

```http
GET /api/v1/collaboration/teams
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "数据分析团队",
        "description": "负责公司数据分析工作",
        "memberCount": 3,
        "createdBy": "admin",
        "createdAt": "2024-01-15T10:30:00",
        "updatedAt": "2024-01-15T10:30:00"
      }
    ],
    "total": 1
  },
  "timestamp": 1650000000000
}
```

#### 2. 创建团队

```http
POST /api/v1/collaboration/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "产品团队",
  "description": "产品需求分析和设计"
}
```

#### 3. 获取团队详情

```http
GET /api/v1/collaboration/teams/{teamId}
Authorization: Bearer <token>
```

#### 4. 更新团队

```http
PUT /api/v1/collaboration/teams/{teamId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新后的团队名称",
  "description": "更新后的团队描述"
}
```

#### 5. 删除团队

```http
DELETE /api/v1/collaboration/teams/{teamId}
Authorization: Bearer <token>
```

### 团队成员管理

#### 1. 获取团队成员列表

```http
GET /api/v1/collaboration/teams/{teamId}/members
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": 1,
        "userId": "user1",
        "username": "admin",
        "displayName": "系统管理员",
        "role": "OWNER",
        "joinedAt": "2024-01-15T10:30:00"
      }
    ],
    "total": 1
  },
  "timestamp": 1650000000000
}
```

#### 2. 添加团队成员

```http
POST /api/v1/collaboration/teams/{teamId}/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user2",
  "role": "MEMBER"
}
```

#### 3. 更新成员角色

```http
PUT /api/v1/collaboration/teams/{teamId}/members/{memberId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### 4. 移除团队成员

```http
DELETE /api/v1/collaboration/teams/{teamId}/members/{memberId}
Authorization: Bearer <token>
```

### 共享资源管理

#### 1. 获取共享资源列表

```http
GET /api/v1/collaboration/teams/{teamId}/resources
Authorization: Bearer <token>
```

**查询参数**
- `resourceType`: 资源类型筛选（可选）
- `page`: 页码（默认1）
- `size`: 每页大小（默认10）

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": 1,
        "resourceType": "DASHBOARD",
        "resourceId": "dashboard_001",
        "resourceName": "销售数据看板",
        "permissionLevel": "READ",
        "sharedBy": "admin",
        "sharedAt": "2024-01-15T10:30:00"
      }
    ],
    "total": 1
  },
  "timestamp": 1650000000000
}
```

#### 2. 分享资源

```http
POST /api/v1/collaboration/teams/{teamId}/resources
Authorization: Bearer <token>
Content-Type: application/json

{
  "resourceType": "DASHBOARD",
  "resourceId": "dashboard_001",
  "resourceName": "销售数据看板",
  "permissionLevel": "READ"
}
```

#### 3. 更新资源权限

```http
PUT /api/v1/collaboration/teams/{teamId}/resources/{resourceId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissionLevel": "WRITE"
}
```

#### 4. 取消分享资源

```http
DELETE /api/v1/collaboration/teams/{teamId}/resources/{resourceId}
Authorization: Bearer <token>
```

### 评论管理

#### 1. 获取评论列表

```http
GET /api/v1/collaboration/comments
Authorization: Bearer <token>
```

**查询参数**
- `resourceType`: 资源类型（必需）
- `resourceId`: 资源ID（必需）
- `page`: 页码（默认1）
- `size`: 每页大小（默认10）

**响应示例**
```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "items": [
      {
        "id": 1,
        "resourceType": "DASHBOARD",
        "resourceId": "dashboard_001",
        "content": "这个看板的数据很全面",
        "parentCommentId": null,
        "createdBy": "admin",
        "createdAt": "2024-01-15T10:30:00",
        "replies": [
          {
            "id": 2,
            "content": "同意，图表展示也很清晰",
            "parentCommentId": 1,
            "createdBy": "user2",
            "createdAt": "2024-01-15T11:00:00"
          }
        ]
      }
    ],
    "total": 1
  },
  "timestamp": 1650000000000
}
```

#### 2. 创建评论

```http
POST /api/v1/collaboration/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "resourceType": "DASHBOARD",
  "resourceId": "dashboard_001",
  "content": "这个看板的数据很全面",
  "parentCommentId": null
}
```

#### 3. 回复评论

```http
POST /api/v1/collaboration/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "resourceType": "DASHBOARD",
  "resourceId": "dashboard_001",
  "content": "同意，图表展示也很清晰",
  "parentCommentId": 1
}
```

#### 4. 更新评论

```http
PUT /api/v1/collaboration/comments/{commentId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "更新后的评论内容"
}
```

#### 5. 删除评论

```http
DELETE /api/v1/collaboration/comments/{commentId}
Authorization: Bearer <token>
```

## 数据源管理 API

### 1. 获取数据源列表

```http
GET /api/v1/datasources
Authorization: Bearer <token>
```

### 2. 创建数据源

```http
POST /api/v1/datasources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "生产数据库",
  "type": "MYSQL",
  "host": "localhost",
  "port": 3306,
  "databaseName": "production",
  "username": "root",
  "password": "password123",
  "connectionParams": "{\"useSSL\":false}"
}
```

### 3. 测试数据源连接

```http
POST /api/v1/datasources/test-connection
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "MYSQL",
  "host": "localhost",
  "port": 3306,
  "databaseName": "test",
  "username": "root",
  "password": "password123"
}
```

## 数据集管理 API

### 1. 获取数据集列表

```http
GET /api/v1/datasets
Authorization: Bearer <token>
```

### 2. 创建数据集

```http
POST /api/v1/datasets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "销售数据",
  "description": "销售部门每日销售数据",
  "dataSourceId": 1,
  "querySql": "SELECT * FROM sales WHERE sale_date >= ?",
  "fieldsConfig": "{\"fields\":[{\"name\":\"sale_date\",\"type\":\"date\"}]}"
}
```

### 3. 执行数据集查询

```http
POST /api/v1/datasets/{datasetId}/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "parameters": {
    "startDate": "2024-01-01"
  },
  "limit": 100
}
```

## 错误码说明

### 通用错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式 |
| 401 | 未授权 | 检查Token是否有效 |
| 403 | 权限不足 | 检查用户权限 |
| 404 | 资源不存在 | 检查资源ID是否正确 |
| 500 | 服务器内部错误 | 联系系统管理员 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| 10001 | 用户不存在 |
| 10002 | 密码错误 |
| 10003 | 团队名称已存在 |
| 10004 | 用户已是团队成员 |
| 10005 | 资源已分享 |
| 10006 | 数据源连接失败 |

## 分页与排序

### 分页参数

所有列表接口支持分页查询：
- `page`: 页码，从1开始（默认1）
- `size`: 每页大小（默认10，最大100）

### 排序参数

支持按字段排序：
- `sort`: 排序字段，多个字段用逗号分隔
- `order`: 排序方向，asc/desc

**示例**
```
GET /api/v1/collaboration/teams?page=1&size=20&sort=createdAt&order=desc
```

## 数据格式约定

### 日期时间格式
- 所有日期时间字段使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss`
- 时区：UTC+8（北京时间）

### 枚举值

**团队角色**
- `OWNER`: 所有者
- `ADMIN`: 管理员
- `MEMBER`: 成员

**资源类型**
- `DASHBOARD`: 仪表板
- `CHART`: 图表
- `DATASET`: 数据集
- `REPORT`: 报表

**权限级别**
- `READ`: 只读
- `WRITE`: 读写
- `MANAGE`: 管理

## 性能优化建议

1. **缓存策略**: 频繁查询的数据建议使用缓存
2. **分页查询**: 大数据集使用分页查询避免内存溢出
3. **异步处理**: 耗时操作使用异步处理
4. **连接池**: 数据库连接使用连接池管理

## 安全注意事项

1. **Token安全**: Token有效期建议设置为合理时间
2. **SQL注入**: 使用参数化查询避免SQL注入
3. **XSS防护**: 对用户输入进行转义处理
4. **权限验证**: 每个接口都需要进行权限验证

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2024-01-15 | 初始版本，包含基础协作功能 |

## 技术支持

如有问题请联系：
- 邮箱：support@auto-report.com
- 文档：https://docs.auto-report.com
- GitHub：https://github.com/auto-report/auto-report