<template>
  <div class="settings-panel">
    <!-- AI模型配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="section-header">
          <el-icon><Cpu /></el-icon>
          <span>AI模型配置</span>
        </div>
      </template>
      
      <div class="config-content">
        <div class="config-item">
          <label class="config-label">默认模型</label>
          <el-select 
            v-model="modelConfig.defaultModel" 
            placeholder="选择默认模型"
            style="width: 200px;"
          >
            <el-option 
              v-for="model in availableModels" 
              :key="model.value" 
              :label="model.label" 
              :value="model.value"
            />
          </el-select>
          <div class="config-description">用于智能分析和对话的默认AI模型</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">API密钥</label>
          <el-input
            v-model="modelConfig.apiKey"
            type="password"
            placeholder="请输入API密钥"
            show-password
            style="width: 300px;"
          />
          <div class="config-description">用于访问AI服务的API密钥</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">API端点</label>
          <el-input
            v-model="modelConfig.apiEndpoint"
            placeholder="请输入API端点"
            style="width: 300px;"
          />
          <div class="config-description">AI服务的API端点地址</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">最大Token数</label>
          <el-input-number
            v-model="modelConfig.maxTokens"
            :min="100"
            :max="4000"
            :step="100"
            controls-position="right"
          />
          <div class="config-description">每次请求的最大Token数量</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">温度参数</label>
          <el-slider
            v-model="modelConfig.temperature"
            :min="0"
            :max="1"
            :step="0.1"
            show-stops
            style="width: 200px;"
          />
          <span class="slider-value">{{ modelConfig.temperature }}</span>
          <div class="config-description">控制生成文本的随机性，0为最保守，1为最随机</div>
        </div>
      </div>
      
      <div class="section-actions">
        <el-button @click="testModelConnection" :loading="testingConnection">
          测试连接
        </el-button>
        <el-button type="primary" @click="saveModelConfig">
          保存配置
        </el-button>
      </div>
    </el-card>
    
    <!-- 分析参数配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="section-header">
          <el-icon><Setting /></el-icon>
          <span>分析参数配置</span>
        </div>
      </template>
      
      <div class="config-content">
        <div class="config-item">
          <label class="config-label">最大洞察数量</label>
          <el-input-number
            v-model="analysisConfig.maxInsights"
            :min="1"
            :max="20"
            controls-position="right"
          />
          <div class="config-description">每次分析生成的最大洞察数量</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">置信度阈值</label>
          <el-slider
            v-model="analysisConfig.confidenceThreshold"
            :min="0.5"
            :max="1"
            :step="0.05"
            show-stops
            style="width: 200px;"
          />
          <span class="slider-value">{{ (analysisConfig.confidenceThreshold * 100).toFixed(0) }}%</span>
          <div class="config-description">低于此阈值的洞察将被过滤</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">超时时间(秒)</label>
          <el-input-number
            v-model="analysisConfig.timeout"
            :min="30"
            :max="300"
            :step="10"
            controls-position="right"
          />
          <div class="config-description">分析任务的最大执行时间</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">自动保存结果</label>
          <el-switch v-model="analysisConfig.autoSave" />
          <div class="config-description">分析完成后自动保存结果到历史记录</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">启用实时预览</label>
          <el-switch v-model="analysisConfig.realTimePreview" />
          <div class="config-description">在分析过程中实时显示预览结果</div>
        </div>
      </div>
      
      <div class="section-actions">
        <el-button type="primary" @click="saveAnalysisConfig">
          保存配置
        </el-button>
      </div>
    </el-card>
    
    <!-- 系统配置 -->
    <el-card class="config-section">
      <template #header>
        <div class="section-header">
          <el-icon><Monitor /></el-icon>
          <span>系统配置</span>
        </div>
      </template>
      
      <div class="config-content">
        <div class="config-item">
          <label class="config-label">数据保留时间(天)</label>
          <el-input-number
            v-model="systemConfig.dataRetentionDays"
            :min="7"
            :max="365"
            controls-position="right"
          />
          <div class="config-description">分析记录和临时数据的保留时间</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">最大并发任务数</label>
          <el-input-number
            v-model="systemConfig.maxConcurrentTasks"
            :min="1"
            :max="10"
            controls-position="right"
          />
          <div class="config-description">同时运行的最大分析任务数量</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">启用性能监控</label>
          <el-switch v-model="systemConfig.enableMonitoring" />
          <div class="config-description">收集系统性能和使用统计信息</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">日志级别</label>
          <el-select v-model="systemConfig.logLevel" style="width: 200px;">
            <el-option label="DEBUG" value="debug" />
            <el-option label="INFO" value="info" />
            <el-option label="WARN" value="warn" />
            <el-option label="ERROR" value="error" />
          </el-select>
          <div class="config-description">系统日志的详细程度</div>
        </div>
        
        <div class="config-item">
          <label class="config-label">自动更新检查</label>
          <el-switch v-model="systemConfig.autoUpdateCheck" />
          <div class="config-description">自动检查系统更新</div>
        </div>
      </div>
      
      <div class="section-actions">
        <el-button type="primary" @click="saveSystemConfig">
          保存配置
        </el-button>
        <el-button @click="resetToDefault">
          恢复默认
        </el-button>
      </div>
    </el-card>
    
    <!-- 系统状态 -->
    <el-card class="config-section">
      <template #header>
        <div class="section-header">
          <el-icon><DataLine /></el-icon>
          <span>系统状态</span>
        </div>
      </template>
      
      <div class="status-content">
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">AI服务状态</div>
            <div class="status-value" :class="getServiceStatusClass(serviceStatus.ai)">
              {{ getServiceStatusText(serviceStatus.ai) }}
            </div>
          </div>
          
          <div class="status-item">
            <div class="status-label">数据库连接</div>
            <div class="status-value" :class="getServiceStatusClass(serviceStatus.database)">
              {{ getServiceStatusText(serviceStatus.database) }}
            </div>
          </div>
          
          <div class="status-item">
            <div class="status-label">缓存服务</div>
            <div class="status-value" :class="getServiceStatusClass(serviceStatus.cache)">
              {{ getServiceStatusText(serviceStatus.cache) }}
            </div>
          </div>
          
          <div class="status-item">
            <div class="status-label">运行时间</div>
            <div class="status-value">{{ formatUptime(systemUptime) }}</div>
          </div>
          
          <div class="status-item">
            <div class="status-label">内存使用</div>
            <div class="status-value">{{ systemMetrics.memoryUsage }}%</div>
          </div>
          
          <div class="status-item">
            <div class="status-label">CPU使用率</div>
            <div class="status-value">{{ systemMetrics.cpuUsage }}%</div>
          </div>
          
          <div class="status-item">
            <div class="status-label">活跃任务数</div>
            <div class="status-value">{{ systemMetrics.activeTasks }}</div>
          </div>
          
          <div class="status-item">
            <div class="status-label">今日分析次数</div>
            <div class="status-value">{{ systemMetrics.todayAnalyses }}</div>
          </div>
        </div>
      </div>
      
      <div class="section-actions">
        <el-button @click="refreshSystemStatus">
          刷新状态
        </el-button>
        <el-button @click="showSystemLogs">
          查看日志
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAiStore } from '@/store/ai'
import { ElMessage } from 'element-plus'
import type { ModelConfig, AnalysisConfig, SystemConfig } from '@/types/ai'

