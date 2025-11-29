<template>
  <el-dialog
    v-model="visible"
    :title="rule ? '编辑预警规则' : '新建预警规则'"
    width="700px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="left"
    >
      <!-- 基本信息 -->
      <el-form-item label="规则名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入规则名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="规则描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入规则描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="严重程度" prop="severity">
        <el-select v-model="form.severity" style="width: 100%">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
          <el-option label="严重" value="critical" />
        </el-select>
      </el-form-item>

      <el-form-item label="规则类型" prop="type">
        <el-select v-model="form.type" style="width: 100%">
          <el-option label="阈值预警" value="threshold" />
          <el-option label="异常检测" value="anomaly" />
          <el-option label="趋势预警" value="trend" />
          <el-option label="状态预警" value="status" />
        </el-select>
      </el-form-item>

      <!-- 规则配置 -->
      <el-divider content-position="left">规则配置</el-divider>

      <el-form-item label="监控指标" prop="metric">
        <el-select v-model="form.metric" style="width: 100%">
          <el-option label="CPU使用率" value="cpu_usage" />
          <el-option label="内存使用率" value="memory_usage" />
          <el-option label="磁盘使用率" value="disk_usage" />
          <el-option label="API响应时间" value="api_response_time" />
          <el-option label="错误率" value="error_rate" />
          <el-option label="请求量" value="request_count" />
          <el-option label="数据库连接数" value="db_connections" />
          <el-option label="队列长度" value="queue_length" />
        </el-select>
      </el-form-item>

      <el-form-item label="阈值条件" prop="condition">
        <div class="condition-config">
          <el-select v-model="form.condition" style="width: 120px">
            <el-option label="大于" value="gt" />
            <el-option label="大于等于" value="gte" />
            <el-option label="小于" value="lt" />
            <el-option label="小于等于" value="lte" />
            <el-option label="等于" value="eq" />
          </el-select>
          <el-input-number
            v-model="form.threshold"
            :min="0"
            :max="form.metric.includes('usage') ? 100 : 10000"
            :precision="form.metric.includes('usage') ? 1 : 0"
            controls-position="right"
            style="margin-left: 8px; width: 120px"
          />
          <span style="margin-left: 8px; color: #909399">
            {{ form.metric.includes('usage') ? '%' : form.metric.includes('time') ? 'ms' : '' }}
          </span>
        </div>
      </el-form-item>

      <el-form-item label="持续时间" prop="duration">
        <el-input-number
          v-model="form.duration"
          :min="1"
          :max="60"
          controls-position="right"
          style="width: 120px"
        />
        <span style="margin-left: 8px; color: #909399">分钟</span>
        <div style="font-size: 12px; color: #909399; margin-top: 4px;">
          指标持续满足条件的时间
        </div>
      </el-form-item>

      <el-form-item label="检查间隔" prop="checkInterval">
        <el-input-number
          v-model="form.checkInterval"
          :min="1"
          :max="30"
          controls-position="right"
          style="width: 120px"
        />
        <span style="margin-left: 8px; color: #909399">分钟</span>
        <div style="font-size: 12px; color: #909399; margin-top: 4px;">
          规则检查的时间间隔
        </div>
      </el-form-item>

      <!-- 通知设置 -->
      <el-divider content-position="left">通知设置</el-divider>

      <el-form-item label="通知渠道" prop="notificationChannels">
        <el-checkbox-group v-model="form.notificationChannels">
          <el-checkbox label="email">邮箱</el-checkbox>
          <el-checkbox label="webhook">Webhook</el-checkbox>
          <el-checkbox label="slack">Slack</el-checkbox>
          <el-checkbox label="dingtalk">钉钉</el-checkbox>
          <el-checkbox label="wechat">企业微信</el-checkbox>
          <el-checkbox label="sms">短信</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="重复通知" prop="repeatNotification">
        <el-switch v-model="form.repeatNotification" />
        <span style="margin-left: 8px; color: #909399">
          {{ form.repeatNotification ? '开启' : '关闭' }}
        </span>
        <div style="font-size: 12px; color: #909399; margin-top: 4px;">
          预警持续时是否重复发送通知
        </div>
      </el-form-item>

      <el-form-item v-if="form.repeatNotification" label="重复间隔" prop="repeatInterval">
        <el-input-number
          v-model="form.repeatInterval"
          :min="5"
          :max="60"
          controls-position="right"
          style="width: 120px"
        />
        <span style="margin-left: 8px; color: #909399">分钟</span>
      </el-form-item>

      <el-form-item label="静默时间" prop="silenceTime">
        <el-time-picker
          v-model="form.silenceTime"
          is-range
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          placeholder="选择时间范围"
          style="width: 100%"
        />
        <div style="font-size: 12px; color: #909399; margin-top: 4px;">
          在此时间段内不发送通知
        </div>
      </el-form-item>

      <!-- 高级设置 -->
      <el-divider content-position="left">高级设置</el-divider>

      <el-form-item label="规则状态" prop="enabled">
        <el-switch
          v-model="form.enabled"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>

      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="请输入标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in presetTags"
            :key="tag"
            :label="tag"
            :value="tag"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ rule ? '更新' : '创建' }}
        </el-button>
        <el-button v-if="rule" @click="handleTest" :loading="testing">
          测试
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAlertsStore } from '@/store/alerts'
import type { AlertRule } from '@/types/alerts'

