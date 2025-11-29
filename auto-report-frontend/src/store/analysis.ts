import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AnalysisApi from '@/api/analysis'
import type {
  AnalysisChart,
  AnalysisDashboard,
  ChartData,
  ChartTypeOption,
  DatasetField,
  ChartPreviewResponse,
  ChartQueryParams,
  DashboardQueryParams,
  ChartStats,
  DashboardStats
} from '@/types/analysis'

export const useAnalysisStore = defineStore('analysis', () => {
  // 图表相关状态
  const charts = ref<AnalysisChart[]>([])
  const currentChart = ref<AnalysisChart | null>(null)
  const chartLoading = ref(false)
  const chartTotal = ref(0)
  const chartPage = ref(1)
  const chartPageSize = ref(20)

  // 仪表板相关状态
  const dashboards = ref<AnalysisDashboard[]>([])
  const currentDashboard = ref<AnalysisDashboard | null>(null)
  const dashboardLoading = ref(false)
  const dashboardTotal = ref(0)
  const dashboardPage = ref(1)
  const dashboardPageSize = ref(20)

  // 图表数据状态
  const chartData = ref<ChartData | null>(null)
  const chartDataLoading = ref(false)

  // 图表类型选项
  const chartTypes = ref<ChartTypeOption[]>([])

  // 数据集字段信息
  const datasetFields = ref<DatasetField[]>([])

  // 预览状态
  const previewResult = ref<ChartPreviewResponse | null>(null)
  const previewLoading = ref(false)

  // 统计信息
  const chartStats = ref<ChartStats | null>(null)
  const dashboardStats = ref<DashboardStats | null>(null)

  // 计算属性
  const activeCharts = computed(() => 
    charts.value.filter(chart => chart.status === 'active')
  )

  const favoriteCharts = computed(() => 
    charts.value.filter(chart => chart.favoriteCount > 0)
  )

  const publicCharts = computed(() => 
    charts.value.filter(chart => chart.isPublic)
  )

  const activeDashboards = computed(() => 
    dashboards.value.filter(dashboard => dashboard.charts.some(chart => chart.status === 'active'))
  )

  const favoriteDashboards = computed(() => 
    dashboards.value.filter(dashboard => dashboard.favoriteCount > 0)
  )

  const publicDashboards = computed(() => 
    dashboards.value.filter(dashboard => dashboard.isPublic)
  )

  // 图表相关操作
  const fetchCharts = async (params?: ChartQueryParams) => {
    chartLoading.value = true
    try {
      const response = await AnalysisApi.getCharts({
        page: params?.page || chartPage.value,
        size: params?.size || chartPageSize.value,
        ...params
      })
      charts.value = response.data.items
      chartTotal.value = response.data.total
      if (params?.page) chartPage.value = params.page
    } catch (error) {
      console.error('获取图表列表失败:', error)
      throw error
    } finally {
      chartLoading.value = false
    }
  }

  const fetchChartDetail = async (id: number) => {
    try {
      const response = await AnalysisApi.getChartDetail(id)
      currentChart.value = response.data
      return response.data
    } catch (error) {
      console.error('获取图表详情失败:', error)
      throw error
    }
  }

  const createChart = async (data: any) => {
    try {
      const response = await AnalysisApi.createChart(data)
      charts.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('创建图表失败:', error)
      throw error
    }
  }

  const updateChart = async (id: number, data: any) => {
    try {
      const response = await AnalysisApi.updateChart(id, data)
      const index = charts.value.findIndex(chart => chart.id === id)
      if (index !== -1) {
        charts.value[index] = response.data
      }
      if (currentChart.value?.id === id) {
        currentChart.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新图表失败:', error)
      throw error
    }
  }

  const deleteChart = async (id: number) => {
    try {
      await AnalysisApi.deleteChart(id)
      charts.value = charts.value.filter(chart => chart.id !== id)
      if (currentChart.value?.id === id) {
        currentChart.value = null
      }
    } catch (error) {
      console.error('删除图表失败:', error)
      throw error
    }
  }

  const copyChart = async (id: number) => {
    try {
      const response = await AnalysisApi.copyChart(id)
      charts.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('复制图表失败:', error)
      throw error
    }
  }

  const fetchChartData = async (chartId: number, params?: any) => {
    chartDataLoading.value = true
    try {
      const response = await AnalysisApi.getChartData(chartId, params)
      chartData.value = response.data
      return response.data
    } catch (error) {
      console.error('获取图表数据失败:', error)
      throw error
    } finally {
      chartDataLoading.value = false
    }
  }

  const refreshChartData = async (chartId: number) => {
    try {
      const response = await AnalysisApi.refreshChartData(chartId)
      return response.data
    } catch (error) {
      console.error('刷新图表数据失败:', error)
      throw error
    }
  }

  // 仪表板相关操作
  const fetchDashboards = async (params?: DashboardQueryParams) => {
    dashboardLoading.value = true
    try {
      const response = await AnalysisApi.getDashboards({
        page: params?.page || dashboardPage.value,
        size: params?.size || dashboardPageSize.value,
        ...params
      })
      dashboards.value = response.data.items
      dashboardTotal.value = response.data.total
      if (params?.page) dashboardPage.value = params.page
    } catch (error) {
      console.error('获取仪表板列表失败:', error)
      throw error
    } finally {
      dashboardLoading.value = false
    }
  }

  const fetchDashboardDetail = async (id: number) => {
    try {
      const response = await AnalysisApi.getDashboardDetail(id)
      currentDashboard.value = response.data
      return response.data
    } catch (error) {
      console.error('获取仪表板详情失败:', error)
      throw error
    }
  }

  const createDashboard = async (data: any) => {
    try {
      const response = await AnalysisApi.createDashboard(data)
      dashboards.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('创建仪表板失败:', error)
      throw error
    }
  }

  const updateDashboard = async (id: number, data: any) => {
    try {
      const response = await AnalysisApi.updateDashboard(id, data)
      const index = dashboards.value.findIndex(dashboard => dashboard.id === id)
      if (index !== -1) {
        dashboards.value[index] = response.data
      }
      if (currentDashboard.value?.id === id) {
        currentDashboard.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('更新仪表板失败:', error)
      throw error
    }
  }

  const deleteDashboard = async (id: number) => {
    try {
      await AnalysisApi.deleteDashboard(id)
      dashboards.value = dashboards.value.filter(dashboard => dashboard.id !== id)
      if (currentDashboard.value?.id === id) {
        currentDashboard.value = null
      }
    } catch (error) {
      console.error('删除仪表板失败:', error)
      throw error
    }
  }

  const copyDashboard = async (id: number) => {
    try {
      const response = await AnalysisApi.copyDashboard(id)
      dashboards.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('复制仪表板失败:', error)
      throw error
    }
  }

  const saveDashboardLayout = async (dashboardId: number, layout: any) => {
    try {
      await AnalysisApi.saveDashboardLayout(dashboardId, layout)
    } catch (error) {
      console.error('保存仪表板布局失败:', error)
      throw error
    }
  }

  // 其他操作
  const fetchChartTypes = async () => {
    try {
      const response = await AnalysisApi.getChartTypes()
      chartTypes.value = response.data
      return response.data
    } catch (error) {
      console.error('获取图表类型失败:', error)
      throw error
    }
  }

  const fetchDatasetFields = async (datasetId: number) => {
    try {
      const response = await AnalysisApi.getDatasetFields(datasetId)
      datasetFields.value = response.data
      return response.data
    } catch (error) {
      console.error('获取数据集字段失败:', error)
      throw error
    }
  }

  const previewChart = async (data: any) => {
    previewLoading.value = true
    try {
      const response = await AnalysisApi.previewChart(data)
      previewResult.value = response.data
      return response.data
    } catch (error) {
      console.error('预览图表失败:', error)
      throw error
    } finally {
      previewLoading.value = false
    }
  }

  const fetchChartStats = async (chartId: number) => {
    try {
      const response = await AnalysisApi.getChartStats(chartId)
      chartStats.value = response.data
      return response.data
    } catch (error) {
      console.error('获取图表统计失败:', error)
      throw error
    }
  }

  const fetchDashboardStats = async (dashboardId: number) => {
    try {
      const response = await AnalysisApi.getDashboardStats(dashboardId)
      dashboardStats.value = response.data
      return response.data
    } catch (error) {
      console.error('获取仪表板统计失败:', error)
      throw error
    }
  }

  // 重置状态
  const resetChartState = () => {
    currentChart.value = null
    chartData.value = null
    chartDataLoading.value = false
  }

  const resetDashboardState = () => {
    currentDashboard.value = null
  }

  const resetPreviewState = () => {
    previewResult.value = null
    previewLoading.value = false
  }

  return {
    // 状态
    charts,
    currentChart,
    chartLoading,
    chartTotal,
    chartPage,
    chartPageSize,
    dashboards,
    currentDashboard,
    dashboardLoading,
    dashboardTotal,
    dashboardPage,
    dashboardPageSize,
    chartData,
    chartDataLoading,
    chartTypes,
    datasetFields,
    previewResult,
    previewLoading,
    chartStats,
    dashboardStats,

    // 计算属性
    activeCharts,
    favoriteCharts,
    publicCharts,
    activeDashboards,
    favoriteDashboards,
    publicDashboards,

    // 图表操作
    fetchCharts,
    fetchChartDetail,
    createChart,
    updateChart,
    deleteChart,
    copyChart,
    fetchChartData,
    refreshChartData,

    // 仪表板操作
    fetchDashboards,
    fetchDashboardDetail,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    copyDashboard,
    saveDashboardLayout,

    // 其他操作
    fetchChartTypes,
    fetchDatasetFields,
    previewChart,
    fetchChartStats,
    fetchDashboardStats,

    // 重置操作
    resetChartState,
    resetDashboardState,
    resetPreviewState
  }
})