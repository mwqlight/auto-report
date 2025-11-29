package com.stardustbi.controller;

import com.stardustbi.dto.request.*;
import com.stardustbi.dto.response.TeamResponse;
import com.stardustbi.dto.response.CommentResponse;
import com.stardustbi.entity.*;
import com.stardustbi.service.CollaborationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/collaboration")
@RequiredArgsConstructor
@Tag(name = "协作与共享", description = "团队协作和资源共享相关接口")
public class CollaborationController {
    
    private final CollaborationService collaborationService;
    
    // 团队管理接口
    
    @PostMapping("/teams")
    @Operation(summary = "创建团队")
    public ResponseEntity<CollaborationTeam> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            @RequestHeader("X-User-Id") String currentUserId) {
        CollaborationTeam team = collaborationService.createTeam(request, currentUserId);
        return ResponseEntity.ok(team);
    }
    
    @GetMapping("/teams")
    @Operation(summary = "获取用户团队列表")
    public ResponseEntity<List<TeamResponse>> getUserTeams(
            @RequestHeader("X-User-Id") String userId) {
        List<TeamResponse> teams = collaborationService.getUserTeams(userId);
        return ResponseEntity.ok(teams);
    }
    
    @GetMapping("/teams/{teamId}")
    @Operation(summary = "获取团队详情")
    public ResponseEntity<TeamResponse> getTeamById(
            @PathVariable Long teamId,
            @RequestHeader("X-User-Id") String userId) {
        TeamResponse team = collaborationService.getTeamById(teamId, userId);
        return ResponseEntity.ok(team);
    }
    
    @PostMapping("/teams/{teamId}/members")
    @Operation(summary = "添加团队成员")
    public ResponseEntity<Void> addMemberToTeam(
            @PathVariable Long teamId,
            @Valid @RequestBody AddMemberRequest request,
            @RequestHeader("X-User-Id") String currentUserId) {
        collaborationService.addMemberToTeam(teamId, request, currentUserId);
        return ResponseEntity.ok().build();
    }
    
    // 资源共享接口
    
    @PostMapping("/teams/{teamId}/resources")
    @Operation(summary = "分享资源到团队")
    public ResponseEntity<Void> shareResource(
            @PathVariable Long teamId,
            @Valid @RequestBody ShareResourceRequest request,
            @RequestHeader("X-User-Id") String currentUserId) {
        collaborationService.shareResource(teamId, request, currentUserId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/resources")
    @Operation(summary = "获取用户共享资源列表")
    public ResponseEntity<List<SharedResource>> getUserSharedResources(
            @RequestHeader("X-User-Id") String userId) {
        List<SharedResource> resources = collaborationService.getUserSharedResources(userId);
        return ResponseEntity.ok(resources);
    }
    
    // 评论接口
    
    @PostMapping("/comments")
    @Operation(summary = "创建评论")
    public ResponseEntity<Comment> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            @RequestHeader("X-User-Id") String currentUserId) {
        Comment comment = collaborationService.createComment(request, currentUserId);
        return ResponseEntity.ok(comment);
    }
    
    @GetMapping("/comments")
    @Operation(summary = "获取资源评论列表")
    public ResponseEntity<List<CommentResponse>> getResourceComments(
            @RequestParam Comment.ResourceType resourceType,
            @RequestParam String resourceId) {
        List<CommentResponse> comments = collaborationService.getResourceComments(resourceType, resourceId);
        return ResponseEntity.ok(comments);
    }
}