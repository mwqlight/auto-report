<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    :width="dialogWidth"
    :before-close="handleBeforeClose"
    destroy-on-close
  >
    <!-- 表单内容 -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="left"
      :disabled="loading"
    >
      <!-- 基本信息 -->
      <el-form-item label="数据源名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入数据源名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="数据源描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入数据源描述（可选）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="数据源类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择数据源类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="type in dataSourceTypes"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <i :class="getTypeIcon(type.value)" style="font-size: 16px"></i>
              <span>{{ type.label }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- 连接参数 -->
      <div v-if="formData.type" class="connection-section">
        <h4 class="section-title">连接参数</h4>
        
        <el-form-item label="主机地址" prop="connection.host">
          <el-input
            v-model="formData.connection.host"
            placeholder="请输入主机地址"
          />
        </el-form-item>
        
        <el-form-item label="端口号" prop="connection.port">
          <el-input-number
            v-model="formData.connection.port"
            :min="1"
            :max="65535"
            placeholder="请输入端口号"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="数据库名" prop="connection.database">
          <el-input
            v-model="formData.connection.database"
            placeholder="请输入数据库名称"
          />
        </el-form-item>
        
        <el-form-item label="用户名" prop="connection.username">
          <el-input
            v-model="formData.connection.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="connection.password">
          <el-input
            v-model="formData.connection.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <!-- 高级选项 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="高级选项" name="advanced">
            <el-form-item label="Schema">
              <el-input
                v-model="formData.connection.schema"
                placeholder="请输入Schema（可选）"
              />
            </el-form-item>
            
            <el-form-item label="SSL连接">
              <el-switch
                v-model="formData.connection.ssl"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
            
            <el-form-item label="连接超时">
              <el-input-number
                v-model="formData.connection.timeout"
                :min="1"
                :max="300"
                placeholder="秒"
                style="width: 100%"
              >
                <template #append>秒</template>
              </el-input-number>
            </el-form-item>
            
            <el-form-item label="最大连接数">
              <el-input-number
                v-model="formData.connection.maxConnections"
                :min="1"
                :max="100"
                placeholder="最大连接数"
                style="width: 100%"
              />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </div>
      
      <!-- 标签 -->
      <el-form-item label="标签">
        <el-tag
          v-for="tag in formData.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
          style="margin-right: 8px; margin-bottom: 4px"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="tagInputVisible"
          ref="tagInputRef"
          v-model="tagInputValue"
          size="small"
          style="width: 100px"
          @keyup.enter="addTag"
          @blur="addTag"
        />
        <el-button v-else size="small" @click="showTagInput">
          + 添加标签
        </el-button>
      </el-form-item>
    </el-form>
    
    <!-- 对话框底部 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          :icon="Connection"
          @click="handleTestConnection"
          :loading="testing"
          :disabled="!formData.type"
        >
          测试连接
        </el-button>
        
        <div style="flex: 1"></div>
        
        <el-button @click="handleCancel">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="loading"
        >
          {{ mode === 'create' ? '创建' : '更新' }}
        </el-button>
      </div>
    </template>
    
    <!-- 测试结果提示 -->
    <el-dialog
      v-model="testResultVisible"
      title="连接测试结果"
      width="400px"
      append-to-body
    >
      <div class="test-result">
        <div class="result-status" :class="testResult.success ? 'success' : 'error'">
          <i :class="testResult.success ? 'el-icon-success' : 'el-icon-error'"></i>
          <span>{{ testResult.success ? '连接成功' : '连接失败' }}</span>
        </div>
        
        <div v-if="testResult.message" class="result-message">
          {{ testResult.message }}
        </div>
        
        <div v-if="testResult.connectionTime" class="result-detail">
          <span>连接耗时: {{ testResult.connectionTime }}ms</span>
        </div>
        
        <div v-if="testResult.databaseVersion" class="result-detail">
          <span>数据库版本: {{ testResult.databaseVersion }}</span>
        </div>
        
        <div v-if="testResult.error" class="result-error">
          <el-alert
            :title="testResult.error"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="testResultVisible = false">关闭</el-button>
        <el-button 
          v-if="!testResult.success" 
          type="primary" 
          @click="testResultVisible = false"
        >
          重新测试
        </el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Connection } from '@element-plus/icons-vue'
import { useDataSourceStore } from '@/store/datasource'
import type { DataSource, CreateDataSourceRequest, ConnectionTestResult } from '@/types/datasource'

