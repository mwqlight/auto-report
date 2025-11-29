import request from '@/utils/request'
import type { AnalysisChart, AnalysisDashboard, ChartData, ChartConfig } from '@/types/analysis'

export class AnalysisApi {
  // 获取图表列表
  static async getCharts(params?: {
    page?: number
    size?: number
    keyword?: string
    type?: string
    datasetId?: number
  }) {
    return request.get('/api/v1/analysis/charts', { params })
  }

  // 获取图表详情
  static async getChartDetail(id: number) {
    return request.get(`/api/v1/analysis/charts/${id}`)
  }

  // 创建图表
  static async createChart(data: {
    name: string
    type: string
    datasetId: number
    config: ChartConfig
    description?: string
  }) {
    return request.post('/api/v1/analysis/charts', data)
  }

  // 更新图表
  static async updateChart(id: number, data: Partial<AnalysisChart>) {
    return request.put(`/api/v1/analysis/charts/${id}`, data)
  }

  // 删除图表
  static async deleteChart(id: number) {
    return request.delete(`/api/v1/analysis/charts/${id}`)
  }

  // 复制图表
  static async copyChart(id: number) {
    return request.post(`/api/v1/analysis/charts/${id}/copy`)
  }

  // 获取图表数据
  static async getChartData(chartId: number, params?: any) {
    return request.get(`/api/v1/analysis/charts/${chartId}/data`, { params })
  }

  // 刷新图表数据
  static async refreshChartData(chartId: number) {
    return request.post(`/api/v1/analysis/charts/${chartId}/refresh`)
  }

  // 导出图表数据
  static async exportChartData(chartId: number, format: 'csv' | 'excel' | 'json') {
    return request.get(`/api/v1/analysis/charts/${chartId}/export`, {
      params: { format },
      responseType: 'blob'
    })
  }

  // 获取仪表板列表
  static async getDashboards(params?: {
    page?: number
    size?: number
    keyword?: string
  }) {
    return request.get('/api/v1/analysis/dashboards', { params })
  }

  // 获取仪表板详情
  static async getDashboardDetail(id: number) {
    return request.get(`/api/v1/analysis/dashboards/${id}`)
  }

  // 创建仪表板
  static async createDashboard(data: {
    name: string
    description?: string
    layout: any
    charts: number[]
    isPublic?: boolean
  }) {
    return request.post('/api/v1/analysis/dashboards', data)
  }

  // 更新仪表板
  static async updateDashboard(id: number, data: Partial<AnalysisDashboard>) {
    return request.put(`/api/v1/analysis/dashboards/${id}`, data)
  }

  // 删除仪表板
  static async deleteDashboard(id: number) {
    return request.delete(`/api/v1/analysis/dashboards/${id}`)
  }

  // 复制仪表板
  static async copyDashboard(id: number) {
    return request.post(`/api/v1/analysis/dashboards/${id}/copy`)
  }

  // 获取仪表板数据
  static async getDashboardData(dashboardId: number) {
    return request.get(`/api/v1/analysis/dashboards/${dashboardId}/data`)
  }

  // 保存仪表板布局
  static async saveDashboardLayout(dashboardId: number, layout: any) {
    return request.put(`/api/v1/analysis/dashboards/${dashboardId}/layout`, { layout })
  }

  // 获取图表类型列表
  static async getChartTypes() {
    return request.get('/api/v1/analysis/chart-types')
  }

  // 获取数据集字段信息
  static async getDatasetFields(datasetId: number) {
    return request.get(`/api/v1/analysis/datasets/${datasetId}/fields`)
  }

  // 预览图表配置
  static async previewChart(data: {
    datasetId: number
    config: ChartConfig
    filters?: any
  }) {
    return request.post('/api/v1/analysis/preview', data)
  }

  // 获取图表统计信息
  static async getChartStats(chartId: number) {
    return request.get(`/api/v1/analysis/charts/${chartId}/stats`)
  }

  // 获取仪表板统计信息
  static async getDashboardStats(dashboardId: number) {
    return request.get(`/api/v1/analysis/dashboards/${dashboardId}/stats`)
  }
}

export default AnalysisApi