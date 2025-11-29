import request from '@/utils/request'
import type { Dataset, DatasetCreateRequest, DatasetUpdateRequest, DatasetQueryParams } from '@/types/dataset'

/**
 * 数据集API接口
 */
export class DatasetApi {
  
  /**
   * 获取数据集列表
   */
  static async getDatasets(params?: DatasetQueryParams): Promise<{
    items: Dataset[]
    total: number
  }> {
    const response = await request.get('/api/v1/datasets', { params })
    return response.data
  }

  /**
   * 获取数据集详情
   */
  static async getDataset(id: string): Promise<Dataset> {
    const response = await request.get(`/api/v1/datasets/${id}`)
    return response.data
  }

  /**
   * 创建数据集
   */
  static async createDataset(data: DatasetCreateRequest): Promise<Dataset> {
    const response = await request.post('/api/v1/datasets', data)
    return response.data
  }

  /**
   * 更新数据集
   */
  static async updateDataset(id: string, data: DatasetUpdateRequest): Promise<Dataset> {
    const response = await request.put(`/api/v1/datasets/${id}`, data)
    return response.data
  }

  /**
   * 删除数据集
   */
  static async deleteDataset(id: string): Promise<void> {
    await request.delete(`/api/v1/datasets/${id}`)
  }

  /**
   * 批量删除数据集
   */
  static async batchDeleteDatasets(ids: string[]): Promise<void> {
    await request.delete('/api/v1/datasets/batch', { data: { ids } })
  }

  /**
   * 复制数据集
   */
  static async copyDataset(id: string, name: string): Promise<Dataset> {
    const response = await request.post(`/api/v1/datasets/${id}/copy`, { name })
    return response.data
  }

  /**
   * 预览数据集数据
   */
  static async previewDataset(id: string, limit: number = 100): Promise<any[]> {
    const response = await request.get(`/api/v1/datasets/${id}/preview`, { 
      params: { limit } 
    })
    return response.data
  }

  /**
   * 获取数据集统计信息
   */
  static async getDatasetStats(id: string): Promise<{
    rowCount: number
    columnCount: number
    memoryUsage: string
    lastUpdated: string
  }> {
    const response = await request.get(`/api/v1/datasets/${id}/stats`)
    return response.data
  }

  /**
   * 执行SQL查询
   */
  static async executeSql(id: string, sql: string): Promise<any[]> {
    const response = await request.post(`/api/v1/datasets/${id}/execute`, { sql })
    return response.data
  }

  /**
   * 导出数据集
   */
  static async exportDataset(id: string, format: 'csv' | 'excel' | 'json' = 'csv'): Promise<Blob> {
    const response = await request.get(`/api/v1/datasets/${id}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * 导入数据集
   */
  static async importDataset(data: {
    name: string
    description?: string
    file: File
    dataSourceId?: string
  }): Promise<Dataset> {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('file', data.file)
    if (data.description) formData.append('description', data.description)
    if (data.dataSourceId) formData.append('dataSourceId', data.dataSourceId)

    const response = await request.post('/api/v1/datasets/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * 获取数据集类型
   */
  static async getDatasetTypes(): Promise<Array<{
    value: string
    label: string
    description: string
  }>> {
    const response = await request.get('/api/v1/datasets/types')
    return response.data
  }

  /**
   * 验证数据集名称
   */
  static async validateDatasetName(name: string): Promise<{
    valid: boolean
    message?: string
  }> {
    const response = await request.post('/api/v1/datasets/validate-name', { name })
    return response.data
  }

  /**
   * 获取数据集关联的数据源
   */
  static async getDatasetDataSources(id: string): Promise<Array<{
    id: string
    name: string
    type: string
    connectionStatus: string
  }>> {
    const response = await request.get(`/api/v1/datasets/${id}/data-sources`)
    return response.data
  }

  /**
   * 刷新数据集数据
   */
  static async refreshDataset(id: string): Promise<Dataset> {
    const response = await request.post(`/api/v1/datasets/${id}/refresh`)
    return response.data
  }

  /**
   * 获取数据集操作日志
   */
  static async getDatasetLogs(id: string, params?: {
    page?: number
    size?: number
    type?: string
  }): Promise<{
    items: Array<{
      id: string
      operation: string
      operator: string
      timestamp: string
      details: string
    }>
    total: number
  }> {
    const response = await request.get(`/api/v1/datasets/${id}/logs`, { params })
    return response.data
  }
}

export default DatasetApi