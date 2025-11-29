package com.stardustbi.controller;

import com.stardustbi.domain.model.DataSource;
import com.stardustbi.dto.request.DataSourceRequest;
import com.stardustbi.dto.response.ApiResponse;
import com.stardustbi.dto.response.DataSourceResponse;
import com.stardustbi.dto.response.ConnectionTestResult;
import com.stardustbi.service.DataSourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 数据源管理控制器
 * 
 * @author Auto Report Team
 */
@RestController
@RequestMapping("/api/v1/datasources")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "数据源管理", description = "数据源连接、配置和管理API")
public class DataSourceController {

    private final DataSourceService dataSourceService;

    @Operation(summary = "获取所有数据源列表")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DataSourceResponse>>> getAllDataSources() {
        log.info("获取所有数据源列表");
        List<DataSourceResponse> dataSources = dataSourceService.findAll();
        return ResponseEntity.ok(ApiResponse.success(dataSources));
    }

    @Operation(summary = "分页获取数据源列表")
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<DataSourceResponse>>> getDataSourcesPage(Pageable pageable) {
        log.info("分页获取数据源列表，页码: {}, 大小: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<DataSourceResponse> dataSources = dataSourceService.findPage(pageable);
        return ResponseEntity.ok(ApiResponse.success(dataSources));
    }

    @Operation(summary = "根据ID获取数据源详情")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DataSourceResponse>> getDataSourceById(@PathVariable Long id) {
        log.info("根据ID获取数据源详情: {}", id);
        DataSourceResponse dataSource = dataSourceService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(dataSource));
    }

    @Operation(summary = "创建新数据源")
    @PostMapping
    public ResponseEntity<ApiResponse<DataSourceResponse>> createDataSource(
            @Valid @RequestBody DataSourceRequest request) {
        log.info("创建新数据源: {}", request.getName());
        DataSourceResponse dataSource = dataSourceService.create(request);
        return ResponseEntity.ok(ApiResponse.success(dataSource));
    }

    @Operation(summary = "更新数据源")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DataSourceResponse>> updateDataSource(
            @PathVariable Long id,
            @Valid @RequestBody DataSourceRequest request) {
        log.info("更新数据源: {}", id);
        DataSourceResponse dataSource = dataSourceService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(dataSource));
    }

    @Operation(summary = "删除数据源")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDataSource(@PathVariable Long id) {
        log.info("删除数据源: {}", id);
        dataSourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Operation(summary = "测试数据源连接")
    @PostMapping("/{id}/test")
    public ResponseEntity<ApiResponse<ConnectionTestResult>> testDataSourceConnection(@PathVariable Long id) {
        log.info("测试数据源连接: {}", id);
        ConnectionTestResult result = dataSourceService.testConnection(id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "测试数据源连接配置")
    @PostMapping("/test")
    public ResponseEntity<ApiResponse<ConnectionTestResult>> testDataSourceConnection(
            @Valid @RequestBody DataSourceRequest request) {
        log.info("测试数据源连接配置: {}", request.getName());
        ConnectionTestResult result = dataSourceService.testConnection(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "激活数据源")
    @PostMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<DataSourceResponse>> activateDataSource(@PathVariable Long id) {
        log.info("激活数据源: {}", id);
        DataSourceResponse dataSource = dataSourceService.activate(id);
        return ResponseEntity.ok(ApiResponse.success(dataSource));
    }

    @Operation(summary = "停用数据源")
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<DataSourceResponse>> deactivateDataSource(@PathVariable Long id) {
        log.info("停用数据源: {}", id);
        DataSourceResponse dataSource = dataSourceService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(dataSource));
    }

    @Operation(summary = "获取数据源类型列表")
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<DataSource.DataSourceType>>> getDataSourceTypes() {
        log.info("获取数据源类型列表");
        List<DataSource.DataSourceType> types = List.of(DataSource.DataSourceType.values());
        return ResponseEntity.ok(ApiResponse.success(types));
    }
}