interface Props {
  modelValue: boolean
  rule?: AlertRule | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const alertsStore = useAlertsStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const testing = ref(false)

// 表单数据
const form = reactive({
  name: '',
  description: '',
  severity: 'medium',
  type: 'threshold',
  metric: 'cpu_usage',
  condition: 'gt',
  threshold: 80,
  duration: 5,
  checkInterval: 5,
  notificationChannels: ['email'],
  repeatNotification: false,
  repeatInterval: 15,
  silenceTime: [] as any[],
  enabled: true,
  tags: [] as string[]
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  severity: [
    { required: true, message: '请选择严重程度', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  metric: [
    { required: true, message: '请选择监控指标', trigger: 'change' }
  ],
  condition: [
    { required: true, message: '请选择条件', trigger: 'change' }
  ],
  threshold: [
    { required: true, message: '请输入阈值', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入持续时间', trigger: 'blur' }
  ],
  checkInterval: [
    { required: true, message: '请输入检查间隔', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 预设标签
const presetTags = ref(['系统监控', '性能预警', '业务监控', '安全预警', '数据库'])

// 监听规则变化
watch(() => props.rule, (newRule) => {
  if (newRule) {
    Object.assign(form, {
      name: newRule.name,
      description: newRule.description || '',
      severity: newRule.severity,
      type: newRule.type,
      metric: newRule.metric,
      condition: newRule.condition,
      threshold: newRule.threshold,
      duration: newRule.duration,
      checkInterval: newRule.checkInterval,
      notificationChannels: newRule.notificationChannels || ['email'],
      repeatNotification: newRule.repeatNotification || false,
      repeatInterval: newRule.repeatInterval || 15,
      silenceTime: newRule.silenceTime || [],
      enabled: newRule.enabled,
      tags: newRule.tags || []
    })
  } else {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    description: '',
    severity: 'medium',
    type: 'threshold',
    metric: 'cpu_usage',
    condition: 'gt',
    threshold: 80,
    duration: 5,
    checkInterval: 5,
    notificationChannels: ['email'],
    repeatNotification: false,
    repeatInterval: 15,
    silenceTime: [],
    enabled: true,
    tags: []
  })
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    if (props.rule) {
      await alertsStore.updateAlertRule(props.rule.id, form)
      ElMessage.success('更新成功')
    } else {
      await alertsStore.createAlertRule(form)
      ElMessage.success('创建成功')
    }
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(props.rule ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

// 测试规则
const handleTest = async () => {
  if (!props.rule) return

  testing.value = true
  try {
    const result = await alertsStore.testAlertRule(props.rule.id)
    if (result.success) {
      ElMessage.success(`测试成功: ${result.message}`)
    } else {
      ElMessage.error(`测试失败: ${result.message}`)
    }
  } catch (error) {
    ElMessage.error('测试失败')
  } finally {
    testing.value = false
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.condition-config {
  display: flex;
  align-items: center;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-divider) {
  margin: 24px 0 16px 0;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5% auto;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .condition-config {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;

    .el-select,
    .el-input-number {
      width: 100% !important;
    }
  }

  .dialog-footer {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>