interface Props {
  visible: boolean
  dataSource?: DataSource | null
  mode: 'create' | 'edit'
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const dataSourceStore = useDataSourceStore()
const formRef = ref<FormInstance>()
const tagInputRef = ref()

// 响应式数据
const loading = ref(false)
const testing = ref(false)
const testResultVisible = ref(false)
const activeCollapse = ref<string[]>([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')

const testResult = ref<ConnectionTestResult>({
  success: false,
  message: '',
  timestamp: new Date().toISOString()
})

const formData = reactive<CreateDataSourceRequest>({
  name: '',
  description: '',
  type: 'MYSQL',
  connection: {
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
    ssl: false,
    timeout: 30,
    maxConnections: 10
  },
  workspaceId: 'default', // TODO: 从store获取当前工作空间
  tags: []
})

// 计算属性
const dialogTitle = computed(() => 
  props.mode === 'create' ? '创建数据源' : '编辑数据源'
)

const dialogWidth = computed(() => {
  return window.innerWidth < 768 ? '90%' : '600px'
})

const dataSourceTypes = computed(() => dataSourceStore.dataSourceTypes)

const defaultPorts: Record<string, number> = {
  'MYSQL': 3306,
  'POSTGRESQL': 5432,
  'CLICKHOUSE': 8123,
  'ORACLE': 1521,
  'SQLSERVER': 1433,
  'REDIS': 6379,
  'MONGODB': 27017,
  'ELASTICSEARCH': 9200
}

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入数据源名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择数据源类型', trigger: 'change' }
  ],
  'connection.host': [
    { required: true, message: '请输入主机地址', trigger: 'blur' }
  ],
  'connection.port': [
    { required: true, message: '请输入端口号', trigger: 'blur' },
    { type: 'number', min: 1, max: 65535, message: '端口号必须在 1-65535 之间', trigger: 'blur' }
  ],
  'connection.database': [
    { required: true, message: '请输入数据库名称', trigger: 'blur' }
  ],
  'connection.username': [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  'connection.password': [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 监听器
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
    if (props.dataSource && props.mode === 'edit') {
      loadDataSourceData()
    }
  }
})

watch(() => props.dataSource, (newVal) => {
  if (newVal && props.mode === 'edit') {
    loadDataSourceData()
  }
})

// 方法
const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'MYSQL': 'el-icon-mysql',
    'POSTGRESQL': 'el-icon-postgresql',
    'CLICKHOUSE': 'el-icon-clickhouse',
    'ORACLE': 'el-icon-oracle',
    'SQLSERVER': 'el-icon-sqlserver',
    'REDIS': 'el-icon-redis',
    'MONGODB': 'el-icon-mongodb',
    'ELASTICSEARCH': 'el-icon-elasticsearch',
    'API': 'el-icon-link',
    'FILE': 'el-icon-document'
  }
  return iconMap[type] || 'el-icon-question'
}

const handleTypeChange = (type: string) => {
  if (defaultPorts[type]) {
    formData.connection.port = defaultPorts[type]
  }
}

const resetForm = () => {
  formRef.value?.clearValidate()
  Object.assign(formData, {
    name: '',
    description: '',
    type: 'MYSQL',
    connection: {
      host: 'localhost',
      port: 3306,
      database: '',
      username: '',
      password: '',
      ssl: false,
      timeout: 30,
      maxConnections: 10
    },
    tags: []
  })
  activeCollapse.value = []
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const loadDataSourceData = () => {
  if (!props.dataSource) return
  
  Object.assign(formData, {
    name: props.dataSource.name,
    description: props.dataSource.description || '',
    type: props.dataSource.type,
    connection: { ...props.dataSource.connection },
    tags: props.dataSource.tags || []
  })
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const addTag = () => {
  if (tagInputValue.value && !formData.tags.includes(tagInputValue.value)) {
    formData.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (tag: string) => {
  formData.tags = formData.tags.filter(t => t !== tag)
}

const handleTestConnection = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate(['name', 'type', 'connection.host', 'connection.port', 'connection.database', 'connection.username', 'connection.password'])
    
    testing.value = true
    
    try {
      const result = await dataSourceStore.testConnection(formData)
      testResult.value = result
      testResultVisible.value = true
      
      if (result.success) {
        ElMessage.success('连接测试成功')
      } else {
        ElMessage.error('连接测试失败')
      }
    } catch (error) {
      ElMessage.error('连接测试失败')
    }
  } catch (error) {
    ElMessage.warning('请先填写必要的连接信息')
  } finally {
    testing.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    if (props.mode === 'create') {
      await dataSourceStore.createDataSource(formData)
    } else if (props.dataSource) {
      await dataSourceStore.updateDataSource(props.dataSource.id, formData)
    }
    
    emit('success')
    emit('update:visible', false)
    
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleBeforeClose = (done: () => void) => {
  if (loading.value) {
    ElMessage.warning('正在处理中，请稍候...')
    return
  }
  done()
}
</script>

<style scoped lang="scss">
.connection-section {
  .section-title {
    color: var(--color-text-primary);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin: var(--space-4) 0 var(--space-3) 0;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-border-primary);
  }
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.test-result {
  .result-status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-3);
    
    &.success {
      color: var(--color-success);
    }
    
    &.error {
      color: var(--color-error);
    }
    
    i {
      font-size: 1.2em;
    }
  }
  
  .result-message {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-2);
  }
  
  .result-detail {
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-1);
  }
  
  .result-error {
    margin-top: var(--space-3);
  }
}

:deep(.el-dialog) {
  .el-dialog__header {
    border-bottom: 1px solid var(--color-border-primary);
    padding: var(--space-4);
    margin: 0;
    
    .el-dialog__title {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold);
    }
  }
  
  .el-dialog__body {
    padding: var(--space-4);
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .el-dialog__footer {
    border-top: 1px solid var(--color-border-primary);
    padding: var(--space-4);
  }
  
  .el-form-item__label {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }
  
  .el-collapse {
    border: none;
    
    .el-collapse-item__header {
      background: var(--color-bg-tertiary);
      border: none;
      border-radius: var(--radius-md);
      padding: var(--space-3);
      font-weight: var(--font-weight-medium);
    }
    
    .el-collapse-item__wrap {
      background: transparent;
      border: none;
    }
    
    .el-collapse-item__content {
      padding: var(--space-3) 0;
    }
  }
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5% auto;
    
    .el-dialog__body {
      padding: var(--space-3);
      max-height: 60vh;
    }
    
    .el-form-item {
      margin-bottom: var(--space-3);
      
      .el-form-item__label {
        width: 100px !important;
      }
      
      .el-form-item__content {
        margin-left: 100px !important;
      }
    }
  }
}
</style>