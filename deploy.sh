#!/bin/bash

# Auto Report 部署脚本
# 支持开发环境和生产环境部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker和Docker Compose是否安装
check_dependencies() {
    log_info "检查依赖环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "依赖环境检查通过"
}

# 检查环境变量
check_environment() {
    log_info "检查环境变量..."
    
    if [ -f ".env" ]; then
        log_info "加载环境变量文件..."
        source .env
    fi
    
    # 设置默认值
    export COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-"auto-report"}
    export SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-"docker"}
    export JWT_SECRET=${JWT_SECRET:-"your-secret-key-change-in-production"}
    
    log_success "环境变量检查完成"
}

# 构建镜像
build_images() {
    log_info "开始构建Docker镜像..."
    
    # 构建后端镜像
    log_info "构建后端镜像..."
    docker-compose build backend
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker-compose build frontend
    
    log_success "Docker镜像构建完成"
}

# 启动服务
start_services() {
    local env=$1
    
    log_info "启动服务..."
    
    if [ "$env" = "production" ]; then
        # 生产环境启动所有服务
        docker-compose up -d mysql redis backend frontend
    else
        # 开发环境启动基础服务
        docker-compose up -d mysql redis backend
        log_info "前端开发服务器请手动启动: cd auto-report-frontend && npm run dev"
    fi
    
    log_success "服务启动完成"
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    docker-compose down
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    docker-compose restart
    log_success "服务重启完成"
}

# 查看服务状态
status_services() {
    log_info "查看服务状态..."
    docker-compose ps
}

# 查看日志
view_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# 数据库迁移
migrate_database() {
    log_info "执行数据库迁移..."
    
    # 等待数据库启动
    log_info "等待数据库启动..."
    sleep 30
    
    # 执行数据库初始化
    log_info "执行数据库初始化脚本..."
    docker-compose exec -T mysql mysql -uroot -proot auto_report < init.sql
    
    log_success "数据库迁移完成"
}

# 备份数据库
backup_database() {
    local backup_dir="backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${backup_dir}/auto_report_${timestamp}.sql"
    
    log_info "备份数据库..."
    
    mkdir -p "$backup_dir"
    
    docker-compose exec -T mysql mysqldump -uroot -proot auto_report > "$backup_file"
    
    if [ $? -eq 0 ]; then
        log_success "数据库备份完成: $backup_file"
    else
        log_error "数据库备份失败"
        exit 1
    fi
}

# 恢复数据库
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "请指定备份文件路径"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    log_info "恢复数据库..."
    
    docker-compose exec -T mysql mysql -uroot -proot auto_report < "$backup_file"
    
    if [ $? -eq 0 ]; then
        log_success "数据库恢复完成"
    else
        log_error "数据库恢复失败"
        exit 1
    fi
}

# 清理资源
cleanup() {
    log_info "清理Docker资源..."
    
    # 停止并删除容器
    docker-compose down
    
    # 删除未使用的镜像
    docker image prune -f
    
    # 删除未使用的卷
    docker volume prune -f
    
    log_success "资源清理完成"
}

# 显示帮助信息
show_help() {
    echo "Auto Report 部署脚本"
    echo ""
    echo "用法: $0 [命令] [参数]"
    echo ""
    echo "命令:"
    echo "  start [env]         启动服务 (env: development|production, 默认: development)"
    echo "  stop                停止服务"
    echo "  restart             重启服务"
    echo "  status              查看服务状态"
    echo "  logs [service]      查看日志"
    echo "  build               构建Docker镜像"
    echo "  migrate             执行数据库迁移"
    echo "  backup              备份数据库"
    echo "  restore <file>      恢复数据库"
    echo "  cleanup             清理Docker资源"
    echo "  help                显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 start production    # 启动生产环境"
    echo "  $0 logs backend        # 查看后端日志"
    echo "  $0 backup              # 备份数据库"
}

# 主函数
main() {
    local command=$1
    local arg=$2
    
    case "$command" in
        "start")
            check_dependencies
            check_environment
            build_images
            start_services "${arg:-development}"
            if [ "${arg}" = "production" ]; then
                migrate_database
            fi
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            status_services
            ;;
        "logs")
            view_logs "$arg"
            ;;
        "build")
            check_dependencies
            build_images
            ;;
        "migrate")
            migrate_database
            ;;
        "backup")
            backup_database
            ;;
        "restore")
            restore_database "$arg"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|""|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@"