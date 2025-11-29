<template>
  <div class="ai-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>AI增强分析</h1>
          <p>使用人工智能技术进行深度数据分析和洞察</p>
        </div>
        
        <div class="header-right">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建分析
          </el-button>
          
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6f7ff;">
              <el-icon style="color: #1890ff;"><DataLine /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalAnalyses }}</div>
              <div class="stat-label">总分析次数</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f6ffed;">
              <el-icon style="color: #52c41a;"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.successRate }}%</div>
              <div class="stat-label">成功率</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fff7e6;">
              <el-icon style="color: #fa8c16;"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgDuration }}s</div>
              <div class="stat-label">平均耗时</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #fff2e8;">
              <el-icon style="color: #fa541c;"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayAnalyses }}</div>
              <div class="stat-label">今日分析</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 功能选项卡 -->
    <div class="tab-section">
      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabChange">
        <el-tab-pane label="智能分析" name="analysis">
          <AnalysisPanel @create-analysis="showCreateDialog = true" />
        </el-tab-pane>
        
        <el-tab-pane label="数据洞察" name="insights">
          <InsightsPanel />
        </el-tab-pane>
        
        <el-tab-pane label="对话分析" name="conversation">
          <ConversationPanel />
        </el-tab-pane>
        
        <el-tab-pane label="分析历史" name="history">
          <HistoryPanel 
            @create-analysis="showCreateDialog = true" 
            @view-result="handleViewResult"
          />
        </el-tab-pane>
        
        <el-tab-pane label="系统配置" name="settings">
          <SettingsPanel />
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 新建分析对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建AI分析"
      width="600px"
      :before-close="handleDialogClose"
    >
      <div class="create-dialog">
        <el-form :model="createForm" label-width="100px">
          <el-form-item label="分析类型">
            <el-select v-model="createForm.type" placeholder="请选择分析类型">
              <el-option label="趋势分析" value="trend" />
              <el-option label="关联分析" value="correlation" />
              <el-option label="异常检测" value="anomaly" />
              <el-option label="预测分析" value="prediction" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="数据集">
            <el-select v-model="createForm.datasetId" placeholder="请选择数据集">
              <el-option label="销售数据" value="sales" />
              <el-option label="用户行为" value="user_behavior" />
              <el-option label="产品数据" value="products" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="分析问题">
            <el-input
              v-model="createForm.question"
              type="textarea"
              :rows="3"
              placeholder="请输入您想要分析的问题..."
              :maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="高级配置">
            <el-checkbox v-model="createForm.autoSave">自动保存结果</el-checkbox>
            <el-checkbox v-model="createForm.realTimePreview">实时预览</el-checkbox>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateAnalysis" :loading="creating">
          开始分析
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAiStore } from '@/store/ai'
import { ElMessage } from 'element-plus'
import AnalysisPanel from './components/AnalysisPanel.vue'
import InsightsPanel from './components/InsightsPanel.vue'
import ConversationPanel from './components/ConversationPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const aiStore = useAiStore()

// 响应式数据
const activeTab = ref('analysis')
const showCreateDialog = ref(false)
const creating = ref(false)

const stats = reactive({
  totalAnalyses: 0,
  successRate: 0,
  avgDuration: 0,
  todayAnalyses: 0
})

const createForm = reactive({
  type: 'trend',
  datasetId: '',
  question: '',
  autoSave: true,
  realTimePreview: true
})

// 生命周期
onMounted(() => {
  loadStats()
})

// 方法
async function loadStats() {
  try {
    const data = await aiStore.getAnalysisStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

async function refreshData() {
  await loadStats()
  ElMessage.success('数据已刷新')
}

function handleTabChange(tab: any) {
  console.log('切换到标签:', tab.props.name)
}

function handleDialogClose(done: () => void) {
  if (creating.value) {
    ElMessage.warning('分析任务正在进行中，请稍候...')
    return
  }
  done()
}

async function handleCreateAnalysis() {
  if (!createForm.question.trim()) {
    ElMessage.warning('请输入分析问题')
    return
  }

  creating.value = true
  try {
    await aiStore.executeAnalysis({
      type: createForm.type,
      datasetId: createForm.datasetId,
      question: createForm.question,
      config: {
        autoSave: createForm.autoSave,
        realTimePreview: createForm.realTimePreview
      }
    })
    
    ElMessage.success('分析任务已创建')
    showCreateDialog.value = false
    resetCreateForm()
    
    // 切换到分析标签页
    activeTab.value = 'analysis'
  } catch (error) {
    ElMessage.error('创建分析任务失败')
  } finally {
    creating.value = false
  }
}

function resetCreateForm() {
  Object.assign(createForm, {
    type: 'trend',
    datasetId: '',
    question: '',
    autoSave: true,
    realTimePreview: true
  })
}

function handleViewResult(record: any) {
  console.log('查看分析结果:', record)
  // 这里可以跳转到详细结果页面
}
</script>

<style lang="scss" scoped>
.ai-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  
  .page-header {
    margin-bottom: 24px;
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      
      .header-left {
        h1 {
          font-size: 28px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }
        
        p {
          color: #606266;
          font-size: 16px;
          margin: 0;
        }
      }
      
      .header-right {
        display: flex;
        gap: 12px;
      }
    }
    
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      
      .stat-card {
        .stat-content {
          display: flex;
          align-items: center;
          gap: 16px;
          
          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .el-icon {
              font-size: 24px;
            }
          }
          
          .stat-info {
            .stat-value {
              font-size: 24px;
              font-weight: 600;
              color: #303133;
              line-height: 1;
              margin-bottom: 4px;
            }
            
            .stat-label {
              font-size: 14px;
              color: #909399;
            }
          }
        }
      }
    }
  }
  
  .tab-section {
    :deep(.el-tabs__content) {
      padding: 0;
    }
    
    :deep(.el-tab-pane) {
      padding: 0;
    }
  }
  
  .create-dialog {
    .el-form {
      .el-checkbox {
        margin-right: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .ai-view {
    padding: 16px;
    
    .page-header {
      .header-content {
        flex-direction: column;
        gap: 16px;
        
        .header-right {
          width: 100%;
          justify-content: flex-end;
        }
      }
      
      .stats-cards {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>