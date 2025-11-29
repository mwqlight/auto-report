package com.stardustbi.service;

import com.stardustbi.dto.request.*;
import com.stardustbi.dto.response.TeamResponse;
import com.stardustbi.dto.response.CommentResponse;
import com.stardustbi.entity.*;
import com.stardustbi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollaborationService {
    
    private final CollaborationTeamRepository teamRepository;
    private final TeamMemberRepository memberRepository;
    private final SharedResourceRepository resourceRepository;
    private final CommentRepository commentRepository;
    
    // 团队管理相关方法
    
    @Transactional
    public CollaborationTeam createTeam(CreateTeamRequest request, String currentUserId) {
        if (teamRepository.existsByName(request.getName())) {
            throw new RuntimeException("团队名称已存在");
        }
        
        CollaborationTeam team = new CollaborationTeam();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setCreatedBy(currentUserId);
        
        CollaborationTeam savedTeam = teamRepository.save(team);
        
        // 创建者自动成为OWNER
        TeamMember ownerMember = new TeamMember();
        ownerMember.setTeam(savedTeam);
        ownerMember.setUserId(currentUserId);
        ownerMember.setRole(TeamMember.TeamRole.OWNER);
        memberRepository.save(ownerMember);
        
        return savedTeam;
    }
    
    @Transactional(readOnly = true)
    public List<TeamResponse> getUserTeams(String userId) {
        List<CollaborationTeam> teams = teamRepository.findByUserId(userId);
        return teams.stream().map(this::convertToTeamResponse).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Long teamId, String userId) {
        CollaborationTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("团队不存在"));
        
        // 检查用户是否有权限访问该团队
        if (!memberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new RuntimeException("无权访问该团队");
        }
        
        return convertToTeamResponse(team);
    }
    
    @Transactional
    public void addMemberToTeam(Long teamId, AddMemberRequest request, String currentUserId) {
        CollaborationTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("团队不存在"));
        
        // 检查当前用户是否有权限添加成员
        if (!memberRepository.isAdminOrOwner(teamId, currentUserId)) {
            throw new RuntimeException("无权添加成员");
        }
        
        // 检查成员是否已存在
        if (memberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new RuntimeException("用户已是团队成员");
        }
        
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUserId(request.getUserId());
        member.setRole(request.getRole());
        memberRepository.save(member);
    }
    
    // 资源共享相关方法
    
    @Transactional
    public void shareResource(Long teamId, ShareResourceRequest request, String currentUserId) {
        CollaborationTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("团队不存在"));
        
        // 检查当前用户是否有权限分享资源
        if (!memberRepository.isAdminOrOwner(teamId, currentUserId)) {
            throw new RuntimeException("无权分享资源");
        }
        
        SharedResource resource = new SharedResource();
        resource.setTeam(team);
        resource.setResourceType(request.getResourceType());
        resource.setResourceId(request.getResourceId());
        resource.setResourceName(request.getResourceName());
        resource.setPermissionLevel(request.getPermissionLevel() != null ? 
                request.getPermissionLevel() : SharedResource.PermissionLevel.READ_ONLY);
        resource.setSharedBy(currentUserId);
        
        resourceRepository.save(resource);
    }
    
    @Transactional(readOnly = true)
    public List<SharedResource> getUserSharedResources(String userId) {
        return resourceRepository.findByUserId(userId);
    }
    
    // 评论相关方法
    
    @Transactional
    public Comment createComment(CreateCommentRequest request, String currentUserId) {
        Comment comment = new Comment();
        comment.setResourceType(request.getResourceType());
        comment.setResourceId(request.getResourceId());
        comment.setContent(request.getContent());
        comment.setCreatedBy(currentUserId);
        
        if (request.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("父评论不存在"));
            comment.setParentComment(parentComment);
        }
        
        return commentRepository.save(comment);
    }
    
    @Transactional(readOnly = true)
    public List<CommentResponse> getResourceComments(Comment.ResourceType resourceType, String resourceId) {
        List<Comment> comments = commentRepository.findByResource(resourceType, resourceId);
        return comments.stream().map(this::convertToCommentResponse).collect(Collectors.toList());
    }
    
    // 转换方法
    
    private TeamResponse convertToTeamResponse(CollaborationTeam team) {
        TeamResponse response = new TeamResponse();
        response.setId(team.getId());
        response.setName(team.getName());
        response.setDescription(team.getDescription());
        response.setCreatedBy(team.getCreatedBy());
        response.setCreatedAt(team.getCreatedAt());
        response.setUpdatedAt(team.getUpdatedAt());
        
        // 转换成员列表
        if (team.getMembers() != null) {
            response.setMembers(team.getMembers().stream().map(member -> {
                TeamResponse.TeamMemberResponse memberResponse = new TeamResponse.TeamMemberResponse();
                memberResponse.setId(member.getId());
                memberResponse.setUserId(member.getUserId());
                memberResponse.setRole(member.getRole());
                memberResponse.setJoinedAt(member.getJoinedAt());
                return memberResponse;
            }).collect(Collectors.toList()));
        }
        
        // 转换共享资源列表
        if (team.getSharedResources() != null) {
            response.setSharedResources(team.getSharedResources().stream().map(resource -> {
                TeamResponse.SharedResourceResponse resourceResponse = new TeamResponse.SharedResourceResponse();
                resourceResponse.setId(resource.getId());
                resourceResponse.setResourceType(resource.getResourceType().name());
                resourceResponse.setResourceId(resource.getResourceId());
                resourceResponse.setResourceName(resource.getResourceName());
                resourceResponse.setPermissionLevel(resource.getPermissionLevel().name());
                resourceResponse.setSharedBy(resource.getSharedBy());
                resourceResponse.setSharedAt(resource.getSharedAt());
                return resourceResponse;
            }).collect(Collectors.toList()));
        }
        
        return response;
    }
    
    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setResourceType(comment.getResourceType().name());
        response.setResourceId(comment.getResourceId());
        response.setContent(comment.getContent());
        response.setCreatedBy(comment.getCreatedBy());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        
        if (comment.getParentComment() != null) {
            response.setParentCommentId(comment.getParentComment().getId());
        }
        
        // 获取回复列表
        List<Comment> replies = commentRepository.findByParentCommentId(comment.getId());
        response.setReplies(replies.stream().map(this::convertToCommentResponse).collect(Collectors.toList()));
        
        return response;
    }
}