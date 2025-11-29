package com.stardustbi.dto.response;

import com.stardustbi.entity.TeamMember;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TeamResponse {
    private Long id;
    private String name;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TeamMemberResponse> members;
    private List<SharedResourceResponse> sharedResources;
    
    @Data
    public static class TeamMemberResponse {
        private Long id;
        private String userId;
        private TeamMember.TeamRole role;
        private LocalDateTime joinedAt;
    }
    
    @Data
    public static class SharedResourceResponse {
        private Long id;
        private String resourceType;
        private String resourceId;
        private String resourceName;
        private String permissionLevel;
        private String sharedBy;
        private LocalDateTime sharedAt;
    }
}