<template>
  <el-dialog
    v-model="visible"
    :title="channel ? '编辑通知渠道' : '新建通知渠道'"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="left"
    >
      <!-- 基本信息 -->
      <el-form-item label="渠道名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入渠道名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="渠道类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择渠道类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option label="邮箱" value="email" />
          <el-option label="Webhook" value="webhook" />
          <el-option label="Slack" value="slack" />
          <el-option label="钉钉" value="dingtalk" />
          <el-option label="企业微信" value="wechat" />
          <el-option label="短信" value="sms" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="enabled">
        <el-switch
          v-model="form.enabled"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>

      <!-- 邮箱配置 -->
      <div v-if="form.type === 'email'">
        <el-form-item label="SMTP服务器" prop="config.email.smtpHost">
          <el-input
            v-model="form.config.email.smtpHost"
            placeholder="smtp.example.com"
          />
        </el-form-item>

        <el-form-item label="SMTP端口" prop="config.email.smtpPort">
          <el-input-number
            v-model="form.config.email.smtpPort"
            :min="1"
            :max="65535"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="发件邮箱" prop="config.email.senderEmail">
          <el-input
            v-model="form.config.email.senderEmail"
            placeholder="noreply@example.com"
          />
        </el-form-item>

        <el-form-item label="发件人名称" prop="config.email.senderName">
          <el-input
            v-model="form.config.email.senderName"
            placeholder="系统通知"
          />
        </el-form-item>

        <el-form-item label="认证用户名" prop="config.email.username">
          <el-input
            v-model="form.config.email.username"
            placeholder="用户名"
          />
        </el-form-item>

        <el-form-item label="认证密码" prop="config.email.password">
          <el-input
            v-model="form.config.email.password"
            type="password"
            placeholder="密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="收件人" prop="config.email.recipients">
          <el-select
            v-model="form.config.email.recipients"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入邮箱地址"
            style="width: 100%"
          >
            <el-option
              v-for="email in emailRecipients"
              :key="email"
              :label="email"
              :value="email"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="SSL/TLS" prop="config.email.useSsl">
          <el-switch v-model="form.config.email.useSsl" />
        </el-form-item>
      </div>

      <!-- Webhook配置 -->
      <div v-if="form.type === 'webhook'">
        <el-form-item label="Webhook URL" prop="config.webhook.url">
          <el-input
            v-model="form.config.webhook.url"
            placeholder="https://example.com/webhook"
          />
        </el-form-item>

        <el-form-item label="请求方法" prop="config.webhook.method">
          <el-select v-model="form.config.webhook.method" style="width: 100%">
            <el-option label="POST" value="POST" />
            <el-option label="GET" value="GET" />
            <el-option label="PUT" value="PUT" />
          </el-select>
        </el-form-item>

        <el-form-item label="请求头" prop="config.webhook.headers">
          <el-input
            v-model="form.config.webhook.headers"
            type="textarea"
            :rows="3"
            placeholder='{"Content-Type": "application/json"}'
          />
        </el-form-item>

        <el-form-item label="请求体模板" prop="config.webhook.bodyTemplate">
          <el-input
            v-model="form.config.webhook.bodyTemplate"
            type="textarea"
            :rows="4"
            placeholder='{"alert": "{{.AlertName}}", "level": "{{.Level}}"}' 
          />
        </el-form-item>
      </div>

      <!-- Slack配置 -->
      <div v-if="form.type === 'slack'">
        <el-form-item label="Webhook URL" prop="config.slack.webhookUrl">
          <el-input
            v-model="form.config.slack.webhookUrl"
            placeholder="https://hooks.slack.com/services/..."
          />
        </el-form-item>

        <el-form-item label="频道" prop="config.slack.channel">
          <el-input
            v-model="form.config.slack.channel"
            placeholder="#general"
          />
        </el-form-item>

        <el-form-item label="用户名" prop="config.slack.username">
          <el-input
            v-model="form.config.slack.username"
            placeholder="Alert Bot"
          />
        </el-form-item>

        <el-form-item label="图标" prop="config.slack.iconEmoji">
          <el-input
            v-model="form.config.slack.iconEmoji"
            placeholder=":warning:"
          />
        </el-form-item>
      </div>

      <!-- 钉钉配置 -->
      <div v-if="form.type === 'dingtalk'">
        <el-form-item label="Webhook URL" prop="config.dingtalk.webhookUrl">
          <el-input
            v-model="form.config.dingtalk.webhookUrl"
            placeholder="https://oapi.dingtalk.com/robot/send?access_token=..."
          />
        </el-form-item>

        <el-form-item label="签名密钥" prop="config.dingtalk.secret">
          <el-input
            v-model="form.config.dingtalk.secret"
            type="password"
            placeholder="签名密钥"
            show-password
          />
        </el-form-item>

        <el-form-item label="@所有人" prop="config.dingtalk.atAll">
          <el-switch v-model="form.config.dingtalk.atAll" />
        </el-form-item>

        <el-form-item label="@手机号" prop="config.dingtalk.atMobiles">
          <el-select
            v-model="form.config.dingtalk.atMobiles"
            multiple
            filterable
            allow-create
            placeholder="请输入手机号"
            style="width: 100%"
          >
            <el-option
              v-for="mobile in mobileNumbers"
              :key="mobile"
              :label="mobile"
              :value="mobile"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 企业微信配置 -->
      <div v-if="form.type === 'wechat'">
        <el-form-item label="企业ID" prop="config.wechat.corpId">
          <el-input
            v-model="form.config.wechat.corpId"
            placeholder="企业ID"
          />
        </el-form-item>

        <el-form-item label="应用ID" prop="config.wechat.agentId">
          <el-input
            v-model="form.config.wechat.agentId"
            placeholder="应用ID"
          />
        </el-form-item>

        <el-form-item label="应用密钥" prop="config.wechat.corpSecret">
          <el-input
            v-model="form.config.wechat.corpSecret"
            type="password"
            placeholder="应用密钥"
            show-password
          />
        </el-form-item>

        <el-form-item label="接收部门" prop="config.wechat.toParty">
          <el-input
            v-model="form.config.wechat.toParty"
            placeholder="部门ID，多个用|分隔"
          />
        </el-form-item>

        <el-form-item label="接收用户" prop="config.wechat.toUser">
          <el-input
            v-model="form.config.wechat.toUser"
            placeholder="用户ID，多个用|分隔"
          />
        </el-form-item>
      </div>

      <!-- 短信配置 -->
      <div v-if="form.type === 'sms'">
        <el-form-item label="服务商" prop="config.sms.provider">
          <el-select v-model="form.config.sms.provider" style="width: 100%">
            <el-option label="阿里云" value="aliyun" />
            <el-option label="腾讯云" value="tencent" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <el-form-item label="Access Key" prop="config.sms.accessKey">
          <el-input
            v-model="form.config.sms.accessKey"
            placeholder="Access Key"
          />
        </el-form-item>

        <el-form-item label="Secret Key" prop="config.sms.secretKey">
          <el-input
            v-model="form.config.sms.secretKey"
            type="password"
            placeholder="Secret Key"
            show-password
          />
        </el-form-item>

        <el-form-item label="签名" prop="config.sms.signName">
          <el-input
            v-model="form.config.sms.signName"
            placeholder="短信签名"
          />
        </el-form-item>

        <el-form-item label="模板ID" prop="config.sms.templateCode">
          <el-input
            v-model="form.config.sms.templateCode"
            placeholder="短信模板ID"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="config.sms.phoneNumbers">
          <el-select
            v-model="form.config.sms.phoneNumbers"
            multiple
            filterable
            allow-create
            placeholder="请输入手机号"
            style="width: 100%"
          >
            <el-option
              v-for="mobile in mobileNumbers"
              :key="mobile"
              :label="mobile"
              :value="mobile"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 描述 -->
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="请输入渠道描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ channel ? '更新' : '创建' }}
        </el-button>
        <el-button v-if="channel" @click="handleTest" :loading="testing">
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
import type { NotificationChannel, NotificationChannelConfig } from '@/types/alerts'

