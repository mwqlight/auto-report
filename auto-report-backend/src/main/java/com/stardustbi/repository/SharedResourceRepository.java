package com.stardustbi.repository;

import com.stardustbi.entity.SharedResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SharedResourceRepository extends JpaRepository<SharedResource, Long> {
    
    @Query("SELECT sr FROM SharedResource sr WHERE sr.team.id = :teamId")
    List<SharedResource> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT sr FROM SharedResource sr JOIN sr.team t JOIN t.members m WHERE m.userId = :userId")
    List<SharedResource> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT sr FROM SharedResource sr WHERE sr.resourceType = :resourceType AND sr.resourceId = :resourceId")
    List<SharedResource> findByResource(@Param("resourceType") SharedResource.ResourceType resourceType, 
                                       @Param("resourceId") String resourceId);
}