package com.stardustbi.dto.response;

import com.stardustbi.domain.model.DataSource;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 数据源响应DTO
 * 
 * @author Auto Report Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "数据源响应信息")
public class DataSourceResponse {
    
    @Schema(description = "数据源ID", example = "1")
    private Long id;
    
    @Schema(description = "数据源名称", example = "生产MySQL数据库")
    private String name;
    
    @Schema(description = "数据源描述", example = "生产环境的主要业务数据库")
    private String description;
    
    @Schema(description = "数据源类型", example = "MYSQL")
    private DataSource.DataSourceType type;
    
    @Schema(description = "主机地址", example = "localhost")
    private String host;
    
    @Schema(description = "端口号", example = "3306")
    private Integer port;
    
    @Schema(description = "数据库名称", example = "business_db")
    private String database;
    
    @Schema(description = "用户名", example = "root")
    private String username;
    
    @Schema(description = "连接字符串", example = "jdbc:mysql://localhost:3306/business_db")
    private String connectionString;
    
    @Schema(description = "连接属性配置")
    private Map<String, String> properties;
    
    @Schema(description = "数据源状态", example = "CONNECTED")
    private DataSource.DataSourceStatus status;
    
    @Schema(description = "最后连接测试时间")
    private LocalDateTime lastConnectionTest;
    
    @Schema(description = "连接测试结果", example = "true")
    private Boolean connectionTestResult;
    
    @Schema(description = "错误信息")
    private String errorMessage;
    
    @Schema(description = "是否激活", example = "true")
    private Boolean isActive;
    
    @Schema(description = "创建者")
    private String createdBy;
    
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;
    
    @Schema(description = "最后更新时间")
    private LocalDateTime updatedAt;
}