package com.stardustbi.dto.request;

import com.stardustbi.entity.SharedResource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShareResourceRequest {
    @NotNull(message = "资源类型不能为空")
    private SharedResource.ResourceType resourceType;
    
    @NotBlank(message = "资源ID不能为空")
    private String resourceId;
    
    @NotBlank(message = "资源名称不能为空")
    private String resourceName;
    
    private SharedResource.PermissionLevel permissionLevel;
}