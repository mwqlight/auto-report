package com.stardustbi.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

/**
 * 指标字段实体类
 * 
 * @author Auto Report Team
 */
@Entity
@Table(name = "metric_fields")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricField {
    
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
    private AggregationType aggregationType;
    
    @Column(name = "source_field")
    private String sourceField;
    
    @Column(name = "expression")
    private String expression;
    
    @Column(name = "format")
    private String format;
    
    @Column(name = "decimal_places")
    private Integer decimalPlaces;
    
    @Column(name = "is_currency")
    private Boolean isCurrency;
    
    @Column(name = "currency_symbol")
    private String currencySymbol;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "is_calculated")
    private Boolean isCalculated;
    
    /**
     * 聚合类型枚举
     */
    public enum AggregationType {
        SUM("求和"),
        AVG("平均值"),
        COUNT("计数"),
        COUNT_DISTINCT("去重计数"),
        MAX("最大值"),
        MIN("最小值"),
        MEDIAN("中位数"),
        STDDEV("标准差");
        
        private final String displayName;
        
        AggregationType(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}