package com.stardustbi.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

/**
 * 维度字段实体类
 * 
 * @author Auto Report Team
 */
@Entity
@Table(name = "dimension_fields")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimensionField {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dataset_id", nullable = false)
    private Dataset dataset;
    
    @Column(nullable = false)
    private String name;
    
    @Column
    private String displayName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType type;
    
    @Column(name = "source_field")
    private String sourceField;
    
    @Column(name = "expression")
    private String expression;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "hierarchy_type")
    private HierarchyType hierarchyType;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "is_required")
    private Boolean isRequired;
    
    @Column(name = "is_filterable")
    private Boolean isFilterable;
    
    /**
     * 字段类型枚举
     */
    public enum FieldType {
        STRING("字符串"),
        NUMBER("数字"),
        DATE("日期"),
        DATETIME("日期时间"),
        BOOLEAN("布尔值"),
        CATEGORY("分类");
        
        private final String displayName;
        
        FieldType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    /**
     * 层级类型枚举
     */
    public enum HierarchyType {
        NONE("无层级"),
        TIME("时间层级"),
        GEOGRAPHY("地理层级"),
        ORGANIZATION("组织层级"),
        CUSTOM("自定义层级");
        
        private final String displayName;
        
        HierarchyType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}