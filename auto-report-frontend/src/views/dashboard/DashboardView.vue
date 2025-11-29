<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <h1>数据驾驶舱</h1>
      <p>欢迎使用Stardust BI数据驾驶舱</p>
    </div>
    
    <div class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>数据源数量</h3>
          <div class="stat-value">0</div>
          <div class="stat-desc">已连接的数据源</div>
        </div>
        
        <div class="stat-card">
          <h3>数据集数量</h3>
          <div class="stat-value">0</div>
          <div class="stat-desc">已创建的数据集</div>
        </div>
        
        <div class="stat-card">
          <h3>报表数量</h3>
          <div class="stat-value">0</div>
          <div class="stat-desc">已生成的报表</div>
        </div>
        
        <div class="stat-card">
          <h3>活跃用户</h3>
          <div class="stat-value">1</div>
          <div class="stat-desc">当前在线用户</div>
        </div>
      </div>
      
      <div class="dashboard-widgets">
        <div class="widget">
          <h3>最近活动</h3>
          <div class="empty-state">暂无活动记录</div>
        </div>
        
        <div class="widget">
          <h3>系统状态</h3>
          <div class="status-item">
            <span class="status-indicator active"></span>
            <span>前端服务：运行正常</span>
          </div>
          <div class="status-item">
            <span class="status-indicator inactive"></span>
            <span>后端服务：未连接</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 基础仪表板逻辑
</script>

<style scoped>
.dashboard-view {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: var(--space-8);
  text-align: center;
}

.dashboard-header h1 {
  font-size: var(--font-size-3xl);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.dashboard-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  border: 1px solid var(--color-border-primary);
}

.stat-card h3 {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-3);
}

.stat-value {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.stat-desc {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
}

.widget {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--color-border-primary);
}

.widget h3 {
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
  font-size: var(--font-size-lg);
}

.empty-state {
  color: var(--color-text-tertiary);
  text-align: center;
  padding: var(--space-8);
}

.status-item {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-3);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: var(--space-3);
}

.status-indicator.active {
  background-color: var(--color-success);
}

.status-indicator.inactive {
  background-color: var(--color-error);
}
</style>