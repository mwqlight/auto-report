<template>
  <div class="history-panel">
    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索分析记录..."
          prefix-icon="Search"
          style="width: 300px;"
          clearable
        />
        
        <el-select v-model="filterType" placeholder="分析类型" style="width: 150px; margin-left: 12px;">
          <el-option label="全部" value="" />
          <el-option label="趋势分析" value="trend" />
          <el-option label="关联分析" value="correlation" />
          <el-option label="异常检测" value="anomaly" />
          <el-option label="预测分析" value="prediction" />
          <el-option label="对话分析" value="conversation" />
        </el-select>
        
        <el-select v-model="filterStatus" placeholder="状态" style="width: 120px; margin-left: 12px;">
          <el-option label="全部" value="" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
          <el-option label="进行中" value="running" />
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px; margin-left: 12px;"
        />
      </div>
      
      <div class="filter-right">
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="loadHistory">刷新</el-button>
        <el-button @click="exportHistory" :loading="exporting">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>
    
    <!-- 历史记录列表 -->
    <div class="history-list">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="filteredHistory.length === 0" class="empty-state">
        <div class="empty-content">
          <el-icon class="empty-icon"><DocumentDelete /></el-icon>
          <h3>暂无分析记录</h3>
          <p>开始您的第一次AI数据分析吧！</p>
          <el-button type="primary" @click="$emit('create-analysis')">
            新建分析
          </el-button>
        </div>
      </div>
      
      <div v-else class="history-items">
        <div 
          v-for="record in paginatedHistory" 
          :key="record.id"
          class="history-item"
          :class="{ 'running': record.status === 'running' }"
        >
          <div class="item-header">
            <div class="item-title">
              <h4>{{ record.title }}</h4>
              <el-tag 
                :type="getStatusTagType(record.status)" 
                size="small"
              >
                {{ getStatusText(record.status) }}
              </el-tag>
              <el-tag 
                :type="getTypeTagType(record.type)" 
                size="small"
                effect="plain"
              >
                {{ getTypeText(record.type) }}
              </el-tag>
            </div>
            
            <div class="item-actions">
              <el-button 
                v-if="record.status === 'success'" 
                size="small" 
                @click="viewResult(record)"
              >
                查看结果
              </el-button>
              <el-button 
                v-if="record.status === 'running'" 
                size="small" 
                @click="cancelAnalysis(record)"
              >
                取消
              </el-button>
              <el-button 
                size="small" 
                @click="copyAnalysis(record)"
              >
                复制
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                plain
                @click="deleteRecord(record)"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <div class="item-content">
            <div class="item-info">
              <div class="info-row">
                <span class="info-label">数据集:</span>
                <span class="info-value">{{ record.datasetName || '未指定' }}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">分析问题:</span>
                <span class="info-value">{{ record.question }}</span>
              </div>
              
              <div v-if="record.insights && record.insights.length > 0" class="info-row">
                <span class="info-label">关键洞察:</span>
                <div class="insights-preview">
                  <el-tag 
                    v-for="insight in record.insights.slice(0, 3)" 
                    :key="insight.id"
                    :type="getImpactTagType(insight.impact)"
                    size="small"
                    effect="plain"
                  >
                    {{ insight.title }}
                  </el-tag>
                  <span v-if="record.insights.length > 3" class="more-count">
                    +{{ record.insights.length - 3 }}个
                  </span>
                </div>
              </div>
              
              <div v-if="record.charts && record.charts.length > 0" class="info-row">
                <span class="info-label">生成图表:</span>
                <div class="charts-preview">
                  <span 
                    v-for="chart in record.charts.slice(0, 2)" 
                    :key="chart.title"
                    class="chart-badge"
                  >
                    {{ chart.type }}
                  </span>
                  <span v-if="record.charts.length > 2" class="more-count">
                    +{{ record.charts.length - 2 }}个
                  </span>
                </div>
              </div>
            </div>
            
            <div class="item-meta">
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatTime(record.createdAt) }}</span>
              </div>
              
              <div v-if="record.duration" class="meta-item">
                <el-icon><Timer /></el-icon>
                <span>{{ formatDuration(record.duration) }}</span>
              </div>
              
              <div v-if="record.confidence" class="meta-item">
                <el-icon><Star /></el-icon>
                <span>置信度: {{ (record.confidence * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
          
          <!-- 进度条 -->
          <div v-if="record.status === 'running'" class="progress-bar">
            <el-progress 
              :percentage="record.progress || 0" 
              :show-text="false"
              :stroke-width="4"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="filteredHistory.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredHistory.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialog.visible"
      title="确认删除"
      width="400px"
    >
      <p>确定要删除分析记录 "{{ deleteDialog.record?.title }}" 吗？此操作不可恢复。</p>
      
      <template #footer>
        <el-button @click="deleteDialog.visible = false">取消</el-button>
        <el-button type="danger" @click="confirmDelete" :loading="deleteDialog.loading">
          确认删除
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAiStore } from '@/store/ai'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AnalysisHistory } from '@/types/ai'

const emit = defineEmits<{
  (e: 'create-analysis'): void
  (e: 'view-result', record: AnalysisHistory): void
}>()

const aiStore = useAiStore()

// 响应式数据
const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const exporting = ref(false)

const deleteDialog = ref({
  visible: false,
  record: null as AnalysisHistory | null,
  loading: false
})

// 计算属性
const analysisHistory = computed(() => aiStore.analysisHistory)

const filteredHistory = computed(() => {
  let filtered = analysisHistory.value
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(record => 
      record.title.toLowerCase().includes(keyword) ||
      record.question.toLowerCase().includes(keyword) ||
      record.datasetName?.toLowerCase().includes(keyword)
    )
  }
  
  // 类型筛选
  if (filterType.value) {
    filtered = filtered.filter(record => record.type === filterType.value)
  }
  
  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(record => record.status === filterStatus.value)
  }
  
  // 日期筛选
  if (dateRange.value) {
    const [start, end] = dateRange.value
    filtered = filtered.filter(record => {
      const recordDate = new Date(record.createdAt)
      return recordDate >= start && recordDate <= end
    })
  }
  
  // 按时间倒序排序
  return filtered.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredHistory.value.slice(start, end)
})

