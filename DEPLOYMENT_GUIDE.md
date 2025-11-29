# Auto Report 部署指南

## 概述

本文档提供 Auto Report 系统的完整部署指南，支持开发环境、测试环境和生产环境的部署。

## 环境要求

### 硬件要求

| 环境 | CPU | 内存 | 存储 |
|------|-----|------|------|
| 开发环境 | 2核 | 4GB | 20GB |
| 测试环境 | 4核 | 8GB | 50GB |
| 生产环境 | 8核 | 16GB | 100GB |

### 软件要求

**必需软件**
- Docker 20.10+
- Docker Compose 2.0+
- Git

**可选软件**
- Node.js 18+（前端开发）
- Java 17+（后端开发）
- MySQL 8.0+
- Redis 6.0+

## 快速开始

### 1. 获取代码

```bash
# 克隆项目
git clone <repository-url>
cd auto-report
```

### 2. 环境配置

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑环境变量（根据实际情况修改）
vi .env
```

**关键配置项**：
- `JWT_SECRET`: JWT密钥（生产环境必须修改）
- 数据库连接信息
- Redis连接信息

### 3. 一键部署

```bash
# 给部署脚本执行权限
chmod +x deploy.sh

# 启动开发环境
./deploy.sh start development

# 启动生产环境
./deploy.sh start production
```

### 4. 验证部署

```bash
# 查看服务状态
./deploy.sh status

# 访问应用
# 前端：http://localhost:3000
# 后端API：http://localhost:8080/api/v1/health
```

## 详细部署步骤

### 开发环境部署

#### 方式一：使用 Docker Compose（推荐）

```bash
# 1. 启动基础服务
./deploy.sh start development

# 2. 启动前端开发服务器（新终端）
cd auto-report-frontend
npm install
npm run dev
```

#### 方式二：本地开发环境

**后端启动**
```bash
cd auto-report-backend

# 安装依赖（首次）
mvn clean install

# 启动应用
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**前端启动**
```bash
cd auto-report-frontend

# 安装依赖（首次）
npm install

# 启动开发服务器
npm run dev
```

### 生产环境部署

#### 1. 准备生产环境

```bash
# 创建生产环境目录
mkdir -p /opt/auto-report
cd /opt/auto-report

# 上传代码或从Git拉取
git clone <repository-url> .

# 配置生产环境变量
cp .env.example .env
vi .env  # 修改生产环境配置
```

#### 2. 生产环境配置

编辑 `.env` 文件：

```bash
# 生产环境配置
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=your-super-secure-production-secret

# 生产数据库配置
SPRING_DATASOURCE_URL=jdbc:mysql://mysql-prod:3306/auto_report_prod
SPRING_DATASOURCE_USERNAME=prod_user
SPRING_DATASOURCE_PASSWORD=secure_password

# Redis生产配置
SPRING_REDIS_HOST=redis-prod
SPRING_REDIS_PASSWORD=redis_prod_password
```

#### 3. 构建和部署

```bash
# 构建生产镜像
./deploy.sh build

# 启动生产服务
./deploy.sh start production

# 执行数据库迁移
./deploy.sh migrate
```

#### 4. 配置反向代理（可选）

如果需要使用域名访问，配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Docker 配置详解

### 后端 Dockerfile

```dockerfile
# 多阶段构建，减小镜像体积
FROM openjdk:17-jdk-slim as builder
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM openjdk:17-jre-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# 创建非root用户
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 --gid 1001 appuser
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 前端 Dockerfile

```dockerfile
# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose 配置

主要服务配置：

- **mysql**: MySQL 8.0 数据库
- **redis**: Redis 6.2 缓存
- **backend**: Spring Boot 后端应用
- **frontend**: Vue 3 前端应用
- **nginx**: 反向代理（可选）

## 数据库管理

### 初始化数据库

```bash
# 自动初始化（通过Docker Compose）
# 数据库初始化脚本：init.sql

# 手动初始化（如果需要）
./deploy.sh migrate
```

### 备份数据库

```bash
# 自动备份
./deploy.sh backup

# 备份文件保存在 backups/ 目录
ls backups/
# auto_report_20240115_143022.sql
```

### 恢复数据库

```bash
# 恢复指定备份文件
./deploy.sh restore backups/auto_report_20240115_143022.sql
```

### 数据库维护

