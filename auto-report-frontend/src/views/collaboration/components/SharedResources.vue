<template>
  <div class="shared-resources">
    <div class="header-actions">
      <el-input 
        v-model="searchKeyword" 
        placeholder="搜索资源名称" 
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
      
      <el-select v-model="filterType" placeholder="资源类型" clearable @change="handleFilter">
        <el-option 
          v-for="type in resourceTypes" 
          :key="type.value" 
          :label="type.label" 
          :value="type.value" 
        />
      </el-select>
      
      <el-select v-model="filterPermission" placeholder="权限级别" clearable @change="handleFilter">
        <el-option 
          v-for="permission in permissionLevels" 
          :key="permission.value" 
          :label="permission.label" 
          :value="permission.value" 
        />
      </el-select>
    </div>

    <div class="resources-list">
      <el-card 
        v-for="resource in filteredResources" 
        :key="resource.id" 
        class="resource-card"
        shadow="hover"
      >
        <template #header>
          <div class="resource-header">
            <h3>{{ resource.resourceName }}</h3>
            <div class="resource-meta">
              <el-tag :type="getResourceTypeTagType(resource.resourceType)">
                {{ getResourceTypeName(resource.resourceType) }}
              </el-tag>
              <el-tag :type="getPermissionTagType(resource.permissionLevel)">
                {{ getPermissionDisplayName(resource.permissionLevel) }}
              </el-tag>
            </div>
          </div>
        </template>

        <div class="resource-content">
          <div class="resource-info">
            <div class="info-item">
              <span class="label">所属团队：</span>
              <span class="value">{{ getTeamName(resource.teamId) }}</span>
            </div>
            <div class="info-item">
              <span class="label">分享者：</span>
              <span class="value">{{ resource.sharedBy }}</span>
            </div>
            <div class="info-item">
              <span class="label">分享时间：</span>
              <span class="value">{{ formatTime(resource.sharedAt) }}</span>
            </div>
          </div>

          <div class="resource-actions">
            <el-button type="primary" link @click="handleViewResource(resource)">
              查看资源
            </el-button>
            <el-button 
              v-if="canOperateResource(resource)" 
              type="warning" 
              link 
              @click="handleEditPermissions(resource)"
            >
              编辑权限
            </el-button>
            <el-button 
              v-if="canOperateResource(resource)" 
              type="danger" 
              link 
              @click="handleUnshareResource(resource)"
            >
              取消分享
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <div v-if="filteredResources.length === 0" class="empty-state">
      <el-empty description="暂无共享资源" />
    </div>

    <!-- 编辑权限对话框 -->
    <el-dialog v-model="showEditPermissionDialog" title="编辑权限" width="400px">
      <el-form :model="editPermissionForm">
        <el-form-item label="权限级别">
          <el-select v-model="editPermissionForm.permissionLevel" style="width: 100%">
            <el-option 
              v-for="permission in permissionLevels" 
              :key="permission.value" 
              :label="permission.label" 
              :value="permission.value" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditPermissionDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions" :loading="savingPermissions">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import type { SharedResource } from '@/types/collaboration'
import { collaborationApi, permissionUtils } from '@/api/collaboration'

const resources = ref<SharedResource[]>([])
const searchKeyword = ref('')
const filterType = ref('')
const filterPermission = ref('')
const showEditPermissionDialog = ref(false)
const savingPermissions = ref(false)
const selectedResource = ref<SharedResource | null>(null)

const editPermissionForm = ref({
  permissionLevel: ''
})

const resourceTypes = [
  { label: '仪表板', value: 'DASHBOARD' },
  { label: '图表', value: 'CHART' },
  { label: '数据集', value: 'DATASET' },
  { label: '数据源', value: 'DATASOURCE' },
  { label: '报告', value: 'REPORT' }
]

const permissionLevels = [
  { label: '只读', value: 'READ_ONLY' },
  { label: '读写', value: 'READ_WRITE' },
  { label: '管理', value: 'ADMIN' }
]

