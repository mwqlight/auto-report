<template>
  <div class="alert-rules-panel">
    <!-- 头部工具栏 -->
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">预警规则管理</h3>
        <p class="panel-description">创建和管理数据预警规则，监控数据异常</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建规则
        </el-button>
        <el-button @click="fetchAlertRules">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-input
        v-model="searchFilters.keyword"
        placeholder="搜索规则名称或描述"
        style="width: 300px"
        clearable
        @clear="handleSearch"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="searchFilters.status" placeholder="状态" clearable @change="handleSearch">
        <el-option label="启用" value="active" />
        <el-option label="禁用" value="inactive" />
      </el-select>

      <el-select v-model="searchFilters.type" placeholder="类型" clearable @change="handleSearch">
        <el-option label="阈值预警" value="threshold" />
        <el-option label="异常检测" value="anomaly" />
        <el-option label="趋势预警" value="trend" />
        <el-option label="自定义规则" value="custom" />
      </el-select>

      <el-select v-model="searchFilters.severity" placeholder="严重程度" clearable @change="handleSearch">
        <el-option label="低" value="low" />
        <el-option label="中" value="medium" />
        <el-option label="高" value="high" />
        <el-option label="严重" value="critical" />
      </el-select>

      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
    </div>

    <!-- 规则列表 -->
    <div class="rules-list">
      <el-table
        v-loading="alertsStore.alertRulesLoading"
        :data="alertsStore.alertRules"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="规则名称" min-width="200">
          <template #default="{ row }">
            <div class="rule-name">
              <span class="name-text">{{ row.name }}</span>
              <el-tag
                v-if="row.severity === 'critical'"
                size="small"
                type="danger"
                effect="dark"
              >
                严重
              </el-tag>
            </div>
            <div class="rule-desc">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityTagType(row.severity)" effect="dark">
              {{ getSeverityLabel(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              @change="handleToggleRule(row.id, row.enabled)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="triggerCount" label="触发次数" width="100" />
        <el-table-column prop="lastTriggeredAt" label="最后触发" width="180">
          <template #default="{ row }">
            {{ row.lastTriggeredAt ? formatDate(row.lastTriggeredAt) : '从未触发' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" @click="handleTest(row.id)">测试</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="alertsStore.alertRulesPagination.page"
          v-model:page-size="alertsStore.alertRulesPagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="alertsStore.alertRulesPagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div v-if="selectedRules.length > 0" class="batch-toolbar">
      <span>已选择 {{ selectedRules.length }} 项</span>
      <el-button size="small" @click="handleBatchEnable">启用</el-button>
      <el-button size="small" @click="handleBatchDisable">禁用</el-button>
      <el-button size="small" type="danger" @click="handleBatchDelete">删除</el-button>
    </div>

    <!-- 创建/编辑对话框 -->
    <AlertRuleDialog
      v-model="showCreateDialog"
      :rule="editingRule"
      @success="handleDialogSuccess"
      @close="handleDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { useAlertsStore } from '@/store/alerts'
import type { AlertRule } from '@/types/alerts'
import AlertRuleDialog from './AlertRuleDialog.vue'

const alertsStore = useAlertsStore()

// 响应式数据
const selectedRules = ref<string[]>([])
const showCreateDialog = ref(false)
const editingRule = ref<AlertRule | null>(null)

// 搜索筛选条件
const searchFilters = ref({
  keyword: '',
  status: '' as '' | 'active' | 'inactive',
  type: '' as '' | 'threshold' | 'anomaly' | 'trend' | 'custom',
  severity: '' as '' | 'low' | 'medium' | 'high' | 'critical'
})

// 生命周期
onMounted(() => {
  fetchAlertRules()
})

// 获取预警规则
const fetchAlertRules = async () => {
  try {
    await alertsStore.fetchAlertRules({
      keyword: searchFilters.value.keyword || undefined,
      status: searchFilters.value.status || undefined,
      type: searchFilters.value.type || undefined
    })
  } catch (error) {
    ElMessage.error('获取预警规则失败')
  }
}

// 搜索处理
const handleSearch = () => {
  alertsStore.alertRulesPagination.page = 1
  fetchAlertRules()
}

// 分页处理
const handleSizeChange = (size: number) => {
  alertsStore.alertRulesPagination.size = size
  fetchAlertRules()
}

const handleCurrentChange = (page: number) => {
  alertsStore.alertRulesPagination.page = page
  fetchAlertRules()
}

// 选择处理
const handleSelectionChange = (selection: AlertRule[]) => {
  selectedRules.value = selection.map(item => item.id)
}

// 切换规则状态
const handleToggleRule = async (id: string, enabled: boolean) => {
  try {
    await alertsStore.toggleAlertRule(id, enabled)
    ElMessage.success(`${enabled ? '启用' : '禁用'}成功`)
  } catch (error) {
    ElMessage.error('操作失败')
    // 恢复状态
    const rule = alertsStore.alertRules.find(r => r.id === id)
    if (rule) {
      rule.enabled = !enabled
    }
  }
}

// 编辑规则
const handleEdit = (rule: AlertRule) => {
  editingRule.value = rule
  showCreateDialog.value = true
}

// 测试规则
const handleTest = async (id: string) => {
  try {
    const result = await alertsStore.testAlertRule(id)
    if (result.triggered) {
      ElMessage.warning(`规则测试触发: ${result.message}`)
    } else {
      ElMessage.success(`规则测试正常: ${result.message}`)
    }
  } catch (error) {
    ElMessage.error('测试失败')
  }
}

// 删除规则
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该预警规则吗？', '确认删除', {
      type: 'warning'
    })
    await alertsStore.deleteAlertRule(id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量操作
const handleBatchEnable = async () => {
  try {
    await alertsStore.batchAlertRules(selectedRules.value, 'enable')
    ElMessage.success('批量启用成功')
    selectedRules.value = []
  } catch (error) {
    ElMessage.error('批量启用失败')
  }
}

const handleBatchDisable = async () => {
  try {
    await alertsStore.batchAlertRules(selectedRules.value, 'disable')
    ElMessage.success('批量禁用成功')
    selectedRules.value = []
  } catch (error) {
    ElMessage.error('批量禁用失败')
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedRules.value.length} 个预警规则吗？`, '确认删除', {
      type: 'warning'
    })
    await alertsStore.batchAlertRules(selectedRules.value, 'delete')
    ElMessage.success('批量删除成功')
    selectedRules.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 对话框处理
const handleDialogSuccess = () => {
  fetchAlertRules()
  showCreateDialog.value = false
  editingRule.value = null
}

const handleDialogClose = () => {
  showCreateDialog.value = false
  editingRule.value = null
}

// 工具函数
const getTypeLabel = (type: string) => {
  const map = {
    threshold: '阈值预警',
    anomaly: '异常检测',
    trend: '趋势预警',
    custom: '自定义规则'
  }
  return map[type as keyof typeof map] || type
}

const getTypeTagType = (type: string) => {
  const map = {
    threshold: 'primary',
    anomaly: 'warning',
    trend: 'success',
    custom: 'info'
  }
  return map[type as keyof typeof map] || 'info'
}

const getSeverityLabel = (severity: string) => {
  const map = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return map[severity as keyof typeof map] || severity
}

const getSeverityTagType = (severity: string) => {
  const map = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return map[severity as keyof typeof map] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.alert-rules-panel {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    .panel-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .panel-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

.filter-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .el-select {
    width: 120px;
  }
}

.rules-list {
  .rule-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .name-text {
      font-weight: 500;
    }
  }

  .rule-desc {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.batch-toolbar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;

  span {
    font-size: 14px;
    color: #606266;
  }
}

@media (max-width: 768px) {
  .alert-rules-panel {
    padding: 16px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .header-right {
      width: 100%;
      display: flex;
      gap: 8px;

      .el-button {
        flex: 1;
      }
    }
  }

  .filter-toolbar {
    flex-direction: column;

    .el-input,
    .el-select {
      width: 100%;
    }
  }

  .batch-toolbar {
    left: 16px;
    right: 16px;
    transform: none;
    justify-content: space-between;
  }
}
</style>