# Auto Report - 智能报表分析平台

> 基于 SpringBoot + Vue3 的现代化智能报表分析平台，支持数据源管理、可视化分析、AI洞察和团队协作

## 🚀 项目简介

Auto Report 是一个功能完整的智能报表分析平台，采用前后端分离架构，遵循 5A6S 开发规范。平台提供从数据接入到分析展示的全流程解决方案。

### ✨ 核心特性

- **多数据源支持**：MySQL、PostgreSQL、Oracle、SQL Server、API等
- **可视化分析**：丰富的图表类型，拖拽式仪表板设计
- **AI增强分析**：智能数据洞察、自然语言查询
- **团队协作**：团队管理、资源共享、评论系统
- **预警监控**：实时数据监控、智能告警
- **权限管理**：RBAC权限模型，细粒度权限控制

## 🏗️ 技术架构

### 后端技术栈
- **框架**：Spring Boot 3.0+、Spring Data JPA
- **安全**：Spring Security、JWT认证
- **数据库**：MySQL 8.0+、Redis缓存
- **文档**：SpringDoc OpenAPI 3.0
- **构建**：Maven、Docker

### 前端技术栈
- **框架**：Vue 3.0+、TypeScript
- **UI组件**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router 4
- **构建**：Vite、Rollup

## 📁 项目结构

```
auto-report/
├── auto-report-backend/          # 后端SpringBoot项目
│   ├── src/main/java/com/stardustbi/
│   │   ├── config/              # 配置类
│   │   ├── controller/          # 控制器层
│   │   ├── dto/                 # 数据传输对象
│   │   ├── entity/              # 实体类
│   │   ├── repository/          # 数据访问层
│   │   ├── service/             # 业务逻辑层
│   │   └── Application.java     # 启动类
│   └── pom.xml                  # Maven配置
├── auto-report-frontend/         # 前端Vue3项目
│   ├── src/
│   │   ├── api/                 # API接口
│   │   ├── components/          # 公共组件
│   │   ├── router/              # 路由配置
│   │   ├── store/               # 状态管理
│   │   ├── types/               # TypeScript类型
│   │   ├── utils/               # 工具函数
│   │   ├── views/               # 页面视图
│   │   └── main.ts              # 入口文件
│   └── package.json             # 依赖配置
└── README.md                     # 项目文档
```

## 🚀 快速开始

### 环境要求

- Java 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 1. 数据库配置

```sql
-- 创建数据库
CREATE DATABASE auto_report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'auto_report_user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON auto_report.* TO 'auto_report_user'@'%';
FLUSH PRIVILEGES;
```

### 2. 后端启动

```bash
cd auto-report-backend

# 配置数据库连接（修改application.yml）
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/auto_report
    username: auto_report_user
    password: your_password

# 启动应用
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 前端启动

```bash
cd auto-report-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 📚 功能模块

### 数据源管理
- 支持多种数据源类型
- 连接测试和验证
- 数据源元信息管理
- 连接池配置

### 数据集管理
- SQL查询编辑器
- 数据预览和验证
- 字段类型映射
- 数据缓存策略

### 可视化分析
- 多种图表类型（柱状图、折线图、饼图等）
- 拖拽式仪表板设计
- 实时数据刷新
- 响应式布局

### AI增强分析
- 自然语言查询
- 智能数据洞察
- 趋势预测分析
- 异常检测

### 协作与共享
- 团队管理
- 资源共享
- 评论系统
- 权限控制

### 预警监控
- 阈值告警
- 实时监控
- 通知中心
- 历史记录

## 🔧 API文档

启动后端服务后，访问以下地址查看API文档：

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

### 主要API端点

#### 数据源管理
```
GET    /api/v1/datasources          # 获取数据源列表
POST   /api/v1/datasources          # 创建数据源
GET    /api/v1/datasources/{id}     # 获取数据源详情
PUT    /api/v1/datasources/{id}     # 更新数据源
DELETE /api/v1/datasources/{id}     # 删除数据源
POST   /api/v1/datasources/{id}/test # 测试连接
```

#### 协作与共享
```
GET    /api/v1/teams                 # 获取用户团队列表
POST   /api/v1/teams                 # 创建团队
GET    /api/v1/teams/{id}           # 获取团队详情
POST   /api/v1/teams/{id}/members   # 添加团队成员
POST   /api/v1/teams/{id}/resources # 分享资源
GET    /api/v1/comments              # 获取资源评论
POST   /api/v1/comments              # 创建评论
```

## 🐳 Docker部署

### 1. 构建镜像

```bash
# 构建后端镜像
cd auto-report-backend
docker build -t auto-report-backend .

# 构建前端镜像
cd auto-report-frontend
docker build -t auto-report-frontend .
```

### 2. 使用Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: auto_report
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:6.2-alpine
    ports:
      - "6379:6379"

  backend:
    image: auto-report-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/auto_report
      SPRING_REDIS_HOST: redis
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis

  frontend:
    image: auto-report-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

启动服务：
```bash
docker-compose up -d
```

## 🔒 安全配置

### JWT认证
- Token有效期：24小时
- 自动刷新机制
- 安全密钥配置

### 权限控制
- 基于角色的访问控制（RBAC）
- 接口级别权限验证
- 数据权限过滤

### 安全特性
- SQL注入防护
- XSS攻击防护
- CSRF防护
- 密码加密存储

## 📊 性能优化

### 后端优化
- 数据库连接池配置
- Redis缓存策略
- 异步处理机制
- 分页查询优化

### 前端优化
- 组件懒加载
- 路由懒加载
- 图片压缩优化
- 代码分割

## 🧪 测试

### 后端测试
```bash
cd auto-report-backend
mvn test
```

### 前端测试
```bash
cd auto-report-frontend
npm run test
```

### 集成测试
```bash
# 运行完整的测试套件
npm run test:e2e
```

## 🤝 开发规范

本项目遵循 5A6S 开发规范：

### 5A原则
- **A1 Architecture**：清晰架构设计
- **A2 API**：统一接口规范
- **A3 Automation**：自动化工程
- **A4 Assurance**：质量保障
- **A5 Agility**：敏捷协作

### 6S标准
- **S1 Structure**：目录结构标准
- **S2 Standards**：编码标准
- **S3 Security**：安全标准
- **S4 Stability**：稳定性标准
- **S5 Scalability**：可扩展标准
- **S6 Sustainability**：可持续维护

## 📈 监控与日志

### 应用监控
- Spring Boot Actuator
- 健康检查端点
- 性能指标收集

### 日志管理
- 结构化日志输出
- 日志级别配置
- 日志文件轮转

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证连接参数是否正确
   - 确认网络连通性

2. **前端构建失败**
   - 清除node_modules重新安装
   - 检查Node.js版本兼容性
   - 验证依赖包版本冲突

3. **权限认证失败**
   - 检查JWT Token是否过期
   - 验证用户角色权限配置
   - 确认安全配置是否正确

## 📞 支持与贡献

### 问题反馈
如遇问题，请提交Issue到项目仓库，包含：
- 问题描述
- 重现步骤
- 环境信息
- 错误日志

### 贡献指南
1. Fork项目仓库
2. 创建功能分支
3. 提交代码变更
4. 创建Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢以下开源项目的支持：
- Spring Boot
- Vue.js
- Element Plus
- MyBatis
- Redis

---

**Auto Report** - 让数据分析更简单、更智能！