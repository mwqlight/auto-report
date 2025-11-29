package com.stardustbi.service.impl;

import com.stardustbi.domain.model.DataSource;
import com.stardustbi.domain.repository.DataSourceRepository;
import com.stardustbi.dto.request.DataSourceRequest;
import com.stardustbi.dto.response.DataSourceResponse;
import com.stardustbi.dto.response.ConnectionTestResult;
import com.stardustbi.service.DataSourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Connection;
import java.sql.DriverManager;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 数据源服务实现类
 * 
 * @author Auto Report Team
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataSourceServiceImpl implements DataSourceService {

    private final DataSourceRepository dataSourceRepository;
    private final DataSourceMapper dataSourceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DataSourceResponse> findAll() {
        log.info("查询所有数据源");
        List<DataSource> dataSources = dataSourceRepository.findAllByIsActiveTrue();
        return dataSources.stream()
                .map(dataSourceMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DataSourceResponse> findPage(Pageable pageable) {
        log.info("分页查询数据源，页码: {}, 大小: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<DataSource> dataSourcePage = dataSourceRepository.findAll(pageable);
        return dataSourcePage.map(dataSourceMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public DataSourceResponse findById(Long id) {
        log.info("根据ID查询数据源: {}", id);
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id));
        return dataSourceMapper.toResponse(dataSource);
    }

    @Override
    @Transactional
    public DataSourceResponse create(DataSourceRequest request) {
        log.info("创建数据源: {}", request.getName());
        
        // 检查名称是否重复
        if (dataSourceRepository.existsByName(request.getName())) {
            throw new RuntimeException("数据源名称已存在: " + request.getName());
        }
        
        DataSource dataSource = dataSourceMapper.toEntity(request);
        dataSource.setStatus(DataSource.DataSourceStatus.DISCONNECTED);
        dataSource.setIsActive(true);
        dataSource.setCreatedBy("system"); // TODO: 从安全上下文获取用户
        
        DataSource savedDataSource = dataSourceRepository.save(dataSource);
        log.info("数据源创建成功，ID: {}", savedDataSource.getId());
        
        return dataSourceMapper.toResponse(savedDataSource);
    }

    @Override
    @Transactional
    public DataSourceResponse update(Long id, DataSourceRequest request) {
        log.info("更新数据源: {}", id);
        
        DataSource existingDataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id));
        
        // 检查名称是否重复（排除当前数据源）
        if (!existingDataSource.getName().equals(request.getName()) && 
            dataSourceRepository.existsByName(request.getName())) {
            throw new RuntimeException("数据源名称已存在: " + request.getName());
        }
        
        dataSourceMapper.updateEntityFromRequest(request, existingDataSource);
        existingDataSource.setStatus(DataSource.DataSourceStatus.DISCONNECTED);
        
        DataSource updatedDataSource = dataSourceRepository.save(existingDataSource);
        log.info("数据源更新成功，ID: {}", updatedDataSource.getId());
        
        return dataSourceMapper.toResponse(updatedDataSource);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("删除数据源: {}", id);
        
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id));
        
        // TODO: 检查是否有数据集依赖此数据源
        
        dataSourceRepository.delete(dataSource);
        log.info("数据源删除成功，ID: {}", id);
    }

    @Override
    @Transactional
    public ConnectionTestResult testConnection(Long id) {
        log.info("测试数据源连接: {}", id);
        
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id));
        
        return testConnection(dataSource);
    }

    @Override
    public ConnectionTestResult testConnection(DataSourceRequest request) {
        log.info("测试数据源连接配置: {}", request.getName());
        
        DataSource dataSource = dataSourceMapper.toEntity(request);
        return testConnection(dataSource);
    }

    @Override
    @Transactional
    public DataSourceResponse activate(Long id) {
        log.info("激活数据源: {}", id);
        
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id));
        
        dataSource.setIsActive(true);
        DataSource updatedDataSource = dataSourceRepository.save(dataSource);
        
        log.info("数据源激活成功，ID: {}", id);
        return dataSourceMapper.toResponse(updatedDataSource);
    }

    @Override
    @Transactional
    public DataSourceResponse deactivate(Long id) {
        log.info("停用数据源: {}", id);
        
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id));
        
        dataSource.setIsActive(false);
        DataSource updatedDataSource = dataSourceRepository.save(dataSource);
        
        log.info("数据源停用成功，ID: {}", id);
        return dataSourceMapper.toResponse(updatedDataSource);
    }

    /**
     * 测试数据源连接
     */
    private ConnectionTestResult testConnection(DataSource dataSource) {
        ConnectionTestResult result = ConnectionTestResult.builder()
                .success(false)
                .build();
        
        long startTime = System.currentTimeMillis();
        
        try {
            String connectionUrl = buildConnectionUrl(dataSource);
            log.debug("尝试连接数据库: {}", connectionUrl);
            
            try (Connection connection = DriverManager.getConnection(
                    connectionUrl, 
                    dataSource.getUsername(), 
                    dataSource.getPassword())) {
                
                long endTime = System.currentTimeMillis();
                result.setSuccess(true);
                result.setConnectionTime(endTime - startTime);
                result.setDatabaseVersion(connection.getMetaData().getDatabaseProductVersion());
                
                log.info("数据源连接测试成功，耗时: {}ms", result.getConnectionTime());
            }
            
        } catch (Exception e) {
            log.error("数据源连接测试失败: {}", e.getMessage());
            result.setErrorMessage(e.getMessage());
        }
        
        return result;
    }

    /**
     * 构建数据库连接URL
     */
    private String buildConnectionUrl(DataSource dataSource) {
        if (dataSource.getConnectionString() != null && !dataSource.getConnectionString().isEmpty()) {
            return dataSource.getConnectionString();
        }
        
        switch (dataSource.getType()) {
            case MYSQL:
                return String.format("jdbc:mysql://%s:%d/%s", 
                    dataSource.getHost(), dataSource.getPort(), dataSource.getDatabase());
            case POSTGRESQL:
                return String.format("jdbc:postgresql://%s:%d/%s", 
                    dataSource.getHost(), dataSource.getPort(), dataSource.getDatabase());
            case ORACLE:
                return String.format("jdbc:oracle:thin:@%s:%d:%s", 
                    dataSource.getHost(), dataSource.getPort(), dataSource.getDatabase());
            case SQLSERVER:
                return String.format("jdbc:sqlserver://%s:%d;databaseName=%s", 
                    dataSource.getHost(), dataSource.getPort(), dataSource.getDatabase());
            case CLICKHOUSE:
                return String.format("jdbc:clickhouse://%s:%d/%s", 
                    dataSource.getHost(), dataSource.getPort(), dataSource.getDatabase());
            default:
                throw new RuntimeException("不支持的数据源类型: " + dataSource.getType());
        }
    }
}