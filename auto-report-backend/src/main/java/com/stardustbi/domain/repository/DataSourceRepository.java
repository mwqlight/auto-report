package com.stardustbi.domain.repository;

import com.stardustbi.domain.model.DataSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 数据源仓库接口
 * 
 * @author Auto Report Team
 */
@Repository
public interface DataSourceRepository extends JpaRepository<DataSource, Long> {

    /**
     * 根据名称查找数据源
     */
    Optional<DataSource> findByName(String name);

    /**
     * 检查名称是否存在
     */
    boolean existsByName(String name);

    /**
     * 根据类型查找数据源
     */
    List<DataSource> findByType(DataSource.DataSourceType type);

    /**
     * 根据状态查找数据源
     */
    List<DataSource> findByStatus(DataSource.DataSourceStatus status);

    /**
     * 查找所有激活的数据源
     */
    List<DataSource> findAllByIsActiveTrue();

    /**
     * 根据类型和状态分页查找数据源
     */
    Page<DataSource> findByTypeAndStatus(DataSource.DataSourceType type, 
                                        DataSource.DataSourceStatus status, 
                                        Pageable pageable);

    /**
     * 统计各类型数据源数量
     */
    @Query("SELECT d.type, COUNT(d) FROM DataSource d GROUP BY d.type")
    List<Object[]> countByType();

    /**
     * 查找最近更新的数据源
     */
    @Query("SELECT d FROM DataSource d ORDER BY d.updatedAt DESC")
    List<DataSource> findRecentDataSources(Pageable pageable);

    /**
     * 根据名称模糊搜索
     */
    @Query("SELECT d FROM DataSource d WHERE d.name LIKE %:keyword% OR d.description LIKE %:keyword%")
    List<DataSource> searchByNameOrDescription(@Param("keyword") String keyword);
}