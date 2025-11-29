package com.stardustbi.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;

/**
 * 数据源实体类
 * 
 * @author Stardust BI Team
 * @version 1.0.0
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "data_source")
@Where(clause = "deleted = false")
public class DataSourceEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "数据源名称不能为空")
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotBlank(message = "数据源类型不能为空")
    @Column(nullable = false, length = 50)
    private String type;
    
    @NotBlank(message = "主机地址不能为空")
    @Column(nullable = false, length = 100)
    private String host;
    
    @NotNull(message = "端口不能为空")
    @Column(nullable = false)
    private Integer port;
    
    @NotBlank(message = "数据库名不能为空")
    @Column(nullable = false, length = 100)
    private String database;
    
    @NotBlank(message = "用户名不能为空")
    @Column(nullable = false, length = 50)
    private String username;
    
    @NotBlank(message = "密码不能为空")
    @Column(nullable = false, length = 500)
    private String password;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createTime;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updateTime;
    
    @Column(length = 50)
    private String createBy;
    
    @Column(length = 50)
    private String updateBy;
    
    /**
     * 获取连接URL
     */
    public String getConnectionUrl() {
        switch (type.toLowerCase()) {
            case "mysql":
                return String.format("jdbc:mysql://%s:%d/%s", host, port, database);
            case "postgresql":
                return String.format("jdbc:postgresql://%s:%d/%s", host, port, database);
            case "oracle":
                return String.format("jdbc:oracle:thin:@%s:%d:%s", host, port, database);
            case "sqlserver":
                return String.format("jdbc:sqlserver://%s:%d;databaseName=%s", host, port, database);
            default:
                throw new IllegalArgumentException("不支持的数据源类型: " + type);
        }
    }
}