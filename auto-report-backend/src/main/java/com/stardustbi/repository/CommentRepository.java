package com.stardustbi.repository;

import com.stardustbi.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @Query("SELECT c FROM Comment c WHERE c.resourceType = :resourceType AND c.resourceId = :resourceId AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findByResource(@Param("resourceType") Comment.ResourceType resourceType, 
                                @Param("resourceId") String resourceId);
    
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentCommentId ORDER BY c.createdAt ASC")
    List<Comment> findByParentCommentId(@Param("parentCommentId") Long parentCommentId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.resourceType = :resourceType AND c.resourceId = :resourceId")
    long countByResource(@Param("resourceType") Comment.ResourceType resourceType, 
                        @Param("resourceId") String resourceId);
}