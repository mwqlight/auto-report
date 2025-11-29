import request from '@/utils/request'
import type {
  DataSource,
  CreateDataSourceRequest,
  UpdateDataSourceRequest,
  DataSourceQueryParams,
  DataSourceListResponse,
  ConnectionTestRequest,
  ConnectionTestResult,
  DataSourceStatistics
} from '@/types/datasource'

/**
 * 数据源API服务
 */
export class DataSourceApi {
  /**
   * 获取数据源列表
   */
  static async getDataSources(params?: DataSourceQueryParams): Promise<DataSourceListResponse> {
    return request({
      url: '/api/v1/datasources',
      method: 'GET',
      params
    })
  }

  /**
   * 获取数据源详情
   */
  static async getDataSource(id: string): Promise<DataSource> {
    return request({
      url: `/api/v1/datasources/${id}`,
      method: 'GET'
    })
  }

  /**
   * 创建数据源
   */
  static async createDataSource(data: CreateDataSourceRequest): Promise<DataSource> {
    return request({
      url: '/api/v1/datasources',
      method: 'POST',
      data
    })
  }

  /**
   * 更新数据源
   */
  static async updateDataSource(id: string, data: UpdateDataSourceRequest): Promise<DataSource> {
    return request({
      url: `/api/v1/datasources/${id}`,
      method: 'PUT',
      data
    })
  }

  /**
   * 删除数据源
   */
  static async deleteDataSource(id: string): Promise<void> {
    return request({
      url: `/api/v1/datasources/${id}`,
      method: 'DELETE'
    })
  }

  /**
   * 测试数据源连接
   */
  static async testConnection(data: ConnectionTestRequest): Promise<ConnectionTestResult> {
    return request({
      url: '/api/v1/datasources/test-connection',
      method: 'POST',
      data
    })
  }

  /**
   * 激活数据源
   */
  static async activateDataSource(id: string): Promise<DataSource> {
    return request({
      url: `/api/v1/datasources/${id}/activate`,
      method: 'POST'
    })
  }

  /**
   * 停用数据源
   */
  static async deactivateDataSource(id: string): Promise<DataSource> {
    return request({
      url: `/api/v1/datasources/${id}/deactivate`,
      method: 'POST'
    })
  }

  /**
   * 获取数据源统计信息
   */
  static async getStatistics(): Promise<DataSourceStatistics> {
    return request({
      url: '/api/v1/datasources/statistics',
      method: 'GET'
    })
  }

  /**
   * 批量删除数据源
   */
  static async batchDelete(ids: string[]): Promise<void> {
    return request({
      url: '/api/v1/datasources/batch-delete',
      method: 'POST',
      data: { ids }
    })
  }

  /**
   * 批量激活数据源
   */
  static async batchActivate(ids: string[]): Promise<void> {
    return request({
      url: '/api/v1/datasources/batch-activate',
      method: 'POST',
      data: { ids }
    })
  }

  /**
   * 批量停用数据源
   */
  static async batchDeactivate(ids: string[]): Promise<void> {
    return request({
      url: '/api/v1/datasources/batch-deactivate',
      method: 'POST',
      data: { ids }
    })
  }

  /**
   * 导出数据源配置
   */
  static async exportConfig(id: string): Promise<Blob> {
    return request({
      url: `/api/v1/datasources/${id}/export`,
      method: 'GET',
      responseType: 'blob'
    })
  }

  /**
   * 导入数据源配置
   */
  static async importConfig(file: File): Promise<DataSource> {
    const formData = new FormData()
    formData.append('file', file)
    
    return request({
      url: '/api/v1/datasources/import',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * 获取数据源类型列表
   */
  static async getDataSourceTypes(): Promise<Array<{ value: string; label: string; icon: string }>> {
    return request({
      url: '/api/v1/datasources/types',
      method: 'GET'
    })
  }

  /**
   * 验证数据源名称是否可用
   */
  static async validateName(name: string, id?: string): Promise<{ valid: boolean; message?: string }> {
    return request({
      url: '/api/v1/datasources/validate-name',
      method: 'POST',
      data: { name, id }
    })
  }

  /**
   * 获取数据源连接状态
   */
  static async getConnectionStatus(id: string): Promise<{ status: string; lastChecked: string; error?: string }> {
    return request({
      url: `/api/v1/datasources/${id}/connection-status`,
      method: 'GET'
    })
  }

  /**
   * 刷新数据源连接状态
   */
  static async refreshConnectionStatus(id: string): Promise<{ status: string; lastChecked: string; error?: string }> {
    return request({
      url: `/api/v1/datasources/${id}/refresh-connection`,
      method: 'POST'
    })
  }

  /**
   * 获取数据源元数据（表、字段等）
   */
  static async getMetadata(id: string, options?: { schema?: string; table?: string }): Promise<any> {
    return request({
      url: `/api/v1/datasources/${id}/metadata`,
      method: 'GET',
      params: options
    })
  }

  /**
   * 执行SQL查询（用于数据预览）
   */
  static async executeQuery(id: string, query: string, options?: { limit?: number }): Promise<any> {
    return request({
      url: `/api/v1/datasources/${id}/query`,
      method: 'POST',
      data: { query, ...options }
    })
  }
}

// 默认导出实例
export default DataSourceApi