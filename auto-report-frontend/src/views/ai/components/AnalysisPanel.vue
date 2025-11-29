<template>
  <div class="analysis-panel">
    <!-- 分析任务列表 -->
    <div class="tasks-section">
      <div class="section-header">
        <h3>分析任务</h3>
        <div class="section-actions">
          <el-button size="small" @click="refreshTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      
      <!-- 任务筛选 -->
      <div class="task-filters">
        <el-select v-model="filterStatus" placeholder="状态筛选" size="small" style="width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="进行中" value="processing"></el-option>
          <el-option label="已完成" value="completed"></el-option>
          <el-option label="失败" value="failed"></el-option>
        </el-select>
        
        <el-input
          v-model="searchKeyword"
          placeholder="搜索任务"
          size="small"
          style="width: 200px; margin-left: 12px;"
          prefix-icon="Search"
        />
      </div>
      
      <!-- 任务列表 -->
      <div class="task-list">
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <el-empty description="暂无分析任务" />
        </div>
        
        <div v-else class="task-items">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id"
            class="task-item"
            :class="{ 'task-completed': task.status === 'completed', 'task-failed': task.status === 'failed' }"
          >
            <div class="task-main">
              <div class="task-header">
                <div class="task-title">
                  <el-icon v-if="task.status === 'completed'" class="status-icon success">
                    <SuccessFilled />
                  </el-icon>
                  <el-icon v-else-if="task.status === 'failed'" class="status-icon failed">
                    <CircleCloseFilled />
                  </el-icon>
                  <el-icon v-else-if="task.status === 'processing'" class="status-icon processing">
                    <Loading />
                  </el-icon>
                  <el-icon v-else class="status-icon pending">
                    <Clock />
                  </el-icon>
                  <span>{{ task.question }}</span>
                </div>
                <div class="task-actions">
                  <el-button 
                    v-if="task.status === 'processing'" 
                    size="small" 
                    @click="cancelTask(task.id)"
                  >
                    取消
                  </el-button>
                  <el-button 
                    v-if="task.status === 'completed'" 
                    size="small" 
                    type="primary"
                    @click="viewTaskResult(task)"
                  >
                    查看结果
                  </el-button>
                  <el-button 
                    size="small" 
                    @click="deleteTask(task.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              
              <div class="task-info">
                <span class="dataset">{{ task.datasetName }}</span>
                <span class="time">{{ formatTime(task.createdAt) }}</span>
                <span class="status" :class="task.status">
                  {{ getStatusText(task.status) }}
                </span>
              </div>
              
              <div v-if="task.status === 'processing'" class="task-progress">
                <el-progress 
                  :percentage="task.progress || 0" 
                  :show-text="false"
                  style="width: 100%;"
                />
              </div>
              
              <div v-if="task.error" class="task-error">
                <el-alert 
                  :title="task.error" 
                  type="error" 
                  :closable="false"
                  show-icon
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速分析 -->
    <div class="quick-analysis">
      <div class="section-header">
        <h3>快速分析</h3>
      </div>
      
      <div class="analysis-cards">
        <el-row :gutter="16">
          <el-col :xs="12" :sm="6">
            <div class="analysis-card" @click="startQuickAnalysis('trend')">
              <div class="card-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">趋势分析</div>
                <div class="card-desc">识别数据变化趋势</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="analysis-card" @click="startQuickAnalysis('correlation')">
              <div class="card-icon">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">关联分析</div>
                <div class="card-desc">发现变量间关系</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="analysis-card" @click="startQuickAnalysis('anomaly')">
              <div class="card-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">异常检测</div>
                <div class="card-desc">识别异常数据点</div>
              </div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6">
            <div class="analysis-card" @click="startQuickAnalysis('prediction')">
              <div class="card-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="card-content">
                <div class="card-title">预测分析</div>
                <div class="card-desc">预测未来趋势</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAiStore } from '@/store/ai'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AiAnalysisTask } from '@/types/ai'

const aiStore = useAiStore()

