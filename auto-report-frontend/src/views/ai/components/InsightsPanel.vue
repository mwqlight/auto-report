<template>
  <div class="insights-panel">
    <!-- 洞察筛选 -->
    <div class="insight-filters">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <el-select v-model="filterType" placeholder="洞察类型" clearable>
            <el-option label="趋势" value="trend"></el-option>
            <el-option label="模式" value="pattern"></el-option>
            <el-option label="异常" value="outlier"></el-option>
            <el-option label="关联" value="correlation"></el-option>
            <el-option label="季节性" value="seasonality"></el-option>
            <el-option label="预测" value="prediction"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-select v-model="filterImpact" placeholder="影响程度" clearable>
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-input-number 
            v-model="filterConfidence.min" 
            :min="0" 
            :max="1" 
            :step="0.1"
            placeholder="最小置信度"
            style="width: 100%;"
          />
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-input-number 
            v-model="filterConfidence.max" 
            :min="0" 
            :max="1" 
            :step="0.1"
            placeholder="最大置信度"
            style="width: 100%;"
          />
        </el-col>
      </el-row>
      
      <div class="filter-actions">
        <el-button @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="applyFilters">应用筛选</el-button>
      </div>
    </div>

    <!-- 洞察统计 -->
    <div class="insight-stats">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">{{ filteredInsights.length }}</div>
            <div class="stat-label">总洞察数</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">{{ highConfidenceCount }}</div>
            <div class="stat-label">高置信度</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">{{ highImpactCount }}</div>
            <div class="stat-label">高影响度</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="stat-item">
            <div class="stat-value">{{ averageConfidence.toFixed(2) }}</div>
            <div class="stat-label">平均置信度</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 洞察列表 -->
    <div class="insights-list">
      <div v-if="filteredInsights.length === 0" class="empty-state">
        <el-empty description="暂无数据洞察" />
      </div>
      
      <div v-else class="insight-items">
        <div 
          v-for="insight in filteredInsights" 
          :key="insight.id"
          class="insight-item"
          :class="`impact-${insight.impact}`"
        >
          <div class="insight-header">
            <div class="insight-type">
              <el-tag :type="getTypeTagType(insight.type)" size="small">
                {{ getTypeText(insight.type) }}
              </el-tag>
            </div>
            <div class="insight-actions">
              <el-button size="small" @click="viewInsightDetail(insight)">查看详情</el-button>
              <el-button size="small" @click="exportInsight(insight.id)">导出</el-button>
              <el-button size="small" type="danger" @click="deleteInsight(insight.id)">删除</el-button>
            </div>
          </div>
          
          <div class="insight-content">
            <h4 class="insight-title">{{ insight.title }}</h4>
            <p class="insight-description">{{ insight.description }}</p>
            
            <div class="insight-meta">
              <div class="meta-item">
                <el-icon><TrendCharts /></el-icon>
                <span>置信度: {{ (insight.confidence * 100).toFixed(1) }}%</span>
              </div>
              <div class="meta-item">
                <el-icon><ImpactAnalysis /></el-icon>
                <span>影响: {{ getImpactText(insight.impact) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatTime(insight.createdAt) }}</span>
              </div>
            </div>
            
            <div v-if="insight.tags && insight.tags.length > 0" class="insight-tags">
              <el-tag 
                v-for="tag in insight.tags" 
                :key="tag" 
                size="small"
                style="margin-right: 4px;"
              >
                {{ tag }}
              </el-tag>
            </div>
            
            <div v-if="insight.recommendations && insight.recommendations.length > 0" class="insight-recommendations">
              <h5>建议行动:</h5>
              <ul>
                <li v-for="(rec, index) in insight.recommendations" :key="index">{{ rec }}</li>
              </ul>
            </div>
          </div>
          
          <div v-if="insight.visualization" class="insight-visualization">
            <div class="visualization-placeholder">
              <el-icon><DataLine /></el-icon>
              <span>可视化图表</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalInsights"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAiStore } from '@/store/ai'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AiInsightItem } from '@/types/ai'

const aiStore = useAiStore()

// 响应式数据
const filterType = ref('')
const filterImpact = ref('')
const filterConfidence = ref({ min: 0, max: 1 })
const currentPage = ref(1)
const pageSize = ref(10)

// 计算属性
const filteredInsights = computed(() => {
  let insights = aiStore.insights
  
  if (filterType.value) {
    insights = insights.filter(insight => insight.type === filterType.value)
  }
  
  if (filterImpact.value) {
    insights = insights.filter(insight => insight.impact === filterImpact.value)
  }
  
  if (filterConfidence.value.min > 0) {
    insights = insights.filter(insight => insight.confidence >= filterConfidence.value.min)
  }
  
  if (filterConfidence.value.max < 1) {
    insights = insights.filter(insight => insight.confidence <= filterConfidence.value.max)
  }
  
  return insights
})