const aiStore = useAiStore()

// AI模型配置
const modelConfig = reactive<ModelConfig>({
  defaultModel: 'gpt-4',
  apiKey: '',
  apiEndpoint: '',
  maxTokens: 2000,
  temperature: 0.7
})

const availableModels = ref([
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude-3', value: 'claude-3' },
  { label: 'Llama 2', value: 'llama-2' }
])

// 分析参数配置
const analysisConfig = reactive<AnalysisConfig>({
  maxInsights: 5,
  confidenceThreshold: 0.8,
  timeout: 120,
  autoSave: true,
  realTimePreview: true
})

// 系统配置
const systemConfig = reactive<SystemConfig>({
  dataRetentionDays: 30,
  maxConcurrentTasks: 3,
  enableMonitoring: true,
  logLevel: 'info',
  autoUpdateCheck: true
})

// 系统状态
const serviceStatus = reactive({
  ai: 'healthy',
  database: 'healthy',
  cache: 'healthy'
})

const systemUptime = ref(0)
const systemMetrics = reactive({
  memoryUsage: 0,
  cpuUsage: 0,
  activeTasks: 0,
  todayAnalyses: 0
})

const testingConnection = ref(false)

// 生命周期
onMounted(() => {
  loadConfig()
  refreshSystemStatus()
  
  // 定时刷新系统状态
  setInterval(refreshSystemStatus, 30000)
})

