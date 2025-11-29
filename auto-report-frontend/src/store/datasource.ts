import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import type { DataSource, DataSourceStatus, DataSourceType, ConnectionTestResult } from '@/types/datasource'

export const useDataSourceStore = defineStore('datasource', () => {
  // 状态
  const dataSources = ref<DataSource[]>([])
  const currentDataSource = ref<DataSource | null>(null)
  const isLoading = ref(false)
  const error = ref<string>('')
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const filters = ref({
    keyword: '',
    types: [] as DataSourceType[],
    statuses: [] as DataSourceStatus[],
    tags: [] as string[],
    sortBy: 'updatedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    viewMode: 'grid' as 'grid' | 'list'
  })

  // 计算属性
  const filteredDataSources = computed(() => {
    let filtered = dataSources.value
    
    // 关键词筛选
    if (filters.value.keyword) {
      const searchLower = filters.value.keyword.toLowerCase()
      filtered = filtered.filter(ds => 
        ds.name.toLowerCase().includes(searchLower) ||
        ds.description?.toLowerCase().includes(searchLower)
      )
    }
    
    // 类型筛选
    if (filters.value.types.length > 0) {
      filtered = filtered.filter(ds => filters.value.types.includes(ds.type))
    }
    
    // 状态筛选
    if (filters.value.statuses.length > 0) {
      filtered = filtered.filter(ds => filters.value.statuses.includes(ds.status))
    }
    
    // 标签筛选
    if (filters.value.tags.length > 0) {
      filtered = filtered.filter(ds => 
        ds.tags && ds.tags.some(tag => filters.value.tags.includes(tag))
      )
    }
    
    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.value.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'createdAt':
          aValue = new Date(a.createdAt || 0)
          bValue = new Date(b.createdAt || 0)
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt || 0)
          bValue = new Date(b.updatedAt || 0)
          break
      }
      
      if (filters.value.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return filtered
  })

  const dataSourceTypes = computed(() => [
    { value: 'MYSQL', label: 'MySQL', icon: 'mysql' },
    { value: 'POSTGRESQL', label: 'PostgreSQL', icon: 'postgresql' },
    { value: 'CLICKHOUSE', label: 'ClickHouse', icon: 'clickhouse' },
    { value: 'ORACLE', label: 'Oracle', icon: 'oracle' },
    { value: 'SQLSERVER', label: 'SQL Server', icon: 'sqlserver' },
    { value: 'REDIS', label: 'Redis', icon: 'redis' },
    { value: 'MONGODB', label: 'MongoDB', icon: 'mongodb' },
    { value: 'ELASTICSEARCH', label: 'Elasticsearch', icon: 'elasticsearch' },
    { value: 'API', label: 'API接口', icon: 'api' },
    { value: 'FILE', label: '文件上传', icon: 'file' }
  ])

  // Actions
  const fetchDataSources = async (params?: {
    page?: number
    pageSize?: number
    keyword?: string
    types?: DataSourceType[]
    statuses?: DataSourceStatus[]
    tags?: string[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    isLoading.value = true
    error.value = ''
    
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      if (params?.keyword) queryParams.append('keyword', params.keyword)
      if (params?.types && params.types.length > 0) {
        params.types.forEach(type => queryParams.append('types', type))
      }
      if (params?.statuses && params.statuses.length > 0) {
        params.statuses.forEach(status => queryParams.append('statuses', status))
      }
      if (params?.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag))
      }
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

      const response = await fetch(`/api/datasources?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${useUserStore().token}`
        }
      })

      if (!response.ok) {
        throw new Error(`获取数据源列表失败: ${response.statusText}`)
      }

      const result = await response.json()
      dataSources.value = result.data.items
      pagination.value = {
        page: result.data.page,
        pageSize: result.data.pageSize,
        total: result.data.total
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取数据源列表失败'
      console.error('获取数据源列表错误:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchDataSourceById = async (id: string) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await fetch(`/api/datasources/${id}`, {
        headers: {
          'Authorization': `Bearer ${useUserStore().token}`
        }
      })

      if (!response.ok) {
        throw new Error(`获取数据源详情失败: ${response.statusText}`)
      }

      const result = await response.json()
      currentDataSource.value = result.data
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取数据源详情失败'
      console.error('获取数据源详情错误:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createDataSource = async (dataSourceData: Partial<DataSource>) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await fetch('/api/datasources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore().token}`
        },
        body: JSON.stringify(dataSourceData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '创建数据源失败')
      }

      const result = await response.json()
      
      // 添加到列表
      dataSources.value.unshift(result.data)
      
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建数据源失败'
      console.error('创建数据源错误:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateDataSource = async (id: string, dataSourceData: Partial<DataSource>) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await fetch(`/api/datasources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore().token}`
        },
        body: JSON.stringify(dataSourceData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '更新数据源失败')
      }

      const result = await response.json()
      
      // 更新列表中的数据
      const index = dataSources.value.findIndex(ds => ds.id === id)
      if (index !== -1) {
        dataSources.value[index] = { ...dataSources.value[index], ...result.data }
      }
      
      // 更新当前数据源
      if (currentDataSource.value?.id === id) {
        currentDataSource.value = { ...currentDataSource.value, ...result.data }
      }
      
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新数据源失败'
      console.error('更新数据源错误:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteDataSource = async (id: string) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await fetch(`/api/datasources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${useUserStore().token}`
        }
      })

      if (!response.ok) {
        throw new Error(`删除数据源失败: ${response.statusText}`)
      }

      // 从列表中移除
      dataSources.value = dataSources.value.filter(ds => ds.id !== id)
      
      // 如果删除的是当前选中的数据源，清空当前数据源
      if (currentDataSource.value?.id === id) {
        currentDataSource.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除数据源失败'
      console.error('删除数据源错误:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const testConnection = async (dataSourceData: Partial<DataSource>): Promise<ConnectionTestResult> => {
    try {
      const response = await fetch('/api/datasources/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore().token}`
        },
        body: JSON.stringify(dataSourceData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '连接测试失败')
      }

      const result = await response.json()
      return result.data
    } catch (err) {
      console.error('连接测试错误:', err)
      throw err
    }
  }

  const activateDataSource = async (id: string) => {
    try {
      const response = await fetch(`/api/datasources/${id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useUserStore().token}`
        }
      })

      if (!response.ok) {
        throw new Error(`激活数据源失败: ${response.statusText}`)
      }

      // 更新状态
      const index = dataSources.value.findIndex(ds => ds.id === id)
      if (index !== -1) {
        dataSources.value[index].status = 'ACTIVE'
      }
      
      if (currentDataSource.value?.id === id) {
        currentDataSource.value.status = 'ACTIVE'
      }
    } catch (err) {
      console.error('激活数据源错误:', err)
      throw err
    }
  }

  const deactivateDataSource = async (id: string) => {
    try {
      const response = await fetch(`/api/datasources/${id}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${useUserStore().token}`
        }
      })

      if (!response.ok) {
        throw new Error(`停用数据源失败: ${response.statusText}`)
      }

      // 更新状态
      const index = dataSources.value.findIndex(ds => ds.id === id)
      if (index !== -1) {
        dataSources.value[index].status = 'INACTIVE'
      }
      
      if (currentDataSource.value?.id === id) {
        currentDataSource.value.status = 'INACTIVE'
      }
    } catch (err) {
      console.error('停用数据源错误:', err)
      throw err
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentDataSource = () => {
    currentDataSource.value = null
  }

  return {
    // 状态
    dataSources,
    currentDataSource,
    isLoading,
    error,
    pagination,
    filters,
    
    // 计算属性
    filteredDataSources,
    dataSourceTypes,
    
    // Actions
    fetchDataSources,
    fetchDataSourceById,
    createDataSource,
    updateDataSource,
    deleteDataSource,
    testConnection,
    activateDataSource,
    deactivateDataSource,
    updateFilters,
    clearError,
    clearCurrentDataSource
  }
})