const totalInsights = computed(() => filteredInsights.value.length)
const highConfidenceCount = computed(() => 
  filteredInsights.value.filter(insight => insight.confidence >= 0.8).length
)
const highImpactCount = computed(() => 
  filteredInsights.value.filter(insight => insight.impact === 'high').length
)
const averageConfidence = computed(() => {
  if (filteredInsights.value.length === 0) return 0
  const sum = filteredInsights.value.reduce((acc, insight) => acc + insight.confidence, 0)
  return sum / filteredInsights.value.length
})

// 生命周期
onMounted(() => {
  loadInsights()
})

// 方法
async function loadInsights() {
  try {
    await aiStore.fetchHistoryInsights({ 
      page: currentPage.value, 
      size: pageSize.value 
    })
  } catch (error) {
    ElMessage.error('加载洞察数据失败')
  }
}

function applyFilters() {
  currentPage.value = 1
  loadInsights()
}

function resetFilters() {
  filterType.value = ''
  filterImpact.value = ''
  filterConfidence.value = { min: 0, max: 1 }
  currentPage.value = 1
  loadInsights()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  loadInsights()
}

function handleCurrentChange(page: number) {
  currentPage.value = page
  loadInsights()
}

function viewInsightDetail(insight: AiInsightItem) {
  // 查看洞察详情
  console.log('查看洞察详情:', insight)
}

async function exportInsight(insightId: string) {
  try {
    await aiStore.exportInsight(insightId)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

async function deleteInsight(insightId: string) {
  try {
    await ElMessageBox.confirm('确定要删除这个洞察吗？', '提示', {
      type: 'warning'
    })
    
    await aiStore.deleteInsight(insightId)
    ElMessage.success('洞察已删除')
  } catch (error) {
    // 用户取消操作
  }
}

function getTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    trend: '趋势',
    pattern: '模式',
    outlier: '异常',
    correlation: '关联',
    seasonality: '季节性',
    prediction: '预测'
  }
  return typeMap[type] || type
}

function getTypeTagType(type: string): string {
  const typeMap: Record<string, string> = {
    trend: 'success',
    pattern: 'primary',
    outlier: 'danger',
    correlation: 'warning',
    seasonality: 'info',
    prediction: ''
  }
  return typeMap[type] || ''
}

function getImpactText(impact: string): string {
  const impactMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return impactMap[impact] || impact
}

function formatTime(time: string): string {
  return new Date(time).toLocaleString()
}
</script>

<style lang="scss" scoped>
.insights-panel {
  .insight-filters {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    .filter-actions {
      margin-top: 16px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
  }
  
  .insight-stats {
    margin-bottom: 20px;
    
    .stat-item {
      background: white;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .insights-list {
    .insight-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .insight-item {
      background: white;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      overflow: hidden;
      transition: all 0.3s;
      
      &.impact-high {
        border-left: 4px solid #f56c6c;
      }
      
      &.impact-medium {
        border-left: 4px solid #e6a23c;
      }
      
      &.impact-low {
        border-left: 4px solid #67c23a;
      }
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .insight-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: #fafafa;
        border-bottom: 1px solid #e4e7ed;
        
        .insight-actions {
          display: flex;
          gap: 8px;
        }
      }
      
      .insight-content {
        padding: 20px;
        
        .insight-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
        
        .insight-description {
          margin: 0 0 16px 0;
          color: #606266;
          line-height: 1.6;
        }
        
        .insight-meta {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #909399;
            
            .el-icon {
              font-size: 16px;
            }
          }
        }
        
        .insight-tags {
          margin-bottom: 16px;
        }
        
        .insight-recommendations {
          background: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
          
          h5 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
          
          ul {
            margin: 0;
            padding-left: 20px;
            
            li {
              color: #606266;
              line-height: 1.6;
              margin-bottom: 4px;
            }
          }
        }
      }
      
      .insight-visualization {
        padding: 0 20px 20px;
        
        .visualization-placeholder {
          height: 200px;
          background: #fafafa;
          border: 1px dashed #d9d9d9;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #909399;
          
          .el-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
        }
      }
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .insights-panel {
    .insight-filters {
      padding: 16px;
      
      .filter-actions {
        justify-content: stretch;
        
        .el-button {
          flex: 1;
        }
      }
    }
    
    .insight-stats {
      .el-col {
        margin-bottom: 16px;
      }
      
      .stat-item {
        padding: 16px;
        
        .stat-value {
          font-size: 20px;
        }
      }
    }
    
    .insights-list {
      .insight-item {
        .insight-header {
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
          
          .insight-actions {
            justify-content: flex-end;
          }
        }
        
        .insight-content {
          padding: 16px;
          
          .insight-meta {
            flex-direction: column;
            gap: 8px;
          }
        }
        
        .insight-visualization {
          padding: 0 16px 16px;
        }
      }
    }
  }
}
</style>