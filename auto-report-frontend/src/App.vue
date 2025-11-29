<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="logo">
        <h1>Auto Report</h1>
        <span class="subtitle">智能报表系统</span>
      </div>
      <nav class="main-nav">
        <router-link to="/datasources" class="nav-link">数据源管理</router-link>
        <router-link to="/datasets" class="nav-link">数据集</router-link>
        <router-link to="/analysis" class="nav-link">分析</router-link>
        <router-link to="/reports" class="nav-link">报表</router-link>
      </nav>
    </header>
    
    <!-- 主内容区 -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// 基础应用逻辑
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #1890ff;
}

.subtitle {
  color: #666;
  margin-left: 10px;
}

.main-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: #f0f0f0;
  color: #1890ff;
}

.app-main {
  flex: 1;
  padding: 20px;
  background: #f5f5f5;
}

.app-header {
  padding: 1rem 2rem;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border-primary);
  backdrop-filter: blur(10px);
  z-index: 1000;
  
  .logo-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .logo-hologram {
      .hologram-effect {
        font-family: var(--font-family-accent);
        font-size: 1.8rem;
        font-weight: 700;
        color: var(--color-primary);
        text-shadow: 0 0 20px var(--color-primary);
        
        .logo-accent {
          color: var(--color-accent);
          text-shadow: 0 0 20px var(--color-accent);
        }
      }
    }
    
    .subheading {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
  
  .search-container {
    flex: 1;
    max-width: 500px;
    margin: 0 2rem;
  }
  
  .actions-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  
  .sidebar {
    width: 280px;
    background: var(--color-bg-secondary);
    border-right: 1px solid var(--color-border-primary);
    padding: 1rem;
    overflow-y: auto;
    
    .favorites-section,
    .space-indicator {
      margin-top: 2rem;
      
      .section-title {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
    }
  }
  
  .content-area {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  
  .context-panel {
    width: 320px;
    background: var(--color-bg-secondary);
    border-left: 1px solid var(--color-border-primary);
    overflow-y: auto;
  }
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2rem;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-primary);
  font-size: 0.8rem;
  
  .system-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-error);
      
      &.healthy {
        background: var(--color-success);
      }
    }
  }
  
  .query-status {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .query-count {
      color: var(--color-text-secondary);
    }
    
    .progress-container {
      display: flex;
      gap: 0.5rem;
      
      .query-progress {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        .query-name {
          font-size: 0.7rem;
          color: var(--color-text-secondary);
        }
        
        .progress-bar {
          width: 60px;
          height: 4px;
          background: var(--color-border-primary);
          border-radius: 2px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            background: var(--color-primary);
            transition: width 0.3s ease;
            
            &.success {
              background: var(--color-success);
            }
            
            &.error {
              background: var(--color-error);
            }
          }
        }
      }
    }
  }
  
  .timestamp {
    text-align: right;
    
    .time-zone {
      font-size: 0.7rem;
      color: var(--color-text-secondary);
    }
  }
}
</style>