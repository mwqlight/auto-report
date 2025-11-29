package com.stardustbi.repository;

import com.stardustbi.domain.entity.DataSourceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 数据源数据访问层
 * 
 * @author Stardust BI Team
 * @version 1.0.0
 */
@Repository
public interface DataSourceRepository extends JpaRepository<DataSourceEntity, Long>, JpaSpecificationExecutor<DataSourceEntity> {
    
    /**
     * 根据名称查找数据源
     */
    Optional<DataSourceEntity> findByName(String name);
    
    /**
     * 根据类型查找数据源
     */
    List<DataSourceEntity> findByType(String type);
    
    /**
     * 根据启用状态查找数据源
     */
    List<DataSourceEntity> findByEnabled(Boolean enabled);
    
    /**
     * 根据名称模糊查询
     */
    List<DataSourceEntity> findByNameContaining(String name);
    
    /**
     * 分页查询数据源
     */
    Page<DataSourceEntity> findAllByDeletedFalse(Pageable pageable);
    
    /**
     * 逻辑删除数据源
     */
    @Modifying
    @Query("UPDATE DataSourceEntity d SET d.deleted = true WHERE d.id = :id")
    void softDeleteById(@Param("id") Long id);
    
    /**
     * 检查名称是否已存在（排除当前ID）
     */
    @Query("SELECT COUNT(d) > 0 FROM DataSourceEntity d WHERE d.name = :name AND d.id != :id AND d.deleted = false")
    boolean existsByNameAndIdNot(@Param("name") String name, @Param("id") Long id);
}