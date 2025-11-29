package com.stardustbi.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 连接测试结果DTO
 * 
 * @author Auto Report Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "数据源连接测试结果")
public class ConnectionTestResult {
    
    @Schema(description = "测试是否成功", example = "true")
    private Boolean success;
    
    @Schema(description = "错误信息（如果测试失败）")
    private String errorMessage;
    
    @Schema(description = "连接耗时（毫秒）", example = "150")
    private Long connectionTime;
    
    @Schema(description = "数据库版本信息")
    private String databaseVersion;
    
    @Schema(description = "可用表数量", example = "25")
    private Integer tableCount;
    
    @Schema(description = "可用视图数量", example = "10")
    private Integer viewCount;
    
    @Schema(description = "数据库大小（字节）", example = "104857600")
    private Long databaseSize;
    
    @Schema(description = "数据库字符集")
    private String charset;
    
    @Schema(description = "数据库排序规则")
    private String collation;
    
    @Schema(description = "表列表预览（前10个）")
    private List<String> tableList;
    
    @Schema(description = "数据库统计信息")
    private Map<String, Object> statistics;
}