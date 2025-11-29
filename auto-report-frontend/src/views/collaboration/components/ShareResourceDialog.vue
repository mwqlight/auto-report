<template>
  <el-dialog 
    v-model="visible" 
    :title="dialogTitle" 
    width="600px"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="资源类型" prop="resourceType">
        <el-select 
          v-model="form.resourceType" 
          placeholder="请选择资源类型"
          style="width: 100%"
          @change="handleResourceTypeChange"
        >
          <el-option 
            v-for="type in resourceTypes" 
            :key="type.value" 
            :label="type.label" 
            :value="type.value" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="资源" prop="resourceId">
        <el-select 
          v-model="form.resourceId" 
          placeholder="请选择资源"
          style="width: 100%"
          filterable
          :loading="loadingResources"
        >
          <el-option 
            v-for="resource in availableResources" 
            :key="resource.id" 
            :label="resource.name" 
            :value="resource.id" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="权限级别" prop="permissionLevel">
        <el-select 
          v-model="form.permissionLevel" 
          placeholder="请选择权限级别"
          style="width: 100%"
        >
          <el-option 
            v-for="permission in permissionLevels" 
            :key="permission.value" 
            :label="permission.label" 
            :value="permission.value" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="共享团队" prop="teamId">
        <el-select 
          v-model="form.teamId" 
          placeholder="请选择共享团队"
          style="width: 100%"
          filterable
          :loading="loadingTeams"
        >
          <el-option 
            v-for="team in availableTeams" 
            :key="team.id" 
            :label="team.name" 
            :value="team.id" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="资源名称" prop="resourceName">
        <el-input 
          v-model="form.resourceName" 
          placeholder="请输入资源名称"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ submitButtonText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { 
  ShareResourceRequest, 
  TeamResponse,
  ResourceType,
  PermissionLevel 
} from '@/types/collaboration'
import { collaborationApi } from '@/api/collaboration'

interface Props {
  modelValue: boolean
  teamId?: number
  resource?: {
    id: string
    name: string
    type: ResourceType
    permissionLevel?: PermissionLevel
  }
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const submitting = ref(false)
const loadingResources = ref(false)
const loadingTeams = ref(false)

const form = ref<ShareResourceRequest & { resourceName: string; teamId?: number }>({
  resourceType: '' as ResourceType,
  resourceId: '',
  resourceName: '',
  permissionLevel: 'READ' as PermissionLevel,
  teamId: undefined
})

const availableResources = ref<Array<{id: string; name: string}>>([])
const availableTeams = ref<TeamResponse[]>([])

const resourceTypes = [
  { label: '仪表板', value: 'DASHBOARD' },
  { label: '图表', value: 'CHART' },
  { label: '数据集', value: 'DATASET' },
  { label: '数据源', value: 'DATASOURCE' },
  { label: '报告', value: 'REPORT' }
]

const permissionLevels = [
  { label: '只读', value: 'READ' },
  { label: '读写', value: 'WRITE' },
  { label: '管理', value: 'MANAGE' }
]

const rules: FormRules = {
  resourceType: [
    { required: true, message: '请选择资源类型', trigger: 'change' }
  ],
  resourceId: [
    { required: true, message: '请选择资源', trigger: 'change' }
  ],
  permissionLevel: [
    { required: true, message: '请选择权限级别', trigger: 'change' }
  ],
  teamId: [
    { required: true, message: '请选择共享团队', trigger: 'change' }
  ],
  resourceName: [
    { required: true, message: '请输入资源名称', trigger: 'blur' },
    { min: 1, max: 200, message: '资源名称长度在1-200个字符', trigger: 'blur' }
  ]
}

const dialogTitle = computed(() => {
  return props.resource ? '编辑共享资源' : '分享资源'
})

const submitButtonText = computed(() => {
  return props.resource ? '保存' : '分享'
})

const loadAvailableResources = async (resourceType: ResourceType) => {
  try {
    loadingResources.value = true
    
    // 模拟获取用户拥有的资源
    // 实际项目中应该调用API获取用户拥有的指定类型的资源
    const mockResources: Array<{id: string; name: string}> = [
      { id: 'dashboard-1', name: '销售数据仪表板' },
      { id: 'dashboard-2', name: '用户行为分析' },
      { id: 'chart-1', name: '月度销售趋势图' },
      { id: 'dataset-1', name: '用户数据集合' },
      { id: 'datasource-1', name: 'MySQL生产数据库' }
    ].filter(resource => {
      // 根据资源类型过滤
      const typeMap: Record<string, string> = {
        'DASHBOARD': 'dashboard',
        'CHART': 'chart',
        'DATASET': 'dataset',
        'DATASOURCE': 'datasource',
        'REPORT': 'report'
      }
      return resource.id.startsWith(typeMap[resourceType])
    })
    
    availableResources.value = mockResources
  } catch (error) {
    ElMessage.error('获取资源列表失败')
  } finally {
    loadingResources.value = false
  }
}

const loadAvailableTeams = async () => {
  try {
    loadingTeams.value = true
    
    // 获取用户拥有或管理的团队
    const response = await collaborationApi.getUserTeams()
    availableTeams.value = response.data || []
  } catch (error) {
    ElMessage.error('获取团队列表失败')
  } finally {
    loadingTeams.value = false
  }
}

const handleResourceTypeChange = (value: ResourceType) => {
  form.value.resourceId = ''
  form.value.resourceName = ''
  if (value) {
    loadAvailableResources(value)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    const shareData: ShareResourceRequest = {
      resourceType: form.value.resourceType,
      resourceId: form.value.resourceId,
      resourceName: form.value.resourceName,
      permissionLevel: form.value.permissionLevel
    }
    
    if (props.resource) {
      // 编辑共享资源
      // await collaborationApi.updateSharedResource(form.value.teamId!, shareData)
      ElMessage.success('共享资源更新成功')
    } else {
      // 分享新资源
      await collaborationApi.shareResource(form.value.teamId!, shareData)
      ElMessage.success('资源分享成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(props.resource ? '更新失败' : '分享失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  form.value = {
    resourceType: '' as ResourceType,
    resourceId: '',
    resourceName: '',
    permissionLevel: 'READ' as PermissionLevel,
    teamId: props.teamId
  }
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const initForm = () => {
  if (props.resource) {
    // 编辑模式
    form.value = {
      resourceType: props.resource.type,
      resourceId: props.resource.id,
      resourceName: props.resource.name,
      permissionLevel: props.resource.permissionLevel || 'READ',
      teamId: props.teamId
    }
    
    // 加载对应类型的资源列表
    loadAvailableResources(props.resource.type)
  } else {
    // 新建模式
    resetForm()
  }
}

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    nextTick(() => {
      initForm()
      loadAvailableTeams()
    })
  }
})

watch(visible, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-select) {
  width: 100%;
}
</style>