```sql
-- 查看数据库大小
SELECT 
    table_schema as '数据库',
    sum(data_length + index_length) / 1024 / 1024 as '大小(MB)'
FROM information_schema.tables 
WHERE table_schema = 'auto_report'
GROUP BY table_schema;

-- 查看表大小
SELECT 
    table_name as '表名',
    round(((data_length + index_length) / 1024 / 1024), 2) as '大小(MB)'
FROM information_schema.tables 
WHERE table_schema = 'auto_report'
ORDER BY (data_length + index_length) DESC;
```

## 监控与日志

### 服务监控

```bash
# 查看服务状态
./deploy.sh status

# 查看实时日志
./deploy.sh logs backend
./deploy.sh logs frontend

# 查看所有服务日志
./deploy.sh logs
```

### 健康检查

- 后端健康检查：`http://localhost:8080/actuator/health`
- 前端健康检查：`http://localhost:3000/health`
- 数据库连接检查：通过后端健康检查接口

### 日志配置

日志文件位置：
- 后端日志：`logs/backend/`
- 前端日志：容器内部日志
- 数据库日志：Docker 容器日志

## 安全配置

### 1. 网络安全

```bash
# 配置防火墙（如果使用）
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp    # SSH
ufw enable
```

### 2. 数据库安全

```sql
-- 创建专用数据库用户
CREATE USER 'auto_report_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON auto_report.* TO 'auto_report_user'@'%';
FLUSH PRIVILEGES;
```

### 3. 应用安全

- 定期更新 JWT 密钥
- 启用 HTTPS（生产环境）
- 配置适当的 CORS 策略
- 定期更新依赖包

## 性能优化

### 1. 数据库优化

```sql
-- 添加索引优化查询性能
CREATE INDEX idx_team_created ON collaboration_team(created_at);
CREATE INDEX idx_member_team ON team_member(team_id);
CREATE INDEX idx_resource_team ON shared_resource(team_id, resource_type);
```

### 2. 缓存优化

```yaml
# 后端缓存配置（application.yml）
spring:
  cache:
    type: redis
    redis:
      time-to-live: 300000  # 5分钟
      cache-null-values: false
```

### 3. 前端优化

- 启用 Gzip 压缩
- 配置静态资源缓存
- 使用 CDN 加速
- 代码分割和懒加载

## 故障排除

### 常见问题

#### 1. 端口冲突

```bash
# 检查端口占用
netstat -tulpn | grep :8080
netstat -tulpn | grep :3000

# 停止占用进程或修改端口配置
```

#### 2. 数据库连接失败

```bash
# 检查数据库服务状态
./deploy.sh logs mysql

# 检查数据库连接
mysql -h localhost -P 3306 -u root -p
```

#### 3. 内存不足

```bash
# 查看系统内存
free -h

# 调整JVM内存参数（在.env中）
JAVA_OPTS=-Xms256m -Xmx512m
```

#### 4. 构建失败

```bash
# 清理并重新构建
./deploy.sh cleanup
./deploy.sh build
```

### 日志分析

```bash
# 查看错误日志
grep "ERROR" logs/backend/application.log

# 查看慢查询日志（如果启用）
grep "slow" logs/mysql/slow.log
```

## 升级指南

### 1. 备份数据

```bash
# 备份数据库
./deploy.sh backup

# 备份配置文件
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup
```

### 2. 更新代码

```bash
# 拉取最新代码
git pull origin main

# 检查配置变更
diff .env .env.backup
```

### 3. 重新部署

```bash
# 停止旧服务
./deploy.sh stop

# 构建新镜像
./deploy.sh build

# 启动新服务
./deploy.sh start production
```

### 4. 验证升级

```bash
# 检查服务状态
./deploy.sh status

# 验证功能
curl http://localhost:8080/actuator/health
```

## 附录

### 环境变量参考

完整的环境变量说明请参考 `.env.example` 文件。

### 常用命令速查

```bash
# 服务管理
./deploy.sh start [env]      # 启动服务
./deploy.sh stop            # 停止服务
./deploy.sh restart         # 重启服务
./deploy.sh status          # 查看状态

# 日志管理
./deploy.sh logs [service]  # 查看日志

# 数据管理
./deploy.sh backup          # 备份数据库
./deploy.sh restore <file>  # 恢复数据库
./deploy.sh migrate         # 执行迁移

# 系统维护
./deploy.sh build           # 构建镜像
./deploy.sh cleanup         # 清理资源
```

### 技术支持

- 文档：本项目 README.md
- 问题反馈：GitHub Issues
- 紧急支持：support@auto-report.com

---

**注意**: 生产环境部署前请务必进行充分测试，并确保有完整的数据备份和回滚方案。