interface Props {
  modelValue: boolean
  channel?: NotificationChannel | null
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
  type: 'email',
  enabled: true,
  description: '',
  config: {
    email: {
      smtpHost: '',
      smtpPort: 587,
      senderEmail: '',
      senderName: '',
      username: '',
      password: '',
      recipients: [],
      useSsl: false
    },
    webhook: {
      url: '',
      method: 'POST',
      headers: '{"Content-Type": "application/json"}',
      bodyTemplate: ''
    },
    slack: {
      webhookUrl: '',
      channel: '',
      username: 'Alert Bot',
      iconEmoji: ':warning:'
    },
    dingtalk: {
      webhookUrl: '',
      secret: '',
      atAll: false,
      atMobiles: []
    },
    wechat: {
      corpId: '',
      agentId: '',
      corpSecret: '',
      toParty: '',
      toUser: ''
    },
    sms: {
      provider: 'aliyun',
      accessKey: '',
      secretKey: '',
      signName: '',
      templateCode: '',
      phoneNumbers: []
    }
  } as NotificationChannelConfig
})

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择渠道类型', trigger: 'change' }
  ],
  'config.email.smtpHost': [
    { required: true, message: '请输入SMTP服务器', trigger: 'blur' }
  ],
  'config.email.senderEmail': [
    { required: true, message: '请输入发件邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  'config.webhook.url': [
    { required: true, message: '请输入Webhook URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL', trigger: 'blur' }
  ],
  'config.slack.webhookUrl': [
    { required: true, message: '请输入Slack Webhook URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL', trigger: 'blur' }
  ],
  'config.dingtalk.webhookUrl': [
    { required: true, message: '请输入钉钉Webhook URL', trigger: 'blur' },
    { type: 'url', message: '请输入正确的URL', trigger: 'blur' }
  ],
  'config.wechat.corpId': [
    { required: true, message: '请输入企业ID', trigger: 'blur' }
  ],
  'config.sms.accessKey': [
    { required: true, message: '请输入Access Key', trigger: 'blur' }
  ]
}

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 预设数据
const emailRecipients = ref(['admin@example.com', 'dev@example.com'])
const mobileNumbers = ref(['13800138000', '13900139000'])

