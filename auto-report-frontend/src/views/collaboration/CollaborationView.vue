<template>
  <div class="collaboration-view">
    <div class="page-header">
      <h1>协作与共享</h1>
      <p>管理团队协作和资源共享</p>
    </div>
    
    <el-tabs v-model="activeTab" class="collaboration-tabs">
      <el-tab-pane label="我的团队" name="teams">
        <TeamManagement />
      </el-tab-pane>
      <el-tab-pane label="共享资源" name="resources">
        <SharedResources />
      </el-tab-pane>
      <el-tab-pane label="协作评论" name="comments">
        <CommentManagement />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TeamManagement from './components/TeamManagement.vue'
import SharedResources from './components/SharedResources.vue'
import CommentManagement from './components/CommentManagement.vue'

const activeTab = ref('teams')
</script>

<style scoped>
.collaboration-view {
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #909399;
  margin: 0;
}

.collaboration-tabs {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>