<template>
  <el-dialog 
    v-model="visible" 
    title="添加团队成员" 
    width="500px"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="用户" prop="userId">
        <el-select 
          v-model="form.userId" 
          placeholder="请选择用户"
          style="width: 100%"
          filterable
          remote
          :remote-method="searchUsers"
          :loading="searchingUsers"
        >
          <el-option 
            v-for="user in userOptions" 
            :key="user.id" 
            :label="user.name" 
            :value="user.id" 
          />
        </el-select>
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select 
          v-model="form.role" 
          placeholder="请选择角色"
          style="width: 100%"
        >
          <el-option 
            v-for="role in availableRoles" 
            :key="role.value" 
            :label="role.label" 
            :value="role.value" 
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        添加
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { AddMemberRequest, TeamRole } from '@/types/collaboration'
import { collaborationApi } from '@/api/collaboration'

interface Props {
  modelValue: boolean
  teamId: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

interface UserOption {
  id: string
  name: string
  email?: string
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const visible = ref(false)
const submitting = ref(false)
const searchingUsers = ref(false)

const form = ref<AddMemberRequest>({
  userId: '',
  role: 'MEMBER' as TeamRole
})

const userOptions = ref<UserOption[]>([])

const availableRoles = [
  { label: '成员', value: 'MEMBER' },
  { label: '管理员', value: 'ADMIN' }
]

const rules: FormRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const searchUsers = async (query: string) => {
  if (!query.trim()) {
    userOptions.value = []
    return
  }

  try {
    searchingUsers.value = true
    
    // 模拟搜索用户API调用
    // 实际项目中应该调用用户搜索接口
    const mockUsers: UserOption[] = [
      { id: 'user1', name: '张三', email: 'zhangsan@example.com' },
      { id: 'user2', name: '李四', email: 'lisi@example.com' },
      { id: 'user3', name: '王五', email: 'wangwu@example.com' },
      { id: 'user4', name: '赵六', email: 'zhaoliu@example.com' },
      { id: 'user5', name: '钱七', email: 'qianqi@example.com' }
    ].filter(user => 
      user.name.includes(query) || 
      (user.email && user.email.includes(query))
    )
    
    userOptions.value = mockUsers
  } catch (error) {
    ElMessage.error('搜索用户失败')
  } finally {
    searchingUsers.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitting.value = true
    
    await collaborationApi.addTeamMember(props.teamId, form.value)
    ElMessage.success('添加成员成功')
    
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error('添加成员失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  form.value = {
    userId: '',
    role: 'MEMBER' as TeamRole
  }
  userOptions.value = []
  
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

watch(() => props.modelValue, (newVal) => {
  visible.value = newVal
  if (newVal) {
    nextTick(() => {
      resetForm()
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