// 方法
function loadConfig() {
  // 从store加载配置
  const config = aiStore.modelConfig
  if (config) {
    Object.assign(modelConfig, config)
  }
}

async function testModelConnection() {
  testingConnection.value = true
  try {
    const result = await aiStore.checkServiceHealth()
    if (result.ai === 'healthy') {
      ElMessage.success('AI服务连接正常')
    } else {
      ElMessage.warning('AI服务连接异常')
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  } finally {
    testingConnection.value = false
  }
}

async function saveModelConfig() {
  try {
    await aiStore.updateModelConfig(modelConfig)
    ElMessage.success('模型配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

async function saveAnalysisConfig() {
  try {
    await aiStore.updateAnalysisConfig(analysisConfig)
    ElMessage.success('分析配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

async function saveSystemConfig() {
  try {
    await aiStore.updateSystemConfig(systemConfig)
    ElMessage.success('系统配置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

async function resetToDefault() {
  try {
    await aiStore.resetConfig()
    loadConfig()
    ElMessage.success('配置已恢复默认值')
  } catch (error) {
    ElMessage.error('重置失败')
  }
}

async function refreshSystemStatus() {
  try {
    const status = await aiStore.checkServiceHealth()
    Object.assign(serviceStatus, status)
    
    // 模拟系统指标
    systemMetrics.memoryUsage = Math.floor(Math.random() * 30) + 20
    systemMetrics.cpuUsage = Math.floor(Math.random() * 40) + 10
    systemMetrics.activeTasks = Math.floor(Math.random() * 5)
    systemMetrics.todayAnalyses = Math.floor(Math.random() * 50) + 10
    systemUptime.value += 30
  } catch (error) {
    ElMessage.error('刷新状态失败')
  }
}

function showSystemLogs() {
  ElMessage.info('系统日志功能正在开发中')
}

function getServiceStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    healthy: 'status-healthy',
    warning: 'status-warning',
    error: 'status-error'
  }
  return statusMap[status] || 'status-unknown'
}

function getServiceStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    healthy: '正常',
    warning: '警告',
    error: '异常'
  }
  return statusMap[status] || '未知'
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}
</script>

<style lang="scss" scoped>
.settings-panel {
  .config-section {
    margin-bottom: 20px;
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #303133;
      
      .el-icon {
        color: #409eff;
      }
    }
    
    .config-content {
      .config-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 24px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .config-label {
          width: 150px;
          font-weight: 500;
          color: #606266;
          line-height: 32px;
          flex-shrink: 0;
        }
        
        .config-description {
          margin-left: 16px;
          font-size: 12px;
          color: #909399;
          line-height: 1.5;
          max-width: 300px;
        }
        
        .slider-value {
          margin-left: 12px;
          font-size: 14px;
          color: #606266;
          min-width: 40px;
        }
      }
    }
    
    .status-content {
      .status-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        
        .status-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 6px;
          
          .status-label {
            font-size: 14px;
            color: #606266;
          }
          
          .status-value {
            font-size: 18px;
            font-weight: 600;
            
            &.status-healthy {
              color: #67c23a;
            }
            
            &.status-warning {
              color: #e6a23c;
            }
            
            &.status-error {
              color: #f56c6c;
            }
            
            &.status-unknown {
              color: #909399;
            }
          }
        }
      }
    }
    
    .section-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f2f5;
    }
  }
}

@media (max-width: 768px) {
  .settings-panel {
    .config-section {
      .config-content {
        .config-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          
          .config-label {
            width: auto;
            line-height: 1.5;
          }
          
          .config-description {
            margin-left: 0;
            max-width: none;
          }
        }
      }
      
      .status-content {
        .status-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>