// 生命周期
onMounted(() => {
  loadHistory()
})

// 方法
async function loadHistory() {
  loading.value = true
  try {
    await aiStore.loadAnalysisHistory()
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  searchKeyword.value = ''
  filterType.value = ''
  filterStatus.value = ''
  dateRange.value = null
  currentPage.value = 1
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

function handleCurrentChange(page: number) {
  currentPage.value = page
}

function viewResult(record: AnalysisHistory) {
  emit('view-result', record)
}

async function cancelAnalysis(record: AnalysisHistory) {
  try {
    await ElMessageBox.confirm('确定要取消这个分析任务吗？', '确认取消', {
      type: 'warning'
    })
    
    await aiStore.cancelAnalysisTask(record.id)
    ElMessage.success('分析任务已取消')
  } catch (error) {
    // 用户取消操作
  }
}

async function copyAnalysis(record: AnalysisHistory) {
  try {
    await aiStore.copyAnalysisTask(record.id)
    ElMessage.success('分析任务已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

function deleteRecord(record: AnalysisHistory) {
  deleteDialog.value = {
    visible: true,
    record,
    loading: false
  }
}

async function confirmDelete() {
  if (!deleteDialog.value.record) return
  
  deleteDialog.value.loading = true
  try {
    await aiStore.deleteAnalysisHistory(deleteDialog.value.record.id)
    ElMessage.success('删除成功')
    deleteDialog.value.visible = false
  } catch (error) {
    ElMessage.error('删除失败')
  } finally {
    deleteDialog.value.loading = false
  }
}

async function exportHistory() {
  exporting.value = true
  try {
    await aiStore.exportAnalysisHistory()
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

function getStatusTagType(status: string): string {
  const statusMap: Record<string, string> = {
    success: 'success',
    failed: 'danger',
    running: 'warning'
  }
  return statusMap[status] || ''
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    success: '成功',
    failed: '失败',
    running: '进行中'
  }
  return statusMap[status] || status
}

function getTypeTagType(type: string): string {
  const typeMap: Record<string, string> = {
    trend: 'primary',
    correlation: 'success',
    anomaly: 'warning',
    prediction: 'info',
    conversation: 'danger'
  }
  return typeMap[type] || ''
}

function getTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    trend: '趋势分析',
    correlation: '关联分析',
    anomaly: '异常检测',
    prediction: '预测分析',
    conversation: '对话分析'
  }
  return typeMap[type] || type
}

function getImpactTagType(impact: string): string {
  const impactMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return impactMap[impact] || ''
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
}

function formatDuration(duration: number): string {
  if (duration < 60) {
    return `${duration}秒`
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)}分${duration % 60}秒`
  } else {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return `${hours}时${minutes}分`
  }
}
</script>

<style lang="scss" scoped>
.history-panel {
  .filter-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    
    .filter-left {
      display: flex;
      align-items: center;
    }
    
    .filter-right {
      display: flex;
      gap: 8px;
    }
  }
  
  .history-list {
    .loading-container {
      padding: 40px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
    }
    
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 40px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      
      .empty-content {
        text-align: center;
        
        .empty-icon {
          font-size: 64px;
          color: #c0c4cc;
          margin-bottom: 20px;
        }
        
        h3 {
          margin: 0 0 12px 0;
          font-size: 20px;
          color: #606266;
        }
        
        p {
          margin: 0 0 24px 0;
          color: #909399;
        }
      }
    }
    
    .history-items {
      .history-item {
        background: white;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        margin-bottom: 16px;
        transition: all 0.3s;
        overflow: hidden;
        
        &.running {
          border-left: 4px solid #e6a23c;
        }
        
        &:not(.running):hover {
          border-color: #409eff;
          box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #f0f2f5;
          
          .item-title {
            display: flex;
            align-items: center;
            gap: 12px;
            
            h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }
          }
          
          .item-actions {
            display: flex;
            gap: 8px;
          }
        }
        
        .item-content {
          padding: 20px;
          
          .item-info {
            margin-bottom: 16px;
            
            .info-row {
              display: flex;
              margin-bottom: 12px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .info-label {
                width: 80px;
                font-size: 14px;
                color: #909399;
                flex-shrink: 0;
              }
              
              .info-value {
                flex: 1;
                font-size: 14px;
                color: #606266;
                line-height: 1.5;
              }
              
              .insights-preview {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                
                .more-count {
                  font-size: 12px;
                  color: #909399;
                  align-self: center;
                }
              }
              
              .charts-preview {
                display: flex;
                gap: 6px;
                
                .chart-badge {
                  padding: 2px 8px;
                  background: #f5f7fa;
                  border-radius: 4px;
                  font-size: 12px;
                  color: #606266;
                }
                
                .more-count {
                  font-size: 12px;
                  color: #909399;
                  align-self: center;
                }
              }
            }
          }
          
          .item-meta {
            display: flex;
            gap: 20px;
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 12px;
              color: #909399;
              
              .el-icon {
                font-size: 14px;
              }
            }
          }
        }
        
        .progress-bar {
          padding: 0 20px 20px;
        }
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
  }
}

@media (max-width: 768px) {
  .history-panel {
    .filter-toolbar {
      flex-direction: column;
      gap: 16px;
      
      .filter-left {
        flex-direction: column;
        width: 100%;
        gap: 12px;
        
        .el-input,
        .el-select,
        .el-date-picker {
          width: 100% !important;
          margin-left: 0 !important;
        }
      }
      
      .filter-right {
        width: 100%;
        justify-content: flex-end;
      }
    }
    
    .history-list {
      .history-items {
        .history-item {
          .item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            
            .item-actions {
              width: 100%;
              justify-content: flex-end;
            }
          }
          
          .item-content {
            .item-meta {
              flex-direction: column;
              gap: 8px;
            }
          }
        }
      }
    }
  }
}
</style>