-- Auto Report 数据库初始化脚本
-- 创建数据库和基础表结构

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `auto_report` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `auto_report`;

-- 创建数据源表
CREATE TABLE IF NOT EXISTS `data_source` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '数据源名称',
  `type` varchar(20) NOT NULL COMMENT '数据源类型（MYSQL、POSTGRESQL、ORACLE等）',
  `host` varchar(100) NOT NULL COMMENT '主机地址',
  `port` int NOT NULL COMMENT '端口号',
  `database_name` varchar(100) NOT NULL COMMENT '数据库名',
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码（加密存储）',
  `connection_params` text COMMENT '连接参数',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态（ACTIVE、INACTIVE）',
  `created_by` varchar(100) NOT NULL COMMENT '创建人',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据源表';

-- 创建数据集表
CREATE TABLE IF NOT EXISTS `dataset` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '数据集名称',
  `description` text COMMENT '数据集描述',
  `data_source_id` bigint NOT NULL COMMENT '数据源ID',
  `query_sql` text NOT NULL COMMENT '查询SQL',
  `fields_config` text COMMENT '字段配置',
  `cache_enabled` tinyint(1) DEFAULT '1' COMMENT '是否启用缓存',
  `cache_ttl` int DEFAULT '300' COMMENT '缓存时间（秒）',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态（ACTIVE、INACTIVE）',
  `created_by` varchar(100) NOT NULL COMMENT '创建人',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_data_source_id` (`data_source_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_dataset_data_source` FOREIGN KEY (`data_source_id`) REFERENCES `data_source` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据集表';

-- 创建协作团队表
CREATE TABLE IF NOT EXISTS `collaboration_team` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '团队名称',
  `description` varchar(500) DEFAULT NULL COMMENT '团队描述',
  `created_by` varchar(100) NOT NULL COMMENT '创建人',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='协作团队表';

-- 创建团队成员表
CREATE TABLE IF NOT EXISTS `team_member` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `team_id` bigint NOT NULL COMMENT '团队ID',
  `user_id` varchar(100) NOT NULL COMMENT '用户ID',
  `role` varchar(20) NOT NULL COMMENT '角色（OWNER、ADMIN、MEMBER）',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_team_user` (`team_id`, `user_id`),
  KEY `idx_team_id` (`team_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_member_team` FOREIGN KEY (`team_id`) REFERENCES `collaboration_team` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='团队成员表';

-- 创建共享资源表
CREATE TABLE IF NOT EXISTS `shared_resource` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `team_id` bigint NOT NULL COMMENT '团队ID',
  `resource_type` varchar(20) NOT NULL COMMENT '资源类型（DASHBOARD、CHART、DATASET等）',
  `resource_id` varchar(100) NOT NULL COMMENT '资源ID',
  `resource_name` varchar(200) NOT NULL COMMENT '资源名称',
  `permission_level` varchar(20) NOT NULL COMMENT '权限级别（READ、WRITE、MANAGE）',
  `shared_by` varchar(100) NOT NULL COMMENT '分享人',
  `shared_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分享时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_team_resource` (`team_id`, `resource_type`, `resource_id`),
  KEY `idx_team_id` (`team_id`),
  KEY `idx_resource_type` (`resource_type`),
  KEY `idx_resource_id` (`resource_id`),
  CONSTRAINT `fk_shared_resource_team` FOREIGN KEY (`team_id`) REFERENCES `collaboration_team` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='共享资源表';

-- 创建评论表
CREATE TABLE IF NOT EXISTS `comment` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `resource_type` varchar(20) NOT NULL COMMENT '资源类型',
  `resource_id` varchar(100) NOT NULL COMMENT '资源ID',
  `content` text NOT NULL COMMENT '评论内容',
  `parent_comment_id` bigint DEFAULT NULL COMMENT '父评论ID',
  `created_by` varchar(100) NOT NULL COMMENT '创建人',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_resource` (`resource_type`, `resource_id`),
  KEY `idx_parent_comment` (`parent_comment_id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_comment_id`) REFERENCES `comment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 创建用户表（简化版，实际项目中应该与用户认证系统集成）
CREATE TABLE IF NOT EXISTS `user` (
  `id` varchar(100) NOT NULL COMMENT '用户ID',
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `email` varchar(100) NOT NULL COMMENT '邮箱',
  `display_name` varchar(100) DEFAULT NULL COMMENT '显示名称',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入示例数据
INSERT IGNORE INTO `user` (`id`, `username`, `email`, `display_name`, `avatar`, `status`) VALUES
('user1', 'admin', 'admin@example.com', '系统管理员', NULL, 'ACTIVE'),
('user2', 'zhangsan', 'zhangsan@example.com', '张三', NULL, 'ACTIVE'),
('user3', 'lisi', 'lisi@example.com', '李四', NULL, 'ACTIVE'),
('user4', 'wangwu', 'wangwu@example.com', '王五', NULL, 'ACTIVE');

-- 插入示例团队
INSERT IGNORE INTO `collaboration_team` (`id`, `name`, `description`, `created_by`) VALUES
(1, '数据分析团队', '负责公司数据分析工作', 'user1'),
(2, '产品团队', '产品需求分析和设计', 'user2');

-- 插入团队成员
INSERT IGNORE INTO `team_member` (`team_id`, `user_id`, `role`) VALUES
(1, 'user1', 'OWNER'),
(1, 'user2', 'ADMIN'),
(1, 'user3', 'MEMBER'),
(2, 'user2', 'OWNER'),
(2, 'user4', 'MEMBER');

SET FOREIGN_KEY_CHECKS = 1;