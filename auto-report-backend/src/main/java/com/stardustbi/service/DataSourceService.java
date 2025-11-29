package com.stardustbi.service;

import com.stardustbi.domain.model.DataSource;
import com.stardustbi.dto.request.DataSourceRequest;
import com.stardustbi.dto.response.DataSourceResponse;
import com.stardustbi.dto.response.ConnectionTestResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 数据源服务接口
 * 
 * @author Auto Report Team
 */
public interface DataSourceService {

    /**
     * 获取所有数据源
     */
    List<DataSourceResponse> findAll();

    /**
     * 分页获取数据源
     */
    Page<DataSourceResponse> findPage(Pageable pageable);

    /**
     * 根据ID获取数据源
     */
    DataSourceResponse findById(Long id);

    /**
     * 创建数据源
     */
    DataSourceResponse create(DataSourceRequest request);

    /**
     * 更新数据源
     */
    DataSourceResponse update(Long id, DataSourceRequest request);

    /**
     * 删除数据源
     */
    void delete(Long id);

    /**
     * 测试数据源连接
     */
    ConnectionTestResult testConnection(Long id);

    /**
     * 测试数据源连接配置
     */
    ConnectionTestResult testConnection(DataSourceRequest request);

    /**
     * 激活数据源
     */
    DataSourceResponse activate(Long id);

    /**
     * 停用数据源
     */
    DataSourceResponse deactivate(Long id);
}