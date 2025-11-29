<template>
  <div class="team-management">
    <div class="header-actions">
      <el-button type="primary" @click="showCreateTeamDialog = true">
        <el-icon><Plus /></el-icon>
        创建团队
      </el-button>
    </div>

    <div class="teams-grid">
      <el-card 
        v-for="team in teams" 
        :key="team.id" 
        class="team-card"
        shadow="hover"
      >
        <template #header>
          <div class="team-header">
            <h3>{{ team.name }}</h3>
            <el-tag v-if="isTeamOwner(team)" type="success">创建者</el-tag>
            <el-tag v-else-if="isTeamAdmin(team)" type="warning">管理员</el-tag>
            <el-tag v-else type="info">成员</el-tag>
          </div>
        </template>

        <div class="team-content">
          <p class="team-description">{{ team.description || '暂无描述' }}</p>
          
          <div class="team-stats">
            <div class="stat">
              <span class="stat-label">成员</span>
              <span class="stat-value">{{ team.members?.length || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">资源</span>
              <span class="stat-value">{{ team.sharedResources?.length || 0 }}</span>
            </div>
          </div>

          <div class="team-actions">
            <el-button type="primary" link @click="viewTeamDetail(team)">
              查看详情
            </el-button>
            <el-button 
              v-if="isTeamOwner(team) || isTeamAdmin(team)" 
              type="warning" 
              link 
              @click="manageTeamMembers(team)"
            >
              管理成员
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建团队对话框 -->
    <el-dialog v-model="showCreateTeamDialog" title="创建团队" width="500px">
      <el-form :model="createTeamForm" :rules="createTeamRules" ref="createTeamFormRef">
        <el-form-item label="团队名称" prop="name">
          <el-input v-model="createTeamForm.name" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="团队描述" prop="description">
          <el-input 
            v-model="createTeamForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入团队描述（可选）" 
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateTeamDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTeam" :loading="creatingTeam">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- 团队详情对话框 -->
    <TeamDetailDialog 
      v-model="showTeamDetailDialog" 
      :team="selectedTeam" 
      @refresh="loadTeams" 
    />

    <!-- 成员管理对话框 -->
    <MemberManagementDialog 
      v-model="showMemberManagementDialog" 
      :team="selectedTeam" 
      @refresh="loadTeams" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { TeamResponse } from '@/types/collaboration'
import { collaborationApi } from '@/api/collaboration'
import TeamDetailDialog from './TeamDetailDialog.vue'
import MemberManagementDialog from './MemberManagementDialog.vue'

const teams = ref<TeamResponse[]>([])
const showCreateTeamDialog = ref(false)
const showTeamDetailDialog = ref(false)
const showMemberManagementDialog = ref(false)
const selectedTeam = ref<TeamResponse | null>(null)
const creatingTeam = ref(false)

const createTeamForm = ref({
  name: '',
  description: ''
})

const createTeamRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 100, message: '团队名称长度在2-100个字符', trigger: 'blur' }
  ]
}

const loadTeams = async () => {
  try {
    const response = await collaborationApi.getUserTeams()
    teams.value = response.data
  } catch (error) {
    ElMessage.error('获取团队列表失败')
  }
}

const handleCreateTeam = async () => {
  try {
    creatingTeam.value = true
    await collaborationApi.createTeam(createTeamForm.value)
    ElMessage.success('团队创建成功')
    showCreateTeamDialog.value = false
    createTeamForm.value = { name: '', description: '' }
    loadTeams()
  } catch (error) {
    ElMessage.error('创建团队失败')
  } finally {
    creatingTeam.value = false
  }
}

const viewTeamDetail = (team: TeamResponse) => {
  selectedTeam.value = team
  showTeamDetailDialog.value = true
}

const manageTeamMembers = (team: TeamResponse) => {
  selectedTeam.value = team
  showMemberManagementDialog.value = true
}

const isTeamOwner = (team: TeamResponse) => {
  return team.members?.some(member => 
    member.userId === 'current-user-id' && member.role === 'OWNER'
  )
}

const isTeamAdmin = (team: TeamResponse) => {
  return team.members?.some(member => 
    member.userId === 'current-user-id' && 
    (member.role === 'OWNER' || member.role === 'ADMIN')
  )
}

onMounted(() => {
  loadTeams()
})
</script>

<style scoped>
.team-management {
  padding: 20px;
}

.header-actions {
  margin-bottom: 24px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.team-card {
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-2px);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.team-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.team-content {
  min-height: 120px;
}

.team-description {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.team-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.team-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>