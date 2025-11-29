package com.stardustbi.repository;

import com.stardustbi.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    
    @Query("SELECT m FROM TeamMember m WHERE m.team.id = :teamId AND m.userId = :userId")
    Optional<TeamMember> findByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") String userId);
    
    @Query("SELECT m FROM TeamMember m WHERE m.team.id = :teamId")
    List<TeamMember> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT m FROM TeamMember m WHERE m.userId = :userId")
    List<TeamMember> findByUserId(@Param("userId") String userId);
    
    @Query("SELECT COUNT(m) > 0 FROM TeamMember m WHERE m.team.id = :teamId AND m.userId = :userId")
    boolean existsByTeamIdAndUserId(@Param("teamId") Long teamId, @Param("userId") String userId);
    
    @Query("SELECT COUNT(m) > 0 FROM TeamMember m WHERE m.team.id = :teamId AND m.userId = :userId AND m.role IN ('OWNER', 'ADMIN')")
    boolean isAdminOrOwner(@Param("teamId") Long teamId, @Param("userId") String userId);
}