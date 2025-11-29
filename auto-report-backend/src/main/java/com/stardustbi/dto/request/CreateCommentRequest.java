package com.stardustbi.dto.request;

import com.stardustbi.entity.Comment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotNull(message = "资源类型不能为空")
    private Comment.ResourceType resourceType;
    
    @NotBlank(message = "资源ID不能为空")
    private String resourceId;
    
    @NotBlank(message = "评论内容不能为空")
    @Size(max = 2000, message = "评论内容长度不能超过2000个字符")
    private String content;
    
    private Long parentCommentId;
}