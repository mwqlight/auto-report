package com.stardustbi.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 数据源实体类
 * 
 * @author Auto Report Team
 */
@Entity
@Table(name = "data_sources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataSource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataSourceType type;
    
    @Column(nullable = false)
    private String host;
    
    @Column(nullable = false)
    private Integer port;
    
    @Column(nullable = false)
    private String database;
    
    @Column(nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "connection_string")
    private String connectionString;
    
    @ElementCollection
    @CollectionTable(name = "data_source_properties", joinColumns = @JoinColumn(name = "data_source_id"))
    @MapKeyColumn(name = "property_key")
    @Column(name = "property_value")
    private Map<String, String> properties;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DataSourceStatus status;
    
    @Column(name = "last_connection_test")
    private LocalDateTime lastConnectionTest;
    
    @Column(name = "connection_test_result")
    private Boolean connectionTestResult;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 数据源类型枚举
     */
    public enum DataSourceType {
        MYSQL("MySQL"),
        POSTGRESQL("PostgreSQL"),
        ORACLE("Oracle"),
        SQLSERVER("SQL Server"),
        CLICKHOUSE("ClickHouse"),
        MONGODB("MongoDB"),
        ELASTICSEARCH("Elasticsearch"),
        API("API接口"),
        CSV("CSV文件"),
        EXCEL("Excel文件");
        
        private final String displayName;
        
        DataSourceType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    /**
     * 数据源状态枚举
     */
    public enum DataSourceStatus {
        CONNECTED("已连接"),
        DISCONNECTED("未连接"),
        ERROR("连接错误"),
        TESTING("测试中");
        
        private final String displayName;
        
        DataSourceStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}