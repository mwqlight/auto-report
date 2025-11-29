package com.stardustbi.service;

import com.stardustbi.domain.model.DataSource;
import com.stardustbi.dto.request.DataSourceRequest;
import com.stardustbi.dto.response.DataSourceResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * 数据源映射器接口
 * 
 * @author Auto Report Team
 */
@Mapper(componentModel = "spring")
public interface DataSourceMapper {

    /**
     * 将请求DTO转换为实体
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "lastConnectionTest", ignore = true)
    @Mapping(target = "connectionTestResult", ignore = true)
    @Mapping(target = "errorMessage", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    DataSource toEntity(DataSourceRequest request);

    /**
     * 将实体转换为响应DTO
     */
    @Mapping(target = "password", ignore = true)
    DataSourceResponse toResponse(DataSource entity);

    /**
     * 使用请求DTO更新实体
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "lastConnectionTest", ignore = true)
    @Mapping(target = "connectionTestResult", ignore = true)
    @Mapping(target = "errorMessage", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(DataSourceRequest request, @MappingTarget DataSource entity);
}