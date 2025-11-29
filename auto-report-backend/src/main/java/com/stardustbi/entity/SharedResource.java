package com.stardustbi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "shared_resources")
@Data
public class SharedResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private CollaborationTeam team;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;
    
    @Column(nullable = false)
    private String resourceId;
    
    @Column(nullable = false)
    private String resourceName;
    
    @Enumerated(EnumType.STRING)
    private PermissionLevel permissionLevel;
    
    @Column(nullable = false)
    private String sharedBy;
    
    @Column(nullable = false)
    private LocalDateTime sharedAt;
    
    @PrePersist
    protected void onCreate() {
        sharedAt = LocalDateTime.now();
    }
    
    public enum ResourceType {
        DASHBOARD, CHART, DATASET, DATASOURCE, REPORT
    }
    
    public enum PermissionLevel {
        READ_ONLY, READ_WRITE, ADMIN
    }
}