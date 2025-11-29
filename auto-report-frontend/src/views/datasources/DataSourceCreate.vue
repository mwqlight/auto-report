<template>
  <div class="data-source-create">
    <div class="page-header">
      <h1>创建数据源</h1>
      <p class="subtitle">配置新的数据连接</p>
    </div>
    
    <div class="create-container">
      <div class="form-section">
        <h2>数据源信息</h2>
        <div class="form-grid">
          <div class="form-item">
            <label>数据源名称</label>
            <input type="text" placeholder="请输入数据源名称" />
          </div>
          <div class="form-item">
            <label>数据源类型</label>
            <select>
              <option value="">请选择数据源类型</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="oracle">Oracle</option>
              <option value="sqlserver">SQL Server</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h2>连接配置</h2>
        <div class="form-grid">
          <div class="form-item">
            <label>主机地址</label>
            <input type="text" placeholder="localhost" />
          </div>
          <div class="form-item">
            <label>端口</label>
            <input type="number" placeholder="3306" />
          </div>
          <div class="form-item">
            <label>数据库名</label>
            <input type="text" placeholder="请输入数据库名" />
          </div>
          <div class="form-item">
            <label>用户名</label>
            <input type="text" placeholder="请输入用户名" />
          </div>
          <div class="form-item">
            <label>密码</label>
            <input type="password" placeholder="请输入密码" />
          </div>
        </div>
      </div>
      
      <div class="form-actions">
        <button class="btn-primary">测试连接</button>
        <button class="btn-secondary">取消</button>
        <button class="btn-primary">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 创建数据源页面逻辑
</script>

<style scoped>
.data-source-create {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: var(--color-text-primary);
  margin: 0;
}

.subtitle {
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}

.create-container {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h2 {
  font-size: 1.2rem;
  color: var(--color-text-primary);
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-primary);
  padding-bottom: 0.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item label {
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.form-item input,
.form-item select {
  padding: 0.75rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-secondary {
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
</style>