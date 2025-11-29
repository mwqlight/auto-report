package com.stardustbi.dto.request;

import com.stardustbi.domain.model.DataSource;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

/**
 * 数据源请求DTO
 * 
 * @author Auto Report Team
 */
@Data
@Schema(description = "数据源请求参数")
public class DataSourceRequest {
    
    @NotBlank(message = "数据源名称不能为空")
    @Schema(description = "数据源名称", example = "生产MySQL数据库")
    private String name;
    
    @Schema(description = "数据源描述", example = "生产环境的主要业务数据库")
    private String description;
    
    @NotNull(message = "数据源类型不能为空")
    @Schema(description = "数据源类型", example = "MYSQL")
    private DataSource.DataSourceType type;
    
    @NotBlank(message = "主机地址不能为空")
    @Schema(description = "主机地址", example = "localhost")
    private String host;
    
    @NotNull(message = "端口号不能为空")
    @Schema(description = "端口号", example = "3306")
    private Integer port;
    
    @NotBlank(message = "数据库名称不能为空")
    @Schema(description = "数据库名称", example = "business_db")
    private String database;
    
    @NotBlank(message = "用户名不能为空")
    @Schema(description = "用户名", example = "root")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Schema(description = "密码", example = "password")
    private String password;
    
    @Schema(description = "连接字符串（可选）", example = "jdbc:mysql://localhost:3306/business_db")
    private String connectionString;
    
    @Schema(description = "连接属性配置")
    private Map<String, String> properties;
    
    @Schema(description = "是否激活", example = "true")
    private Boolean isActive = true;
}