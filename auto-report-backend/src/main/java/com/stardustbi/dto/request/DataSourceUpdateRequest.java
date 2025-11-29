package com.stardustbi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新数据源请求DTO
 * 
 * @author Stardust BI Team
 * @version 1.0.0
 */
@Data
public class DataSourceUpdateRequest {
    
    @NotBlank(message = "数据源名称不能为空")
    private String name;
    
    @NotBlank(message = "数据源类型不能为空")
    private String type;
    
    @NotBlank(message = "主机地址不能为空")
    private String host;
    
    @NotNull(message = "端口不能为空")
    private Integer port;
    
    @NotBlank(message = "数据库名不能为空")
    private String database;
    
    @NotBlank(message = "用户名不能为空")
    private String username;
    
    @NotBlank(message = "密码不能为空")
    private String password;
    
    private String description;
    
    @NotNull(message = "启用状态不能为空")
    private Boolean enabled;
}