// 响应式数据
const filterStatus = ref('')
const searchKeyword = ref('')

// 计算属性
const filteredTasks = computed(() => {
  let tasks = aiStore.analysisTasks
  
  if (filterStatus.value) {
    tasks = tasks.filter(task => task.status === filterStatus.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    tasks = tasks.filter(task => 
      task.question.toLowerCase().includes(keyword) ||
      task.datasetName.toLowerCase().includes(keyword)
    )
  }
  
  return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 生命周期
onMounted(() => {
  loadTasks()
})

// 方法
async function loadTasks() {
  try {
    await aiStore.fetchTasks()
  } catch (error) {
    ElMessage.error('加载任务列表失败')
  }
}

async function refreshTasks() {
  try {
    await loadTasks()
    ElMessage.success('任务列表已刷新')
  } catch (error) {
    ElMessage.error('刷新失败')
  }
}

async function cancelTask(taskId: string) {
  try {
    await ElMessageBox.confirm('确定要取消这个分析任务吗？', '提示', {
      type: 'warning'
    })
    
    await aiStore.cancelTask(taskId)
    ElMessage.success('任务已取消')
  } catch (error) {
    // 用户取消操作
  }
}

async function deleteTask(taskId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个分析任务吗？', '提示', {
      type: 'warning'
    })
    
    await aiStore.deleteTask(taskId)
    ElMessage.success('任务已删除')
  } catch (error) {
    // 用户取消操作
  }
}

function viewTaskResult(task: AiAnalysisTask) {
  // 跳转到任务详情页面
  console.log('查看任务结果:', task)
}

function startQuickAnalysis(type: string) {
  // 触发快速分析
  console.log('开始快速分析:', type)
  // 这里可以打开分析对话框或跳转到对应页面
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    processing: '进行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}
</script>

<style lang="scss" scoped>
.analysis-panel {
  .tasks-section {
    margin-bottom: 32px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .task-filters {
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
    }
    
    .task-list {
      .task-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .task-item {
        background: #fafafa;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #e4e7ed;
        transition: all 0.3s;
        
        &:hover {
          border-color: #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        }
        
        &.task-completed {
          border-left: 4px solid #52c41a;
        }
        
        &.task-failed {
          border-left: 4px solid #f56c6c;
        }
        
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          
          .task-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            flex: 1;
            
            .status-icon {
              font-size: 16px;
              
              &.success {
                color: #52c41a;
              }
              
              &.failed {
                color: #f56c6c;
              }
              
              &.processing {
                color: #409eff;
                animation: spin 1s linear infinite;
              }
              
              &.pending {
                color: #909399;
              }
            }
          }
          
          .task-actions {
            display: flex;
            gap: 8px;
          }
        }
        
        .task-info {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #909399;
          margin-bottom: 12px;
          
          .status {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            
            &.completed {
              background: #f6ffed;
              color: #52c41a;
            }
            
            &.processing {
              background: #e6f7ff;
              color: #1890ff;
            }
            
            &.failed {
              background: #fff2f0;
              color: #ff4d4f;
            }
            
            &.pending {
              background: #fafafa;
              color: #8c8c8c;
            }
          }
        }
        
        .task-progress {
          margin-bottom: 12px;
        }
        
        .task-error {
          margin-top: 8px;
        }
      }
    }
  }
  
  .quick-analysis {
    .section-header {
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .analysis-cards {
      .analysis-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e4e7ed;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 16px;
        
        &:hover {
          border-color: #409eff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #e6f7ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #1890ff;
        }
        
        .card-content {
          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }
          
          .card-desc {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .analysis-panel {
    .tasks-section {
      .task-header {
        flex-direction: column;
        gap: 12px;
        
        .task-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
      
      .task-info {
        flex-direction: column;
        gap: 8px;
      }
    }
    
    .quick-analysis {
      .analysis-cards {
        .el-col {
          margin-bottom: 16px;
        }
        
        .analysis-card {
          padding: 16px;
          
          .card-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>