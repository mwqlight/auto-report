package com.stardustbi.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 数据集实体类
 * 
 * @author Auto Report Team
 */
@Entity
@Table(name = "datasets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dataset {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(length = 2000)
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "data_source_id", nullable = false)
    private DataSource dataSource;
    
    @Column(name = "source_table")
    private String sourceTable;
    
    @Column(name = "source_query")
    @Lob
    private String sourceQuery;
    
    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DimensionField> dimensions;
    
    @OneToMany(mappedBy = "dataset", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MetricField> metrics;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DatasetType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DatasetStatus status;
    
    @Column(name = "refresh_policy")
    @Enumerated(EnumType.STRING)
    private RefreshPolicy refreshPolicy;
    
    @Column(name = "last_refresh_time")
    private LocalDateTime lastRefreshTime;
    
    @Column(name = "refresh_interval")
    private Integer refreshInterval; // 分钟
    
    @Column(name = "row_count")
    private Long rowCount;
    
    @Column(name = "data_size")
    private Long dataSize; // 字节
    
    @Column(name = "is_public")
    private Boolean isPublic;
    
    @Column(name = "created_by")
    private String createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 数据集类型枚举
     */
    public enum DatasetType {
        TABLE("数据表"),
        QUERY("查询结果"),
        VIEW("视图"),
        CUSTOM("自定义");
        
        private final String displayName;
        
        DatasetType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    /**
     * 数据集状态枚举
     */
    public enum DatasetStatus {
        DRAFT("草稿"),
        ACTIVE("活跃"),
        INACTIVE("停用"),
        ERROR("错误");
        
        private final String displayName;
        
        DatasetStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    /**
     * 刷新策略枚举
     */
    public enum RefreshPolicy {
        MANUAL("手动刷新"),
        HOURLY("每小时"),
        DAILY("每天"),
        WEEKLY("每周"),
        MONTHLY("每月");
        
        private final String displayName;
        
        RefreshPolicy(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}