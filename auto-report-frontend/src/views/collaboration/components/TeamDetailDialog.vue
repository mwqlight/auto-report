<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="team ? team.name : '团队详情'" 
    width="800px"
    @close="handleClose"
  >
    <div v-if="team" class="team-detail">
      <!-- 基本信息 -->
      <el-card class="info-section" shadow="never">
        <template #header>
          <h3>基本信息</h3>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="团队名称">{{ team.name }}</el-descriptions-item>
          <el-descriptions-item label="创建者">{{ team.createdBy }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(team.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(team.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item label="团队描述" :span="2">
            {{ team.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 成员列表 -->
      <el-card class="members-section" shadow="never">
        <template #header>
          <div class="section-header">
            <h3>团队成员</h3>
            <span class="member-count">共 {{ team.members?.length || 0 }} 人</span>
          </div>
        </template>
        
        <el-table :data="team.members" v-loading="loadingMembers">
          <el-table-column label="用户ID" prop="userId" />
          <el-table-column label="角色">
            <template #default="{ row }">
              <el-tag :type="getRoleTagType(row.role)">
                {{ getRoleDisplayName(row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="加入时间">
            <template #default="{ row }">
              {{ formatTime(row.joinedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" v-if="canManageTeam">
            <template #default="{ row }">
              <el-button 
                v-if="!isCurrentUser(row.userId)" 
                type="danger" 
                link 
                @click="handleRemoveMember(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 共享资源 -->
      <el-card class="resources-section" shadow="never">
        <template #header>
          <div class="section-header">
            <h3>共享资源</h3>
            <el-button 
              v-if="canManageTeam" 
              type="primary" 
              size="small"
              @click="showShareResourceDialog = true"
            >
              分享资源
            </el-button>
          </div>
        </template>
        
        <el-table :data="team.sharedResources" v-loading="loadingResources">
          <el-table-column label="资源名称" prop="resourceName" />
          <el-table-column label="资源类型">
            <template #default="{ row }">
              <el-tag>{{ getResourceTypeName(row.resourceType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="权限级别">
            <template #default="{ row }">
              <el-tag :type="getPermissionTagType(row.permissionLevel)">
                {{ getPermissionDisplayName(row.permissionLevel) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="分享者" prop="sharedBy" />
          <el-table-column label="分享时间">
            <template #default="{ row }">
              {{ formatTime(row.sharedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" v-if="canManageTeam">
            <template #default="{ row }">
              <el-button type="danger" link @click="handleUnshareResource(row)">
                取消分享
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 分享资源对话框 -->
    <ShareResourceDialog 
      v-model="showShareResourceDialog" 
      :team-id="team?.id" 
      @success="handleShareSuccess" 
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TeamResponse } from '@/types/collaboration'
import { collaborationApi, permissionUtils } from '@/api/collaboration'
import ShareResourceDialog from './ShareResourceDialog.vue'

interface Props {
  modelValue: boolean
  team: TeamResponse | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const showShareResourceDialog = ref(false)
const loadingMembers = ref(false)
const loadingResources = ref(false)

const canManageTeam = computed(() => {
  if (!props.team) return false
  return permissionUtils.canManageTeam(props.team, 'current-user-id')
})

const isCurrentUser = (userId: string) => {
  return userId === 'current-user-id'
}

const getRoleTagType = (role: string) => {
  const typeMap: Record<string, string> = {
    'OWNER': 'success',
    'ADMIN': 'warning',
    'MEMBER': '',
    'VIEWER': 'info'
  }
  return typeMap[role] || ''
}

const getRoleDisplayName = (role: string) => {
  return permissionUtils.getRoleDisplayName(role)
}

const getResourceTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    'DASHBOARD': '仪表板',
    'CHART': '图表',
    'DATASET': '数据集',
    'DATASOURCE': '数据源',
    'REPORT': '报告'
  }
  return nameMap[type] || type
}

const getPermissionTagType = (permission: string) => {
  const typeMap: Record<string, string> = {
    'READ_ONLY': 'info',
    'READ_WRITE': 'warning',
    'ADMIN': 'danger'
  }
  return typeMap[permission] || ''
}

const getPermissionDisplayName = (permission: string) => {
  const nameMap: Record<string, string> = {
    'READ_ONLY': '只读',
    'READ_WRITE': '读写',
    'ADMIN': '管理'
  }
  return nameMap[permission] || permission
}

const formatTime = (time: string) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const handleRemoveMember = async (member: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 ${member.userId} 吗？`,
      '确认移除',
      { type: 'warning' }
    )
    
    // 调用移除成员API
    // await collaborationApi.removeMember(props.team!.id, member.id)
    ElMessage.success('成员移除成功')
    emit('refresh')
  } catch (error) {
    // 用户取消或操作失败
  }
}

const handleUnshareResource = async (resource: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消分享资源 ${resource.resourceName} 吗？`,
      '确认取消分享',
      { type: 'warning' }
    )
    
    // 调用取消分享API
    // await collaborationApi.unshareResource(resource.id)
    ElMessage.success('取消分享成功')
    emit('refresh')
  } catch (error) {
    // 用户取消或操作失败
  }
}

const handleShareSuccess = () => {
  showShareResourceDialog.value = false
  emit('refresh')
}

const handleClose = () => {
  showShareResourceDialog.value = false
}

watch(dialogVisible, (visible) => {
  if (visible && props.team) {
    // 可以在这里加载更多详情数据
  }
})
</script>

<style scoped>
.team-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.info-section,
.members-section,
.resources-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.member-count {
  color: #909399;
  font-size: 14px;
}
</style>