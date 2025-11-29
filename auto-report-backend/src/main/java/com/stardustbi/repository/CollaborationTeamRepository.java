package com.stardustbi.repository;

import com.stardustbi.entity.CollaborationTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollaborationTeamRepository extends JpaRepository<CollaborationTeam, Long> {
    
    Optional<CollaborationTeam> findByName(String name);
    
    @Query("SELECT t FROM CollaborationTeam t JOIN t.members m WHERE m.userId = :userId")
    List<CollaborationTeam> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT t FROM CollaborationTeam t JOIN t.members m WHERE m.userId = :userId AND m.role = 'OWNER'")
    List<CollaborationTeam> findOwnedTeamsByUserId(@Param("userId") String userId);
    
    boolean existsByName(String name);
}