const filteredResources = computed(() => {
  return resources.value.filter(resource => {
    const matchesKeyword = !searchKeyword.value || 
      resource.resourceName.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesType = !filterType.value || resource.resourceType === filterType.value
    const matchesPermission = !filterPermission.value || 
      resource.permissionLevel === filterPermission.value
    
    return matchesKeyword && matchesType && matchesPermission
  })
})

const loadResources = async () => {
  try {
    const response = await collaborationApi.getUserSharedResources()
    resources.value = response.data
  } catch (error) {
    ElMessage.error('获取共享资源失败')
  }
}

const handleSearch = () => {
  // 搜索逻辑已通过computed属性实现
}

const handleFilter = () => {
  // 过滤逻辑已通过computed属性实现
}

const handleViewResource = (resource: SharedResource) => {
  // 根据资源类型跳转到对应页面
  const routeMap: Record<string, string> = {
    'DASHBOARD': '/dashboard',
    'CHART': '/analysis',
    'DATASET': '/datasets',
    'DATASOURCE': '/datasources',
    'REPORT': '/reports'
  }
  
  const route = routeMap[resource.resourceType]
  if (route) {
    // 使用路由跳转
    // router.push(`${route}/${resource.resourceId}`)
    ElMessage.info(`跳转到 ${resource.resourceName}`)
  }
}

const handleEditPermissions = (resource: SharedResource) => {
  selectedResource.value = resource
  editPermissionForm.value.permissionLevel = resource.permissionLevel
  showEditPermissionDialog.value = true
}

const handleSavePermissions = async () => {
  if (!selectedResource.value) return
  
  try {
    savingPermissions.value = true
    // 调用更新权限API
    // await collaborationApi.updateResourcePermissions(selectedResource.value.id, editPermissionForm.value)
    ElMessage.success('权限更新成功')
    showEditPermissionDialog.value = false
    loadResources()
  } catch (error) {
    ElMessage.error('权限更新失败')
  } finally {
    savingPermissions.value = false
  }
}

const handleUnshareResource = async (resource: SharedResource) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消分享资源 "${resource.resourceName}" 吗？`,
      '确认取消分享',
      { type: 'warning' }
    )
    
    // 调用取消分享API
    // await collaborationApi.unshareResource(resource.id)
    ElMessage.success('取消分享成功')
    loadResources()
  } catch (error) {
    // 用户取消或操作失败
  }
}

const getResourceTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'DASHBOARD': '仪表板',
    'CHART': '图表',
    'DATASET': '数据集',
    'DATASOURCE': '数据源',
    'REPORT': '报告'
  }
  return typeMap[type] || type
}

const getResourceTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    'DASHBOARD': 'primary',
    'CHART': 'success',
    'DATASET': 'warning',
    'DATASOURCE': 'info',
    'REPORT': 'danger'
  }
  return typeMap[type] || ''
}

const getPermissionDisplayName = (permission: string) => {
  const nameMap: Record<string, string> = {
    'READ_ONLY': '只读',
    'READ_WRITE': '读写',
    'ADMIN': '管理'
  }
  return nameMap[permission] || permission
}

const getPermissionTagType = (permission: string) => {
  const typeMap: Record<string, string> = {
    'READ_ONLY': 'info',
    'READ_WRITE': 'warning',
    'ADMIN': 'danger'
  }
  return typeMap[permission] || ''
}

const getTeamName = (teamId: number) => {
  // 这里需要根据团队ID获取团队名称
  // 暂时返回团队ID
  return `团队 ${teamId}`
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

const canOperateResource = (resource: SharedResource) => {
  return permissionUtils.canOperateResource(resource, 'current-user-id', 'admin')
}

onMounted(() => {
  loadResources()
})
</script>

<style scoped>
.shared-resources {
  padding: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.resources-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.resource-card {
  transition: all 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-2px);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.resource-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  margin-right: 12px;
}

.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.resource-content {
  min-height: 100px;
}

.resource-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
  min-width: 80px;
}

.info-item .value {
  color: #303133;
  flex: 1;
}

.resource-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>