// 监听渠道变化
watch(() => props.channel, (newChannel) => {
  if (newChannel) {
    Object.assign(form, {
      name: newChannel.name,
      type: newChannel.type,
      enabled: newChannel.enabled,
      description: newChannel.description || '',
      config: { ...newChannel.config }
    })
  } else {
    resetForm()
  }
})

// 类型变化处理
const handleTypeChange = () => {
  // 重置配置
  Object.keys(form.config).forEach(key => {
    if (key !== form.type) {
      form.config[key as keyof NotificationChannelConfig] = getDefaultConfig(key)
    }
  })
}

// 获取默认配置
const getDefaultConfig = (type: string) => {
  const defaults = {
    email: {
      smtpHost: '',
      smtpPort: 587,
      senderEmail: '',
      senderName: '',
      username: '',
      password: '',
      recipients: [],
      useSsl: false
    },
    webhook: {
      url: '',
      method: 'POST',
      headers: '{"Content-Type": "application/json"}',
      bodyTemplate: ''
    },
    slack: {
      webhookUrl: '',
      channel: '',
      username: 'Alert Bot',
      iconEmoji: ':warning:'
    },
    dingtalk: {
      webhookUrl: '',
      secret: '',
      atAll: false,
      atMobiles: []
    },
    wechat: {
      corpId: '',
      agentId: '',
      corpSecret: '',
      toParty: '',
      toUser: ''
    },
    sms: {
      provider: 'aliyun',
      accessKey: '',
      secretKey: '',
      signName: '',
      templateCode: '',
      phoneNumbers: []
    }
  }
  return defaults[type as keyof typeof defaults] || {}
}

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    type: 'email',
    enabled: true,
    description: '',
    config: getDefaultConfig('email')
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
    if (props.channel) {
      await alertsStore.updateNotificationChannel(props.channel.id, form)
      ElMessage.success('更新成功')
    } else {
      await alertsStore.createNotificationChannel(form)
      ElMessage.success('创建成功')
    }
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error(props.channel ? '更新失败' : '创建失败')
  } finally {
    loading.value = false
  }
}

// 测试渠道
const handleTest = async () => {
  if (!props.channel) return

  testing.value = true
  try {
    const result = await alertsStore.testNotificationChannel(props.channel.id)
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

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5% auto;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}
</style>