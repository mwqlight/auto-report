<template>
  <div class="conversation-panel">
    <!-- 会话容器 -->
    <div class="conversation-container">
      <!-- 消息列表 -->
      <div class="messages-section">
        <div v-if="!conversationState || conversationState.messages.length === 0" class="welcome-section">
          <div class="welcome-content">
            <el-icon class="welcome-icon"><ChatDotRound /></el-icon>
            <h3>AI数据分析助手</h3>
            <p>我可以帮您分析数据、发现洞察、生成可视化图表</p>
            
            <div class="quick-questions">
              <h4>快速开始:</h4>
              <div class="question-cards">
                <div 
                  v-for="question in quickQuestions" 
                  :key="question.id"
                  class="question-card"
                  @click="sendQuickQuestion(question.text)"
                >
                  <div class="question-icon">
                    <el-icon><component :is="question.icon" /></el-icon>
                  </div>
                  <div class="question-text">{{ question.text }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="messages-list">
          <div 
            v-for="message in conversationState.messages" 
            :key="message.id"
            class="message-item"
            :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
          >
            <div class="message-avatar">
              <el-avatar 
                v-if="message.role === 'user'" 
                :size="32" 
                :src="userAvatar"
              >
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar 
                v-else 
                :size="32" 
                :src="assistantAvatar"
                style="background: #409eff;"
              >
                <el-icon><Robot /></el-icon>
              </el-avatar>
            </div>
            
            <div class="message-content">
              <div class="message-bubble">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
              
              <!-- AI分析结果 -->
              <div v-if="message.analysis && message.role === 'assistant'" class="analysis-result">
                <div class="analysis-summary">
                  <h5>分析摘要:</h5>
                  <p>{{ message.analysis.summary }}</p>
                </div>
                
                <div v-if="message.analysis.insights && message.analysis.insights.length > 0" class="analysis-insights">
                  <h5>关键洞察:</h5>
                  <div class="insights-list">
                    <div 
                      v-for="insight in message.analysis.insights.slice(0, 3)" 
                      :key="insight.id"
                      class="insight-item"
                    >
                      <el-tag :type="getImpactTagType(insight.impact)" size="small">
                        {{ getImpactText(insight.impact) }}
                      </el-tag>
                      <span>{{ insight.title }}</span>
                    </div>
                  </div>
                </div>
                
                <div v-if="message.analysis.charts && message.analysis.charts.length > 0" class="analysis-charts">
                  <h5>生成图表:</h5>
                  <div class="charts-preview">
                    <div 
                      v-for="chart in message.analysis.charts.slice(0, 2)" 
                      :key="chart.title"
                      class="chart-preview"
                    >
                      <div class="chart-icon">
                        <el-icon><DataLine /></el-icon>
                      </div>
                      <div class="chart-info">
                        <div class="chart-title">{{ chart.title }}</div>
                        <div class="chart-type">{{ chart.type }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="conversationState.isLoading" class="loading-message">
            <div class="message-avatar">
              <el-avatar :size="32" style="background: #409eff;">
                <el-icon><Robot /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-container">
          <el-input
            v-model="currentMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题或分析需求..."
            :maxlength="1000"
            show-word-limit
            @keydown.enter.exact.prevent="sendMessage"
          />
          
          <div class="input-actions">
            <div class="action-left">
              <el-button 
                v-if="conversationState" 
                size="small" 
                @click="resetConversation"
              >
                <el-icon><Refresh /></el-icon>
                新对话
              </el-button>
            </div>
            
            <div class="action-right">
              <el-button size="small" @click="clearInput">
                清空
              </el-button>
              <el-button 
                type="primary" 
                :loading="conversationState?.isLoading"
                @click="sendMessage"
              >
                <el-icon><Promotion /></el-icon>
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div class="sidebar-section">
        <h4>对话设置</h4>
        <div class="setting-item">
          <label>AI模型:</label>
          <el-select v-model="selectedModel" size="small" style="width: 100%;">
            <el-option 
              v-for="model in availableModels" 
              :key="model" 
              :label="model" 
              :value="model"
            />
          </el-select>
        </div>
        
        <div class="setting-item">
          <label>数据集:</label>
          <el-select v-model="selectedDataset" placeholder="选择数据集" size="small" style="width: 100%;">
            <el-option label="销售数据" value="sales" />
            <el-option label="用户行为" value="user_behavior" />
            <el-option label="产品数据" value="products" />
          </el-select>
        </div>
      </div>
      
      <div class="sidebar-section">
        <h4>分析能力</h4>
        <div class="capability-list">
          <div class="capability-item">
            <el-icon><TrendCharts /></el-icon>
            <span>趋势分析</span>
          </div>
          <div class="capability-item">
            <el-icon><Connection /></el-icon>
            <span>关联发现</span>
          </div>
          <div class="capability-item">
            <el-icon><Warning /></el-icon>
            <span>异常检测</span>
          </div>
          <div class="capability-item">
            <el-icon><DataLine /></el-icon>
            <span>预测建模</span>
          </div>
          <div class="capability-item">
            <el-icon><Histogram /></el-icon>
            <span>可视化生成</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAiStore } from '@/store/ai'
import { ElMessage } from 'element-plus'

const aiStore = useAiStore()

// 响应式数据
const currentMessage = ref('')
const selectedModel = ref('gpt-4')
const selectedDataset = ref('')
const availableModels = ref(['gpt-4', 'gpt-3.5-turbo', 'claude-3'])

// 计算属性
const conversationState = computed(() => aiStore.conversationState)
const userAvatar = computed(() => 'https://api.dicebear.com/7.x/avataaars/svg?seed=user')
const assistantAvatar = computed(() => 'https://api.dicebear.com/7.x/bottts/svg?seed=assistant')

// 快速问题
const quickQuestions = ref([
  { id: 1, icon: 'TrendCharts', text: '分析销售数据的趋势和模式' },
  { id: 2, icon: 'Warning', text: '检测数据中的异常值' },
  { id: 3, icon: 'Connection', text: '找出用户行为的关键影响因素' },
  { id: 4, icon: 'DataLine', text: '预测下个季度的销售额' }
])

// 生命周期
onMounted(() => {
  // 初始化对话状态
  if (!conversationState.value) {
    aiStore.resetConversation()
  }
})

// 方法
async function sendMessage() {
  if (!currentMessage.value.trim()) {
    ElMessage.warning('请输入消息')
    return
  }

  try {
    // 添加用户消息
    aiStore.addUserMessage(currentMessage.value, {
      datasetId: selectedDataset.value
    })

    // 发送到AI
    const response = await aiStore.chatAnalysis({
      message: currentMessage.value,
      context: {
        datasetId: selectedDataset.value
      },
      modelConfig: {
        model: selectedModel.value
      }
    })

    // 清空输入框
    currentMessage.value = ''
    
  } catch (error) {
    ElMessage.error('发送消息失败')
  }
}

function sendQuickQuestion(question: string) {
  currentMessage.value = question
  sendMessage()
}

function resetConversation() {
  aiStore.resetConversation()
  ElMessage.success('新对话已开始')
}

function clearInput() {
  currentMessage.value = ''
}

function formatTime(time: string): string {
  return new Date(time).toLocaleTimeString()
}

function getImpactTagType(impact: string): string {
  const impactMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return impactMap[impact] || ''
}

function getImpactText(impact: string): string {
  const impactMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return impactMap[impact] || impact
}
</script>

<style lang="scss" scoped>
.conversation-panel {
  display: flex;
  height: 600px;
  gap: 20px;
  
  .conversation-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    overflow: hidden;
    
    .messages-section {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      
      .welcome-section {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        
        .welcome-content {
          text-align: center;
          max-width: 500px;
          
          .welcome-icon {
            font-size: 64px;
            color: #409eff;
            margin-bottom: 20px;
          }
          
          h3 {
            margin: 0 0 12px 0;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
          }
          
          p {
            margin: 0 0 32px 0;
            color: #606266;
            font-size: 16px;
          }
          
          .quick-questions {
            h4 {
              margin: 0 0 16px 0;
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }
            
            .question-cards {
              display: grid;
              gap: 12px;
              
              .question-card {
                background: #f5f7fa;
                border: 1px solid #e4e7ed;
                border-radius: 8px;
                padding: 16px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 12px;
                
                &:hover {
                  border-color: #409eff;
                  background: #e6f7ff;
                }
                
                .question-icon {
                  width: 32px;
                  height: 32px;
                  border-radius: 6px;
                  background: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #409eff;
                }
                
                .question-text {
                  flex: 1;
                  color: #606266;
                  font-size: 14px;
                }
              }
            }
          }
        }
      }
      
      .messages-list {
        .message-item {
          display: flex;
          margin-bottom: 24px;
          
          &.user-message {
            flex-direction: row-reverse;
            
            .message-content {
              align-items: flex-end;
            }
            
            .message-bubble {
              background: #409eff;
              color: white;
              border-radius: 18px 18px 4px 18px;
            }
          }
          
          &.assistant-message {
            .message-bubble {
              background: #f5f7fa;
              color: #303133;
              border-radius: 18px 18px 18px 4px;
            }
          }
          
          .message-avatar {
            margin: 0 12px;
          }
          
          .message-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            
            .message-bubble {
              padding: 12px 16px;
              max-width: 70%;
              
              .message-text {
                margin-bottom: 4px;
                line-height: 1.5;
              }
              
              .message-time {
                font-size: 12px;
                opacity: 0.7;
              }
            }
            
            .analysis-result {
              margin-top: 12px;
              padding: 16px;
              background: white;
              border: 1px solid #e4e7ed;
              border-radius: 8px;
              
              h5 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 600;
                color: #303133;
              }
              
              .analysis-summary {
                margin-bottom: 16px;
                
                p {
                  margin: 0;
                  color: #606266;
                  line-height: 1.5;
                }
              }
              
              .analysis-insights {
                margin-bottom: 16px;
                
                .insights-list {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                  
                  .insight-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    
                    span {
                      color: #606266;
                      font-size: 14px;
                    }
                  }
                }
              }
              
              .analysis-charts {
                .charts-preview {
                  display: flex;
                  gap: 12px;
                  
                  .chart-preview {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: #f5f7fa;
                    border-radius: 6px;
                    
                    .chart-icon {
                      color: #409eff;
                    }
                    
                    .chart-info {
                      .chart-title {
                        font-size: 12px;
                        font-weight: 500;
                        color: #303133;
                      }
                      
                      .chart-type {
                        font-size: 11px;
                        color: #909399;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        .loading-message {
          display: flex;
          margin-bottom: 24px;
          
          .message-avatar {
            margin: 0 12px;
          }
          
          .message-content {
            flex: 1;
            
            .message-bubble {
              background: #f5f7fa;
              border-radius: 18px 18px 18px 4px;
              padding: 12px 16px;
              max-width: 120px;
              
              .typing-indicator {
                display: flex;
                gap: 4px;
                
                span {
                  width: 8px;
                  height: 8px;
                  background: #909399;
                  border-radius: 50%;
                  animation: typing 1.4s infinite ease-in-out;
                  
                  &:nth-child(1) { animation-delay: 0s; }
                  &:nth-child(2) { animation-delay: 0.2s; }
                  &:nth-child(3) { animation-delay: 0.4s; }
                }
              }
            }
          }
        }
      }
    }
    
    .input-section {
      border-top: 1px solid #e4e7ed;
      padding: 20px;
      
      .input-container {
        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          
          .action-left, .action-right {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }
  
  .sidebar {
    width: 280px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    padding: 20px;
    
    .sidebar-section {
      margin-bottom: 24px;
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
      
      .setting-item {
        margin-bottom: 16px;
        
        label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #606266;
        }
      }
      
      .capability-list {
        .capability-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          color: #606266;
          font-size: 14px;
          
          .el-icon {
            color: #409eff;
          }
        }
      }
    }
  }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.4; }
  30% { opacity: 1; }
}

@media (max-width: 768px) {
  .conversation-panel {
    flex-direction: column;
    height: auto;
    
    .conversation-container {
      .messages-section {
        padding: 16px;
        
        .messages-list {
          .message-item {
            .message-bubble {
              max-width: 85%;
            }
          }
        }
      }
      
      .input-section {
        padding: 16px;
      }
    }
    
    .sidebar {
      width: 100%;
      margin-top: 20px;
    }
  }
}
</style>