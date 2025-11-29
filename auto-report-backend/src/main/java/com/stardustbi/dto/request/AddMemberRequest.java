package com.stardustbi.dto.request;

import com.stardustbi.entity.TeamMember;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotBlank(message = "用户ID不能为空")
    private String userId;
    
    @NotNull(message = "角色不能为空")
    private TeamMember.TeamRole role;
}